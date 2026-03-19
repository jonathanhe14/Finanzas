import { supabase } from "../../../lib/supabaseClient";

export function useAccunts() {
  async function getGastosTotalesMes() {
    const { data, error } = await supabase
      .from("v_postings_enriched")
      .select("debit")
      .eq("account_type", "EXPENSE")
      .neq("status", "VOID")
      .gte("entry_date", "2026-03-01")
      .lt("entry_date", "2026-04-01");

    const total = (data ?? []).reduce(
      (sum, r) => sum + Number(r.debit || 0),
      0,
    );
    return { total, error };
  }

  async function addJournalEntry(accountsNames, movement) {
    // 1) Trae IDs de cuentas del usuario logueado
    const { data: accounts, error: accErr } = await supabase
      .from("accounts")
      .select("id,name,type")
      .in("name", accountsNames);

    if (accErr) throw accErr;

    const isExpense = movement.type === "gasto";

    const accountOne = accounts.find(
      (a) => a.name === accountsNames[isExpense ? 1 : 0],
    );
    const accountTwo = accounts.find(
      (a) => a.name === accountsNames[isExpense ? 0 : 1],
    );
    console.log("Cuentas encontradas:", accountOne, accountTwo);
    if (!accountOne || !accountTwo) {
      throw new Error("No se encontraron las cuentas especificadas");
    }
    console.log()
    const [debitTwo, creditTwo, debitOne, creditOne] =
      movement.type === "ingreso" ? [0, movement.amount, movement.amount, 0] : [movement.amount, 0, 0, movement.amount];
     

    // 2) Arma el payload (debe quedar balanceado)
    const payload = {
      entry_date: movement.date,
      description: movement.description,
      merchant_id: movement.merchant_id,
      status: movement.status,
      currency_code: movement.currency_code,
      postings: [
        {
          account_id: String(accountTwo.id),
          debit: debitTwo,
          credit: creditTwo,
          memo: movement.memo,
        },
        {
          account_id: String(accountOne.id),
          debit: debitOne,
          credit: creditOne,
          memo: movement.memo,
        },
      ],
    };
    console.log("Payload para nueva entrada:", payload);
    // 3) RPC
    const { data, error } = await supabase.rpc(
      "create_journal_entry_with_postings",
      {
        payload,
      },
    );

    if (error) throw error;

    return data; // entry_id
  }
  return { addJournalEntry, getGastosTotalesMes };
}
