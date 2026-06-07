import { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, PieChart } from "lucide-react";
import { Sidebar } from "../../../components/Sidebar";
import { MobileMenuButton } from "../../../components/MobileMenuButton";
import { supabase } from "../../../lib/supabaseClient";
import { formatMoney } from "../../../lib/utils/money";
import { useMonthlyTotals, useExpenseByCategory } from "../hooks/useReports";
import { ChartCard } from "../components/ChartCard";

const handleLogout = () => supabase.auth.signOut();

const COLORS = {
  income: "#22C55E",
  expense: "#F43F5E",
  net: "#10B981",
  grid: "rgba(255,255,255,0.06)",
  fore: "#6B7771",
};
const DONUT_PALETTE = ["#F43F5E", "#F59E0B", "#38BDF8", "#14B8A6", "#A78BFA", "#84CC16", "#9AA7A1"];

const MES_CORTO = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const CURRENCY_SYMBOL = { CRC: "₡", USD: "$" };

const PERIODS = [
  { id: 3, label: "3M" },
  { id: 6, label: "6M" },
  { id: 12, label: "12M" },
];

function compact(n) {
  const a = Math.abs(Number(n) || 0);
  if (a >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (a >= 1e3) return Math.round(n / 1e3) + "k";
  return String(Math.round(n));
}

// Construye los últimos `n` meses (incluyendo el actual) como base fija.
function buildMonths(n) {
  const now = new Date();
  const arr = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    arr.push({ key, label: MES_CORTO[d.getMonth()], year: d.getFullYear(), month: d.getMonth() });
  }
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return {
    months: arr,
    from: arr[0].key,
    to: `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, "0")}-01`,
  };
}

function StatTile({ label, value, tone, Icon, hint }) {
  const valueClass =
    tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-primary";
  return (
    <div className="bg-surface border border-default rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-2 text-muted">
        {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2} />}
        <p className="text-caption">{label}</p>
      </div>
      <p className={`amount text-num-md mt-1.5 ${valueClass}`}>{value}</p>
      {hint && <p className="text-[10px] text-muted mt-0.5">{hint}</p>}
    </div>
  );
}

