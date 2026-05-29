# Cuentas (/cuentas) — Page Overrides

Override only the differences from `MASTER.md`.

## Header

- Sticky header same as Dashboard.
- Title: "Cuentas y categorías" (`text-h3`).
- Primary CTA right: dynamic label "Nueva cuenta" or "Nueva categoría" based on active tab.

## Tabs

- Segmented control `bg-faint p-1 radius-xl`, two pills.
- Active pill: `bg-surface text-ink shadow-sm`. Inactive: `text-muted hover:text-ink`.
- 12px/600. Pills `radius-lg px-4 py-1.5`.
- Tab state persists in URL query (e.g. `?tab=categoria`) for shareability.

## Container

- `max-w-4xl mx-auto px-6 py-6`.
- Tabs separated from content with `mb-6`.

## Section blocks (Activos / Pasivos / Gastos / Ingresos)

```
SECTION TITLE                                 count
Subtitle helper text

[List Row]
[List Row]
…
```

- Header: `text-h3 text-ink` + `text-caption text-muted` subtitle. Count right side `text-caption text-muted`.
- Between sections: `space-y-6`.
- Empty section: `bg-faint border-dashed border-subtle radius-2xl px-6 py-10 text-center` with title + hint (no count or CTA — the global CTA already exists in header).

## Account Row

Inherits List Row (Master §4.2):

- Icon container: 40×40 `radius-xl`, semantic tint by type.
- Title 14px/600, type chip beside title (uppercase 10px).
- Right column: amount mono-md + "Saldo inicial" eyebrow caption.
- Hover: shadow + archive button fade-in on right (44×44 ghost icon button).

## Modal (ModalNuevaCuenta)

Follow Master §4.3. Specifically:

- Two modes via prop: `cuenta` and `categoria`.
- Type selector: 2-button grid (radius-xl), active state inverted (dark bg, white text).
- Currency selector and Saldo inicial **only shown for `cuenta` mode** (categories don't need balance/currency choice — they default to project currency).
- Submit button: primary `bg-ink`, label "Crear cuenta" / "Crear categoría".
- Errors shown as `bg-rose-50 border-rose-200 text-rose-600 radius-xl px-3 py-2` above footer.

## Confirmations

- Archive uses native `confirm()` today — upgrade to a small in-app confirm dialog matching modal style. Same shadow/radius, but max-w-360. Two buttons: "Cancelar" (secondary) and "Archivar" (danger semantic, rose).

## Empty state (no accounts at all)

When user has zero accounts AND zero categories:

- Show an onboarding hero in place of the tabs:
  - Title: "Comienza configurando tus cuentas"
  - Subtitle: "Agrega al menos una cuenta y una categoría para registrar movimientos."
  - Two large CTA buttons side by side: "+ Crear cuenta" · "+ Crear categoría".
  - Below: 3 example cards as hints (Efectivo, Tarjeta, Alimentación).

## Mobile

- Tabs and section headers full-width.
- Account rows: stack amount under name on < 480px.
- Archive button always visible on touch (no hover-only).
