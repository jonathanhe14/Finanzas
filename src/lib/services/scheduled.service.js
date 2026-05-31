import { supabase } from "../supabaseClient";
import { advanceByRRule } from "../utils/dates";

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
 * Construye las 2 líneas (débito en la cuenta de gasto, crédito en la cuenta que paga).
 */
function buildPostings(scheduled_id, { expense_account_id, payment_account_id, installment_amount, memo = null }) {
  const amt = Number(installment_amount) || 0;
  return [
    { scheduled_id, account_id: expense_account_id, debit: amt, credit: 0, memo },
    { scheduled_id, account_id: payment_account_id, debit: 0, credit: amt, memo },
  ];
}

/**
 * Crea un gasto fijo: el scheduled_entry + sus 2 scheduled_postings.
 * Rollback manual del entry si fallan los postings (mismo patrón que createMovement).
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
  expense_account_id,
  payment_account_id,
}) {
  if (!name?.trim()) throw new Error("El nombre es obligatorio");
  if (!expense_account_id || !payment_account_id) {
    throw new Error("Faltan la cuenta de gasto o la cuenta que paga");
  }
  if (!installment_amount || Number(installment_amount) <= 0) {
    throw new Error("El monto por cuota debe ser mayor a 0");
  }

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
    })
    .select("id")
    .single();

  if (entryErr) throw entryErr;

  const { error: postErr } = await supabase
    .from("scheduled_postings")
    .insert(buildPostings(entry.id, { expense_account_id, payment_account_id, installment_amount }));

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
  expense_account_id,
  payment_account_id,
}) {
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
    .insert(buildPostings(id, { expense_account_id, payment_account_id, installment_amount }));

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
 * Registra el pago de un gasto fijo: genera un journal_entry real + postings copiando
 * los scheduled_postings, incrementa completed_installments, avanza next_run_date según
 * el rrule, y desactiva el gasto si ya completó todas las cuotas.
 */
export async function postScheduledEntry(scheduled_id, { entry_date } = {}) {
  const { data: sched, error: schedErr } = await supabase
    .from("scheduled_entries")
    .select("*")
    .eq("id", scheduled_id)
    .single();

  if (schedErr) throw schedErr;

  const lines = await getScheduledPostings(scheduled_id);
  if (!lines.length) throw new Error("El gasto fijo no tiene líneas configuradas");

  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData?.user?.id ?? null;

  const date = entry_date || new Date().toISOString().slice(0, 10);

  const { data: entry, error: entryErr } = await supabase
    .from("journal_entries")
    .insert({
      entry_date: date,
      description: sched.name,
      merchant_id: sched.merchant_id ?? null,
      status: "CLEARED",
      currency_code: sched.currency_code,
      user_id,
    })
    .select("id")
    .single();

  if (entryErr) throw entryErr;

  const { error: postErr } = await supabase.from("postings").insert(
    lines.map((l) => ({
      entry_id: entry.id,
      account_id: l.account_id,
      debit: Number(l.debit) || 0,
      credit: Number(l.credit) || 0,
      memo: l.memo ?? null,
      user_id,
    })),
  );

  if (postErr) {
    await supabase.from("journal_entries").delete().eq("id", entry.id);
    throw postErr;
  }

  const completed = (Number(sched.completed_installments) || 0) + 1;
  const done = sched.total_installments != null && completed >= Number(sched.total_installments);

  const { error: bumpErr } = await supabase
    .from("scheduled_entries")
    .update({
      completed_installments: completed,
      next_run_date: advanceByRRule(sched.next_run_date, sched.rrule),
      is_active: !done,
    })
    .eq("id", scheduled_id);

  if (bumpErr) throw bumpErr;

  return entry.id;
}