export default function Reportes() {
  const [period, setPeriod] = useState(6);

  const { months, from, to } = useMemo(() => buildMonths(period), [period]);

  const { data: totals = [], isLoading: loadingTotals } = useMonthlyTotals(from, to);
  const { data: byCat = [], isLoading: loadingCat } = useExpenseByCategory(from, to);

  // Monedas presentes (nunca se mezclan). CRC primero por convención.
  const currencies = useMemo(() => {
    const set = new Set();
    totals.forEach((r) => r.currency_code && set.add(r.currency_code));
    byCat.forEach((r) => r.currency_code && set.add(r.currency_code));
    return [...set].sort((a, b) =>
      a === "CRC" ? -1 : b === "CRC" ? 1 : a.localeCompare(b),
    );
  }, [totals, byCat]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const activeCurrency = selectedCurrency ?? currencies[0] ?? "CRC";
  const sym = CURRENCY_SYMBOL[activeCurrency] ?? "";

  // Mezcla la serie del backend (de la moneda activa) con la base fija de meses.
  const series = useMemo(() => {
    const byMonth = {};
    for (const r of totals) {
      if (r.currency_code !== activeCurrency) continue;
      byMonth[String(r.month).slice(0, 10)] = r;
    }
    return months.map((m) => {
      const row = byMonth[m.key];
      const income = Number(row?.income ?? 0);
      const expense = Number(row?.expense ?? 0);
      return { ...m, income, expense, net: income - expense };
    });
  }, [totals, months, activeCurrency]);

  const kpis = useMemo(() => {
    const income = series.reduce((s, m) => s + m.income, 0);
    const expense = series.reduce((s, m) => s + m.expense, 0);
    const net = income - expense;
    const rate = income > 0 ? Math.round((net / income) * 100) : 0;
    return { income, expense, net, rate };
  }, [series]);

  const baseChart = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      background: "transparent",
      foreColor: COLORS.fore,
      fontFamily: "Inter, sans-serif",
      animations: { easing: "easeinout", speed: 500 },
    },
    grid: { borderColor: COLORS.grid, strokeDashArray: 4, padding: { left: 8, right: 8 } },
    dataLabels: { enabled: false },
    legend: { labels: { colors: COLORS.fore }, markers: { radius: 4 } },
    tooltip: { theme: "dark", y: { formatter: (v) => formatMoney(v, activeCurrency) } },
    xaxis: {
      categories: series.map((m) => m.label),
      axisBorder: { color: COLORS.grid },
      axisTicks: { color: COLORS.grid },
      labels: { style: { colors: COLORS.fore, fontSize: "11px" } },
    },
    yaxis: { labels: { formatter: (v) => sym + compact(v), style: { colors: COLORS.fore, fontSize: "11px" } } },
  };

  const incomeExpenseOptions = {
    ...baseChart,
    colors: [COLORS.income, COLORS.expense],
    plotOptions: { bar: { borderRadius: 4, columnWidth: "55%" } },
    fill: { opacity: 0.9 },
  };
  const incomeExpenseSeries = [
    { name: "Ingresos", data: series.map((m) => Math.round(m.income)) },
    { name: "Gastos", data: series.map((m) => Math.round(m.expense)) },
  ];

  const netOptions = {
    ...baseChart,
    colors: [COLORS.net],
    legend: { show: false },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "45%",
        colors: {
          ranges: [
            { from: -1e15, to: -0.0001, color: COLORS.expense },
            { from: 0, to: 1e15, color: COLORS.income },
          ],
        },
      },
    },
  };
  const netSeries = [{ name: "Ahorro neto", data: series.map((m) => Math.round(m.net)) }];

  const donutData = useMemo(() => {
    const top = [...byCat]
      .filter((c) => c.currency_code === activeCurrency)
      .map((c) => ({ name: c.account_name ?? "Sin categoría", value: Number(c.total_expense) }))
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value);
    const head = top.slice(0, 6);
    const restTotal = top.slice(6).reduce((s, c) => s + c.value, 0);
    if (restTotal > 0) head.push({ name: "Otras", value: restTotal });
    return head;
  }, [byCat, activeCurrency]);

  const donutOptions = {
    chart: { background: "transparent", foreColor: COLORS.fore, fontFamily: "Inter, sans-serif" },
    labels: donutData.map((d) => d.name),
    colors: DONUT_PALETTE,
    stroke: { width: 2, colors: ["#141A18"] },
    legend: { position: "bottom", labels: { colors: COLORS.fore }, fontSize: "12px", markers: { radius: 6 } },
    dataLabels: { enabled: true, formatter: (val) => Math.round(val) + "%", style: { fontSize: "11px" } },
    tooltip: { theme: "dark", y: { formatter: (v) => formatMoney(v, activeCurrency) } },
    plotOptions: {
      pie: {
        donut: {
          size: "62%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              color: COLORS.fore,
              formatter: () => formatMoney(donutData.reduce((s, d) => s + d.value, 0), activeCurrency),
            },
          },
        },
      },
    },
  };
  const donutSeries = donutData.map((d) => d.value);

  const hasData = series.some((m) => m.income > 0 || m.expense > 0);
  const isLoading = loadingTotals || loadingCat;

  return (
    <div className="min-h-screen w-full text-primary">
      <Sidebar handleLogout={handleLogout} />

      <div className="md:ml-[64px] flex flex-col min-h-screen">
        <header className="relative min-h-16 glass-panel border-b border-default flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-2.5 sm:py-0 sm:h-16 sticky top-0 z-30">
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent pointer-events-none" />
          <div className="flex items-center gap-2.5">
            <MobileMenuButton />
            <div>
              <h1 className="font-display text-h2 text-primary flex items-center gap-2">
                Reportes
                <span className="w-1 h-1 rounded-full bg-accent shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse-dot" />
              </h1>
              <p className="text-caption text-muted -mt-0.5">Tu situación financiera en el tiempo</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currencies.length > 1 && (
              <div className="flex items-center bg-surface border border-default rounded-md p-0.5">
                {currencies.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCurrency(c)}
                    className={`px-2.5 h-7 rounded-md text-[12px] font-semibold transition-colors duration-base ${
                      activeCurrency === c ? "bg-elevated text-primary" : "text-muted hover:text-primary"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center bg-surface border border-default rounded-md p-0.5">
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id)}
                  className={`px-3 h-7 rounded-md text-[12px] font-semibold transition-colors duration-base ${
                    period === p.id ? "bg-elevated text-primary" : "text-muted hover:text-primary"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto flex-1 animate-fade-up">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <StatTile label="Ingresos" value={formatMoney(kpis.income, activeCurrency)} tone="success" Icon={TrendingUp} hint={`Últimos ${period} meses`} />
            <StatTile label="Gastos" value={formatMoney(kpis.expense, activeCurrency)} tone="danger" Icon={TrendingDown} hint={`Últimos ${period} meses`} />
            <StatTile label="Ahorro neto" value={formatMoney(kpis.net, activeCurrency)} tone={kpis.net >= 0 ? "success" : "danger"} Icon={Wallet} hint="Ingresos − gastos" />
            <StatTile label="Tasa de ahorro" value={`${kpis.rate}%`} tone={kpis.rate >= 0 ? "primary" : "danger"} Icon={PiggyBank} hint="Del total de ingresos" />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <div className="skeleton h-[320px]" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="skeleton h-[300px]" />
                <div className="skeleton h-[300px]" />
              </div>
            </div>
          ) : !hasData ? (
            <div className="bg-elevated border border-dashed border-default rounded-2xl px-6 py-16 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center mb-3 ring-1 ring-inset ring-white/5">
                <PieChart className="w-5 h-5 text-muted" strokeWidth={1.75} />
              </div>
              <p className="text-sm text-primary font-medium">Sin datos en este período</p>
              <p className="text-caption text-muted mt-1">Registra movimientos para ver tus reportes</p>
            </div>
          ) : (
            <div className="space-y-3">
              <ChartCard title="Ingresos vs Gastos" subtitle="Comparativa mensual">
                <Chart options={incomeExpenseOptions} series={incomeExpenseSeries} type="bar" height={300} />
              </ChartCard>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <ChartCard title="Ahorro neto por mes" subtitle="Verde = ahorraste · Rojo = gastaste de más">
                  <Chart options={netOptions} series={netSeries} type="bar" height={280} />
                </ChartCard>

                <ChartCard title="Gasto por categoría" subtitle={`Distribución de los últimos ${period} meses`}>
                  {donutData.length === 0 ? (
                    <div className="h-[280px] flex items-center justify-center text-caption text-muted">
                      Sin gastos en el período
                    </div>
                  ) : (
                    <Chart options={donutOptions} series={donutSeries} type="donut" height={300} />
                  )}
                </ChartCard>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
