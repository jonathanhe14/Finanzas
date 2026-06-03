import { supabase } from "../supabaseClient";

export async function listAccounts() {
  const { data, error } = await supabase
    .from("accounts")
    .select("id, name, type, currency_code, parent_id, opening_balance, is_archived")
    .eq("is_archived", false)
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Saldo actual por cuenta (desde la vista v_account_balances, ya filtrada por RLS).
 * Devuelve un mapa { [account_id]: balance }.
 */
export async function getAccountBalances() {
  const { data, error } = await supabase
    .from("v_account_balances")
    .select("account_id, balance");

  if (error) throw error;
  const map = {};
  for (const row of data ?? []) map[row.account_id] = Number(row.balance) || 0;
  return map;
}

export async function listCurrencies() {
  const { data, error } = await supabase
    .from("currencies")
    .select("code, name, symbol")
    .order("code", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createAccount({ name, type, currency_code, opening_balance = 0, parent_id = null }) {
  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData?.user?.id ?? null;

  const payload = {
    name: name.trim(),
    type,
    currency_code,
    opening_balance: Number(opening_balance) || 0,
    parent_id,
    user_id,
  };

  const { data, error } = await supabase
    .from("accounts")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function archiveAccount(id) {
  const { error } = await supabase
    .from("accounts")
    .update({ is_archived: true })
    .eq("id", id);

  if (error) throw error;
}
