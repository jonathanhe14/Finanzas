import { supabase } from "../supabaseClient";

/**
 * Trae el presupuesto recurrente mensual del usuario (period = 'monthly')
 * junto con sus líneas por categoría. Devuelve null si todavía no existe.
 */
export async function getMonthlyBudget() {
  const { data: budget, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("period", "monthly")
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!budget) return null;

  const { data: lines, error: lineErr } = await supabase
    .from("budget_lines")
    .select("*")
    .eq("budget_id", budget.id);

  if (lineErr) throw lineErr;
  return { ...budget, budget_line: lines ?? [] };
}

/**
 * Suma lo gastado por categoría (cuentas EXPENSE) en el rango [fromDate, toDate).
 * Devuelve un mapa { [account_id]: totalGastado }.
 */
export async function getExpenseSpent(fromDate, toDate) {
  const { data, error } = await supabase
    .from("v_postings_enriched")
    .select("account_id, debit")
    .eq("account_type", "EXPENSE")
    .neq("status", "VOID")
    .gte("entry_date", fromDate)
    .lt("entry_date", toDate);

  if (error) throw error;

  const spentByAccount = {};
  for (const row of data ?? []) {
    const id = row.account_id;
    spentByAccount[id] = (spentByAccount[id] ?? 0) + Number(row.debit || 0);
  }
  return spentByAccount;
}

/**
 * Crea (upsert) la línea de presupuesto de una categoría con su límite.
 */
export async function upsertBudgetLine({ budget_id, account_id, limit_amount }) {
  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData?.user?.id ?? null;

  const { data, error } = await supabase
    .from("budget_lines")
    .upsert(
      { budget_id, account_id, limit_amount: Number(limit_amount) || 0, user_id },
      { onConflict: "budget_id,account_id" },
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Crea el presupuesto recurrente mensual del usuario si aún no existe.
 */
export async function createMonthlyBudget() {
  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData?.user?.id ?? null;

  const payload = {
    name: "Presupuesto mensual",
    period: "monthly",
    start_date: new Date().toISOString().slice(0, 10),
    end_date: null,
    rollover: false,
    user_id,
  };

  const { data, error } = await supabase
    .from("budgets")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return { ...data, budget_line: [] };
}
