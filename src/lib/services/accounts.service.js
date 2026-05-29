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
