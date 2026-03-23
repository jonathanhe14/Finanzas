import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SECRET_KEY = Deno.env.get("SHORTCUT_SECRET_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const USER_ID = Deno.env.get("APP_USER_ID") ?? "";

Deno.serve(async (req) => {
  // 1. Verificar método
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // 2. Verificar clave secreta
  const secret = req.headers.get("x-secret-key");
  if (!secret || secret !== SECRET_KEY) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 3. Parsear body
  const body = await req.json();
  const { tipo, monto, descripcion, categoria, cuenta, cuentaOrigen, cuentaDestino } = body;

  if (!tipo || !monto) {
    return new Response(
      JSON.stringify({ error: "tipo y monto son requeridos" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // 4. Crear cliente con service_role (bypasea RLS)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // 5. Buscar IDs de cuentas por nombre
  const accountNames = tipo === "transferencia"
    ? [cuentaOrigen, cuentaDestino]
    : tipo === "gasto"
    ? [cuenta, categoria]
    : [cuenta, categoria]; // ingreso

  const { data: accounts, error: accErr } = await supabase
    .from("accounts")
    .select("id, name, type")
    .eq("user_id", USER_ID)
    .in("name", accountNames);

  if (accErr) {
    return new Response(
      JSON.stringify({ error: accErr.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // 6. Armar postings según tipo
  const today = new Date().toISOString().slice(0, 10);
  let postings = [];

  if (tipo === "gasto") {
    const cuentaPago = accounts.find((a) => a.name === cuenta);
    const categoriaAcc = accounts.find((a) => a.name === categoria);
    if (!cuentaPago || !categoriaAcc) {
      return new Response(
        JSON.stringify({ error: "Cuenta o categoría no encontrada" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    postings = [
      { account_id: String(categoriaAcc.id), debit: monto, credit: 0, memo: descripcion ?? "" },
      { account_id: String(cuentaPago.id),   debit: 0, credit: monto, memo: descripcion ?? "" },
    ];
  } else if (tipo === "ingreso") {
    const cuentaAcc   = accounts.find((a) => a.name === cuenta);
    const categoriaAcc = accounts.find((a) => a.name === categoria);
    if (!cuentaAcc || !categoriaAcc) {
      return new Response(
        JSON.stringify({ error: "Cuenta o categoría no encontrada" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    postings = [
      { account_id: String(cuentaAcc.id),    debit: monto, credit: 0,     memo: descripcion ?? "" },
      { account_id: String(categoriaAcc.id), debit: 0,     credit: monto, memo: descripcion ?? "" },
    ];
  } else if (tipo === "transferencia") {
    const origen  = accounts.find((a) => a.name === cuentaOrigen);
    const destino = accounts.find((a) => a.name === cuentaDestino);
    if (!origen || !destino) {
      return new Response(
        JSON.stringify({ error: "Cuentas de transferencia no encontradas" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    postings = [
      { account_id: String(destino.id), debit: monto, credit: 0,     memo: descripcion ?? "" },
      { account_id: String(origen.id),  debit: 0,     credit: monto, memo: descripcion ?? "" },
    ];
  }

  // 7. Llamar a la RPC
  const payload = {
    entry_date:    today,
    description:   descripcion ?? tipo,
    merchant_id:   null,
    status:        "CLEARED",
    currency_code: "CRC",
    postings,
  };

const { data, error } = await supabase.rpc(
  "create_journal_entry_service",
  { p_user_id: USER_ID, payload }
);
  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ ok: true, entry_id: data }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});


