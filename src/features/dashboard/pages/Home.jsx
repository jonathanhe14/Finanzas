import { CardFlujo } from "../components/CardFlujo";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAccunts } from "../hooks/useAccounts";
import { Sidebar } from "../../../components/Sidebar";
import { Plus, Search, ChevronRight, ChevronLeft } from "lucide-react";
import { CardBalance } from "../components/CardBalance";
import { CardUltimosMovimientos } from "../components/CardUltimosMovimientos";
import { CardGastosCategoria } from "../components/CardGastosCategoria";
import {CardPresupuesto} from "../components/CardPresupuesto";

const handleLogout = () => {
  console.log("Usuario ha cerrado sesión");
  supabase.auth.signOut();
};

function Home() {
  const [status, setStatus] = useState("idle");
  const [entryId, setEntryId] = useState(null);
  const [error, setError] = useState(null);
  const { getAccountIdsByNames, getGastosTotalesMes } = useAccunts();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!supabase.auth.getUser()) {
      console.log("No hay usuario autenticado");
      navigate("/login");
    }
    console.log("Usuario autenticado:", supabase.auth.getUser());
    getGastosTotalesMes().then(({ total, error }) => {
      if (error) {
        console.error("Error al obtener gastos totales del mes:", error);
      } else {
        console.log("Gastos totales del mes:", total);
      }
    });
  }, [navigate]);

  const handleProbar = async () => {
    setStatus("loading");
    setError(null);
    setEntryId(null);
    const accountNames = ["Wink", "Comida"];
    try {
      console.log("Intentando crear entrada con cuentas:", accountNames);
      const newEntryId = await getAccountIdsByNames(accountNames);
      setEntryId(newEntryId);
      setStatus("success");
      console.log("Entrada creada con ID:", newEntryId);
    } catch (e) {
      setError(e.message || String(e));
      setStatus("error");
    }
  };
  const ultimosMovimientos = [
    {
      nombre: "Compra en Supermercado",
      fecha: "2026-03-28",
      tipo: "gasto",
      monto: 15000,
    },
    { nombre: "Salario", fecha: "2026-03-25", tipo: "ingreso", monto: 350000 },
    {
      nombre: "Transferencia a Ahorros",
      fecha: "2026-03-20",
      tipo: "transferencia",
      monto: 2000,
    },
    { nombre: "Comida Uber", fecha: "2026-03-28", tipo: "gasto", monto: 5500 },
    { nombre: "Audifonos", fecha: "2026-03-28", tipo: "gasto", monto: 30000 },
  ];

  return (
    <div className="min-h-screen flex text-ink text-sm w-full">
      <Sidebar handleLogout={handleLogout} />
      <div className="ml-[200px] flex-1 flex flex-col min-h-screen">
        <header className="h-14 bg-white/80 backdrop-blur-md border-b border-border flex items-center justify-between px-7 sticky top-0 z-10 ">
          <h1 className="font-semibold text-[15px] tracking-tight">
            Dashboard
          </h1>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-faint border border-border rounded-xl px-3 py-[7px] text-[12px] font-medium">
              <button className="text-muted hover:text-ink transition-colors">
                <ChevronLeft className="w-4 h-4" color="black" />
              </button>
              <span className="px-1 text-[13px]">Marzo 2026</span>
              <button className="text-muted hover:text-ink transition-colors">
                <ChevronRight className="w-4 h-4" color="black" />
              </button>
            </div>

            <div className="flex items-center gap-2 bg-faint border border-border rounded-xl px-3 py-[7px] text-[12px] text-muted w-36">
              <Search className="w-3.5 h-3.5" color="black" />
              Buscar…
            </div>

            <button className="bg-ink text-white text-[12px] font-medium rounded-xl px-4 py-[7px] flex items-center gap-1.5 hover:bg-ink/80 transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5" color="white" />
              Nuevo movimiento
            </button>
          </div>
        </header>
        <div
          className="p-6 grid gap-4"
          style={{
            gridTemplateColumns: "1fr 1fr 1fr 292px",
            gridTemplateRows: "auto auto auto",
          }}
        >
          {/* Aqui dentro van los cards */}
          <div className="col-span-3 grid grid-cols-4 gap-3">
            <CardFlujo
              trending={"up"}
              nombre="Gasto del mes"
              saldo={3450.0}
              porcentaje={8.5}
              descripcion="vs mes pasado"
            />
            <CardFlujo
              trending={"down"}
              nombre="Ingreso del mes"
              saldo={5000.0}
              porcentaje={-2.3}
              descripcion="vs mes pasado"
            />
            <CardBalance
              nombre="Balance Disponible"
              saldo={12500.0}
              tipo="ASSET"
              detalles="Disponible para gastar"
            />
            <CardBalance
              nombre="Deuda de Tarjeta"
              saldo={3450.0}
              tipo="LIABILITY"
              detalles="Proximo pago 15 de Abril"
            />
          </div>
          <CardUltimosMovimientos movimientos={ultimosMovimientos} />
          <CardGastosCategoria
            categorias={{
              Alimentación: 450,
              Transporte: 200,
              Entretenimiento: 150,
              Salud: 100,
              Ropa: 80,
            }}
          />
          <CardPresupuesto
            presupuestos={[
              { categoria: "Alimentación", gastado: 320, presupuestado: 450 },
              { categoria: "Transporte", gastado: 210, presupuestado: 200 },
              { categoria: "Entretenimiento", gastado: 80, presupuestado: 100 },
              { categoria: "Salud", gastado: 175, presupuestado: 180 },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export default Home;
