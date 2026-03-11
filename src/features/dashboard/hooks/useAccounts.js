import { useState, useEffect, useMemo } from "react";
import { supabase } from '../../../lib/supabaseClient';

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

  async function getAccountIdsByNames(accountsNames) {
    // 1) Trae IDs de cuentas del usuario logueado
    const { data: accounts, error: accErr } = await supabase
      .from("accounts")
      .select("id,name,type")
      .in("name", accountsNames);

    if (accErr) throw accErr;

    const wink = accounts.find((a) => a.name === "Wink");
    const comida = accounts.find((a) => a.name === "Comida");
    console.log("wink:", wink);
    console.log("categoria:", comida);

    if (!wink || !comida) {
      throw new Error(
        "Faltan cuentas Wink o Comida (y deben tener user_id correcto)",
      );
    }

    // 2) Arma el payload (debe quedar balanceado)
    const payload = {
      entry_date: "2026-03-02",
      description: "Comida",
      merchant_id: "",
      status: "CLEARED",
      currency_code: "CRC",
      postings: [
        {
          account_id: String(comida.id),
          debit: 12500,
          credit: 0,
          memo: "Gasto comida",
        },
        {
          account_id: String(wink.id),
          debit: 0,
          credit: 12500,
          memo: "Pago con Wink",
        },
      ],
    };

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
  return { getAccountIdsByNames, getGastosTotalesMes };
}
