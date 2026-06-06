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
 * Lista TODOS los movimientos en el rango [from, to) (sin límite), vía el RPC
 * `report_movements`. Mismas columnas que `get_recent_entries` (incluye
 * origen/destino). Pensado para exportar a CSV.
 */
export async function listMovementsByRange(from, to) {
  const { data, error } = await supabase.rpc("report_movements", {
    p_from: from,
    p_to: to,
  });

  if (error) throw error;
  return (data ?? []).map((row) => ({ ...row, id: row.entry_id }));
}

/**
 * Construye los 2 postings balanceados (double-entry) de un movimiento.
 * Por convención:
 *  - debit_account_id: cuenta que recibe (suma para ASSET/EXPENSE)
 *  - credit_account_id: cuenta que entrega (suma para LIABILITY/INCOME)
 * Los account_id se mandan como string porque los RPC los castean a bigint.
 */
function buildPostings({ debit_account_id, credit_account_id, amount, memo = null }) {
  const amt = Number(amount);
  return [
    { account_id: String(debit_account_id), debit: amt, credit: 0, memo },
    { account_id: String(credit_account_id), debit: 0, credit: amt, memo },
  ];
}

/**
 * Crea un journal_entry con dos postings balanceados (double-entry).
 * Única vía: el RPC atómico `create_journal_entry_with_postings`, que valida
 * que las cuentas sean del usuario, que la moneda coincida y que el asiento
 * balancee — todo dentro de una transacción del lado de Postgres.
 * Las etiquetas se aplican aparte: este RPC no las maneja.
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

  const payload = {
    entry_date,
    description,
    merchant_id,
    status,
    currency_code,
    postings: buildPostings({ debit_account_id, credit_account_id, amount, memo }),
  };

  const { data: entryId, error } = await supabase.rpc(
    "create_journal_entry_with_postings",
    { payload },
  );

  if (error) throw error;

  if (Array.isArray(tags)) await setEntryTags(entryId, tags);

  return entryId;
}

/**
 * "Reconocer ganancia": reclasifica un monto de un pasivo (dinero ajeno) a un
 * ingreso propio, sin mover dinero entre cuentas (ningún ASSET cambia).
 * Vía el RPC `reconocer_ganancia`, que genera los 2 postings con la convención
 * INVERSA a un ingreso normal (débito al pasivo, crédito al ingreso), valida
 * tipos/moneda y que el monto no exceda el saldo de la deuda.
 * Devuelve { entry_id, monto, saldo_deuda_restante }.
 */
export async function reconocerGanancia({
  amount,
  liability_account_id,
  income_account_id,
  entry_date = null,
  description = null,
}) {
  if (!liability_account_id || !income_account_id) {
    throw new Error("Faltan la cuenta de origen (pasivo) o destino (ingreso)");
  }
  if (!amount || Number(amount) <= 0) {
    throw new Error("El monto debe ser mayor a 0");
  }

  const { data, error } = await supabase.rpc("reconocer_ganancia", {
    p_monto: Number(amount),
    p_liability_account_id: Number(liability_account_id),
    p_income_account_id: Number(income_account_id),
    p_entry_date: entry_date ?? new Date().toISOString().slice(0, 10),
    p_description: description?.trim() || "Reconocimiento de ganancia",
  });

  if (error) throw error;
  return data;
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
 * Actualiza un movimiento de forma atómica vía el RPC `update_journal_entry`,
 * que reescribe cabecera, postings y etiquetas en una sola transacción y
 * verifica que el asiento pertenezca al usuario.
 * `merchant_id` y `status` se reciben para no sobrescribir con null los valores
 * existentes (el RPC hace UPDATE de esas columnas).
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
  merchant_id = null,
  status = "CLEARED",
  fx_rate = null,
  tags,
}) {
  if (!id) throw new Error("Falta el id del movimiento");
  if (!debit_account_id || !credit_account_id) {
    throw new Error("Faltan las cuentas de débito o crédito");
  }
  if (!amount || Number(amount) <= 0) {
    throw new Error("El monto debe ser mayor a 0");
  }

  const { error } = await supabase.rpc("update_journal_entry", {
    p_entry_id: id,
    p_entry_date: entry_date,
    p_description: description,
    p_merchant_id: merchant_id,
    p_status: status,
    p_currency_code: currency_code,
    p_fx_rate: fx_rate,
    p_postings: buildPostings({ debit_account_id, credit_account_id, amount, memo }),
    p_tag_ids: Array.isArray(tags) ? tags.map(Number).filter(Boolean) : [],
  });

  if (error) throw error;

  return id;
}

/**
 * Elimina un movimiento de forma atómica vía el RPC `delete_journal_entry`,
 * que borra etiquetas, postings y cabecera y verifica la propiedad del asiento.
 */
export async function deleteMovement(id) {
  const { error } = await supabase.rpc("delete_journal_entry", { p_entry_id: id });
  if (error) throw error;
}
