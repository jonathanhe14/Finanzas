import { supabase } from "../supabaseClient";

export async function listTags() {
  const { data, error } = await supabase
    .from("tags")
    .select("id, name")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createTag(name) {
  if (!name?.trim()) throw new Error("La etiqueta necesita un nombre");
  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData?.user?.id ?? null;
  const { data, error } = await supabase
    .from("tags")
    .insert({ name: name.trim(), user_id })
    .select("id, name")
    .single();
  if (error) throw error;
  return data;
}

/** Reemplaza el conjunto de etiquetas de un movimiento (delete + insert). */
export async function setEntryTags(entryId, tagIds) {
  const { error: delErr } = await supabase
    .from("entry_tags")
    .delete()
    .eq("entry_id", entryId);
  if (delErr) throw delErr;

  const ids = (tagIds ?? []).map(Number).filter(Boolean);
  if (ids.length === 0) return;

  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData?.user?.id ?? null;
  const rows = ids.map((tag_id) => ({ entry_id: entryId, tag_id, user_id }));
  const { error } = await supabase.from("entry_tags").insert(rows);
  if (error) throw error;
}
