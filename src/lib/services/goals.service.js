import { supabase } from "../supabaseClient";

/**
 * Lista las metas de ahorro activas del usuario, más próximas a vencer primero.
 */
export async function listGoals() {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("is_active", true)
    .order("due_date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createGoal({
  name,
  description = null,
  currency_code = "CRC",
  target_amount,
  start_date,
  due_date,
  linked_account_id = null,
}) {
  if (!name?.trim()) throw new Error("El nombre es obligatorio");
  if (!target_amount || Number(target_amount) <= 0) {
    throw new Error("El monto objetivo debe ser mayor a 0");
  }
  if (!due_date) throw new Error("La fecha objetivo es obligatoria");

  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData?.user?.id ?? null;

  const { data, error } = await supabase
    .from("goals")
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      currency_code,
      target_amount: Number(target_amount),
      start_date: start_date || new Date().toISOString().slice(0, 10),
      due_date,
      linked_account_id: linked_account_id ? Number(linked_account_id) : null,
      is_active: true,
      user_id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateGoal(id, {
  name,
  description = null,
  currency_code,
  target_amount,
  start_date,
  due_date,
  linked_account_id = null,
}) {
  if (!id) throw new Error("Falta el id de la meta");

  const { error } = await supabase
    .from("goals")
    .update({
      name: name?.trim(),
      description: description?.trim() || null,
      currency_code,
      target_amount: Number(target_amount),
      start_date,
      due_date,
      linked_account_id: linked_account_id ? Number(linked_account_id) : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
  return id;
}

/** Marca una meta como inactiva (completada / archivada). */
export async function setGoalActive(id, is_active) {
  const { error } = await supabase
    .from("goals")
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteGoal(id) {
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw error;
}
