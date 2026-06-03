import { supabase } from "../supabaseClient";
import { setEntryTags } from "./tags.service";

/**
 * Lista los movimientos del usuario (más recientes primero).
 * Reutiliza el RPC `get_recent_entries`, que ya calcula el campo `tipo`
 * (gasto / ingreso / transferencia) y devuelve los datos enriquecidos.
 */
export async function listMovements(limit = 200) {
  const { data, error } = await supabase.rpc("get_recent_entries", {
    p_limit: limit,
  });

  if (error) throw error;
  // El RPC devuelve `entry_id`; exponemos también `id` para que la UI
  // (editar/borrar, keys de React) pueda identificar cada movimiento.
  return (data ?? []).map((row) => ({ ...row, id: row.entry_id }));
}

/**
 * Crea un journal_entry con dos postings balanceados (double-entry).
 * Por convención:
 *  - debitAccountId: cuenta que recibe (suma para ASSET/EXPENSE)
 *  - creditAccountId: cuenta que entrega (suma para LIABILITY/INCOME)
 */
export async function createMovement({
  entry_date,
  description,
  amount,
  currency_code = "CRC",
  debit_account_id,
  credit_account_id,
  memo = null,
  merchant_id = null,
  status = "CLEARED",
  tags,
}) {
  if (!debit_account_id || !credit_account_id) {
    throw new Error("Faltan las cuentas de débito o crédito");
  }
  if (!amount || Number(amount) <= 0) {
    throw new Error("El monto debe ser mayor a 0");
  }

  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData?.user?.id ?? null;

  const { data: entry, error: entryErr } = await supabase
    .from("journal_entries")
    .insert({
      entry_date,
      description,
      merchant_id,
      status,
      currency_code,
      user_id,
    })
    .select("id")
    .single();

  if (entryErr) throw entryErr;

  const amt = Number(amount);
  const { error: postErr } = await supabase.from("postings").insert([
    {
      entry_id: entry.id,
      account_id: debit_account_id,
      debit: amt,
      credit: 0,
      memo,
      user_id,
    },
    {
      entry_id: entry.id,
      account_id: credit_account_id,
      debit: 0,
      credit: amt,
      memo,
      user_id,
    },
  ]);

  if (postErr) {
    await supabase.from("journal_entries").delete().eq("id", entry.id);
    throw postErr;
  }

  if (Array.isArray(tags)) await setEntryTags(entry.id, tags);

  return entry.id;
}

/**
 * Trae el detalle de un movimiento para editarlo: la cabecera + sus 2 postings,
 * resueltos a { amount, debit_account_id, credit_account_id }.
 */
export async function getMovementDetail(entryId) {
  const { data: entry, error: entryErr } = await supabase
    .from("journal_entries")
    .select("id, entry_date, description, currency_code, merchant_id")
    .eq("id", entryId)
    .single();

  if (entryErr) throw entryErr;

  const { data: posts, error: postErr } = await supabase
    .from("postings")
    .select("account_id, debit, credit, memo")
    .eq("entry_id", entryId);

  if (postErr) throw postErr;

  const debitPost = (posts ?? []).find((p) => Number(p.debit) > 0);
  const creditPost = (posts ?? []).find((p) => Number(p.credit) > 0);

  return {
    id: entry.id,
    entry_date: entry.entry_date,
    description: entry.description,
    currency_code: entry.currency_code,
    merchant_id: entry.merchant_id,
    memo: debitPost?.memo ?? creditPost?.memo ?? null,
    amount: Number(debitPost?.debit ?? creditPost?.credit ?? 0),
    debit_account_id: debitPost?.account_id ?? null,
    credit_account_id: creditPost?.account_id ?? null,
  };
}

/**
 * Actualiza un movimiento: la cabecera y reescribe sus 2 postings (delete + insert).
 */
export async function updateMovement({
  id,
  entry_date,
  description,
  amount,
  currency_code = "CRC",
  debit_account_id,
  credit_account_id,
  memo = null,
  tags,
}) {
  if (!id) throw new Error("Falta el id del movimiento");
  if (!debit_account_id || !credit_account_id) {
    throw new Error("Faltan las cuentas de débito o crédito");
  }
  if (!amount || Number(amount) <= 0) {
    throw new Error("El monto debe ser mayor a 0");
  }

  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData?.user?.id ?? null;

  const { error: updErr } = await supabase
    .from("journal_entries")
    .update({ entry_date, description, currency_code })
    .eq("id", id);

  if (updErr) throw updErr;

  const { error: delErr } = await supabase.from("postings").delete().eq("entry_id", id);
  if (delErr) throw delErr;

  const amt = Number(amount);
  const { error: insErr } = await supabase.from("postings").insert([
    { entry_id: id, account_id: debit_account_id, debit: amt, credit: 0, memo, user_id },
    { entry_id: id, account_id: credit_account_id, debit: 0, credit: amt, memo, user_id },
  ]);

  if (insErr) throw insErr;

  if (Array.isArray(tags)) await setEntryTags(id, tags);

  return id;
}

/**
 * Elimina un movimiento: primero sus postings, luego la cabecera.
 */
export async function deleteMovement(id) {
  const { error: postErr } = await supabase.from("postings").delete().eq("entry_id", id);
  if (postErr) throw postErr;

  const { error } = await supabase.from("journal_entries").delete().eq("id", id);
  if (error) throw error;
}
