import { supabase } from "../supabaseClient";

/**
 * Lista los gastos fijos activos del usuario, ordenados por próxima fecha de pago.
 * Sólo devuelve los campos del `scheduled_entry`; los postings se piden aparte.
 */
export async function listScheduledEntries() {
  const { data, error } = await supabase
    .from("scheduled_entries")
    .select("*")
    .eq("is_active", true)
    .order("next_run_date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Trae los 2 scheduled_postings (débito gasto / crédito cuenta que paga) de un gasto fijo.
 */
export async function getScheduledPostings(scheduled_id) {
  const { data, error } = await supabase
    .from("scheduled_postings")
    .select("*")
    .eq("scheduled_id", scheduled_id);

  if (error) throw error;
  return data ?? [];
}

/**
 * Plantilla del asiento: SOLO la pata destino (la cuenta de gasto, o el pasivo
 * a reducir en un préstamo), con débito = monto de la cuota. La pata de la
 * cuenta que paga NO se guarda aquí: la agrega el RPC `pay_scheduled_entry` al
 * registrar el pago, con la cuenta que elige el usuario en ese momento.
 */
function buildPostings(scheduled_id, { destination_account_id, installment_amount, memo = null }, user_id = null) {
  const amt = Number(installment_amount) || 0;
  return [
    { scheduled_id, account_id: destination_account_id, debit: amt, credit: 0, memo, user_id },
  ];
}

/**
 * Crea un gasto fijo: el scheduled_entry + sus 2 scheduled_postings.
 * Estas son tablas de PLANTILLA (no el ledger), por eso no pasan por el RPC de
 * asientos; el rollback manual cubre el caso de que fallen los postings.
 */
export async function createScheduledEntry({
  name,
  type,
  currency_code = "CRC",
  installment_amount,
  total_amount = null,
  total_installments = null,
  start_date,
  next_run_date,
  rrule = "FREQ=MONTHLY",
  merchant_id = null,
  description = null,
  destination_account_id,
}) {
  if (!name?.trim()) throw new Error("El nombre es obligatorio");
  if (!destination_account_id) {
    throw new Error("Falta la cuenta de destino (gasto o pasivo)");
  }
  if (!installment_amount || Number(installment_amount) <= 0) {
    throw new Error("El monto por cuota debe ser mayor a 0");
  }

  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData?.user?.id ?? null;

  const { data: entry, error: entryErr } = await supabase
    .from("scheduled_entries")
    .insert({
      name: name.trim(),
      type,
      is_active: true,
      start_date,
      rrule,
      next_run_date,
      merchant_id,
      description,
      currency_code,
      total_installments: total_installments == null ? null : Number(total_installments),
      completed_installments: 0,
      installment_amount: Number(installment_amount),
      total_amount: total_amount == null || total_amount === "" ? null : Number(total_amount),
      user_id,
    })
    .select("id")
    .single();

  if (entryErr) throw entryErr;

  const { error: postErr } = await supabase
    .from("scheduled_postings")
    .insert(buildPostings(entry.id, { destination_account_id, installment_amount }, user_id));

  if (postErr) {
    await supabase.from("scheduled_entries").delete().eq("id", entry.id);
    throw postErr;
  }

  return entry.id;
}

/**
 * Actualiza un gasto fijo y reescribe sus 2 postings (delete + insert).
 */
export async function updateScheduledEntry(id, {
  name,
  type,
  currency_code,
  installment_amount,
  total_amount = null,
  total_installments = null,
  next_run_date,
  rrule,
  merchant_id = null,
  description = null,
  destination_account_id,
}) {
  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData?.user?.id ?? null;

  const { error: updErr } = await supabase
    .from("scheduled_entries")
    .update({
      name: name?.trim(),
      type,
      currency_code,
      next_run_date,
      rrule,
      merchant_id,
      description,
      total_installments: total_installments == null ? null : Number(total_installments),
      installment_amount: Number(installment_amount),
      total_amount: total_amount == null || total_amount === "" ? null : Number(total_amount),
    })
    .eq("id", id);

  if (updErr) throw updErr;

  const { error: delErr } = await supabase
    .from("scheduled_postings")
    .delete()
    .eq("scheduled_id", id);

  if (delErr) throw delErr;

  const { error: insErr } = await supabase
    .from("scheduled_postings")
    .insert(buildPostings(id, { destination_account_id, installment_amount }, user_id));

  if (insErr) throw insErr;

  return id;
}

/**
 * Pausa / reactiva un gasto fijo (el botón "eliminar" lo pausa, no borra historial).
 */
export async function setScheduledActive(id, is_active) {
  const { error } = await supabase
    .from("scheduled_entries")
    .update({ is_active })
    .eq("id", id);

  if (error) throw error;
}

/**
 * Registra el pago de un gasto/pago fijo de forma ATÓMICA vía el RPC
 * `pay_scheduled_entry`: genera el asiento de partida doble (agregando la pata
 * de la cuenta de pago elegida por el usuario), avanza la recurrencia y maneja
 * las cuotas. El front no replica nada de la lógica contable.
 *
 * `from_account_id` (la cuenta desde la que se paga) la elige SIEMPRE el usuario.
 * Devuelve { entry_id, amount, next_run_date, completed_installments, is_active }.
 * El RPC es idempotente: reintentar la misma cuota lanza el código Postgres 23505.
 */
export async function payScheduledEntry(scheduled_id, from_account_id, { entry_date = null } = {}) {
  if (!from_account_id) throw new Error("Elegí la cuenta desde la que se paga");

  // OJO: no mandar p_entry_date = null. El RPC usa la fecha tal cual (sin coalesce),
  // así que un null rompería el asiento. Omitirlo deja que aplique su default
  // CURRENT_DATE; sólo lo incluimos si el usuario dio una fecha explícita.
  const params = { p_id: scheduled_id, p_from_account_id: from_account_id };
  if (entry_date) params.p_entry_date = entry_date;

  const { data, error } = await supabase.rpc("pay_scheduled_entry", params);

  if (error) throw error;
  return data;
}
