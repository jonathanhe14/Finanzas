# Dashboard (/home) — Page Overrides

Override only the differences from `MASTER.md`.

## Layout

- Page header: 56px sticky, `bg-surface/80 backdrop-blur-md`, `border-b border-subtle`.
- Title left: "Dashboard" in `text-h3 tracking-tight`.
- Header right cluster (gap-2.5):
  1. **Month picker** — `bg-faint border border-subtle radius-xl` with `< Mes Año >` (currently static, make functional).
  2. **Search input** — same pill, with magnifier icon + "Buscar…" placeholder (currently a div, make it a real input).
  3. **Primary CTA** — `bg-ink text-white radius-xl` "Nuevo movimiento" with `Plus` icon.

## Grid

Use CSS grid, not nested flex hacks:
```
grid-cols-12 gap-4
- KPI row: col-span-12, sub-grid grid-cols-4 (gap-3)
- Últimos movimientos: col-span-8
- Gastos por categoría: col-span-4
- Presupuesto: col-span-12
```

Mobile: collapse to single column.

## KPI Cards (CardFlujo + CardBalance)

Follow Master §4.1. Specifically for this page:

- **Order:** Gasto del mes (rose) · Ingreso del mes (emerald) · Balance disponible (emerald) · Deuda tarjeta (amber).
- The 4 cards use a consistent vertical rhythm — same height regardless of content.
- Compare-to-previous-month metric (`+12% vs mes pasado`) must use the trend arrow icon AND the percentage color. If data unavailable, show `—` instead of `0%`.

## Últimos Movimientos (CardUltimosMovimientos)

- Section header with title + "Ver todos" link to `/movimientos`.
- Each row uses List Row pattern (Master §4.2).
- Type icon comes from movement type (`gasto`, `ingreso`, `transferencia`) with semantic tint.
- Amount: prefix `−` for gastos (rose), no prefix for ingresos (emerald), transfers show source → dest in muted small text below name.
- Empty state: "Aún no hay movimientos este mes" with CTA "Registrar el primero".

## Gastos por Categoría (CardGastosCategoria)

- Use horizontal bar (Master §10 — no pie/donut for >5 categories).
- Each row: category name + amount + bar fill proportional to share.
- Bar color: `bg-rose-200`, fill `bg-rose-500`.
- Limit to top 6 categories, group rest as "Otros".
- Tooltip on hover with exact value.

## Presupuesto (CardPresupuesto)

- Each row: category, `gastado / presupuestado`, progress bar.
- Bar states:
  - < 80% → emerald
  - 80–99% → amber
  - ≥ 100% → rose
- Show percentage to the right of the bar.

## Loading

- KPIs: skeleton rectangles matching final card size (no spinners).
- Last movements: 5 skeleton rows.
- Categories/Budget: 4 skeleton bars.

## Empty (no data this month)

- KPIs show `₡ 0.00` with `—%` and "Sin movimientos este mes" caption.
- Last movements shows empty state card.
- Gastos por categoría and Presupuesto show empty states.

## Bug fixes to land while redesigning

- Month picker is static text — wire it to state and pass to `useDashboardReport(from, to)`.
- Search button is a `<div>` — make it a real input with debounced filter.
- Hardcoded date `"2026-03-28"` removed (already fixed in `Home.asyncHandleSave`).
- Hardcoded budget array in `Home.jsx` — replace with real budgets hook (future task, mark TODO).
