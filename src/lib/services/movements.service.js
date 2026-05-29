import { supabase } from "../supabaseClient";

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

  return entry.id;
}
