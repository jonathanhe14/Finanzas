# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server at http://localhost:5173
npm run build     # Production build
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

There are no tests in this project.

## Environment Setup

Create a `.env` file at the root with:

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

## Architecture

**React 19 + Vite SPA** backed by **Supabase** (PostgreSQL + Auth + Edge Functions). Deployed on Vercel with a SPA rewrite rule.

### Routing & Auth (`src/App.jsx`)

`onAuthStateChange` drives all navigation: unauthenticated sessions redirect to `/login`, authenticated ones to `/home`. Routes are flat — `/presupuesto` and `/cuentas` both render `<Home>` (not yet split out into separate pages).

### Data Layer

All Supabase queries go through one of two patterns:

1. **React Query hooks** (preferred, used by the dashboard): hooks in `src/features/dashboard/hooks/` call services in `src/lib/services/`, which call Supabase RPCs. Query keys are centralized in `src/lib/constants/queryKeys.js`.
2. **Plain hooks with `useState`** (legacy, used by `MovimientosA`): `src/features/dashboard/hooks/useRegistros.js` manages its own loading/error state and hits the `registros` table directly.

The Supabase client is a singleton at `src/lib/supabaseClient.js`.

### Database Model (double-entry accounting)

The backend uses a double-entry ledger. Every financial event is a `journal_entry` with two or more `postings` (debit + credit). The frontend never writes to these tables directly — it always calls the RPC `create_journal_entry_with_postings` (from the app) or `create_journal_entry_service` (from the Edge Function).

Key read surfaces:
- `v_postings_enriched` — postings joined with account/entry/merchant data
- `v_account_balances` — current balance per account
- `report_dashboard(from_date, to_date)` — single RPC returning all dashboard metrics as JSONB
- `get_recent_entries(p_limit)` — last N movements with computed type

### Dashboard (`src/features/dashboard/`)

`Home.jsx` is the main page. It composes:
- **`useDashboardReport`** — fetches `report_dashboard` RPC for the current month (5-min stale time)
- **`useRecentEntries`** — fetches `get_recent_entries` (2-min stale time)
- **`useAccunts`** — (note typo in filename) provides `addJournalEntry` for saving new movements; also queries `v_postings_enriched` and the `accounts` table

`ModalNuevoMovimiento` collects movement data; `Home.asyncHandleSave` maps the form payload to the double-entry RPC call via `useAccunts().addJournalEntry`.

### Edge Function (`supabase/functions/add-movement/`)

A Deno Edge Function for adding movements from external sources (e.g., mobile shortcuts). Authenticated via a shared `x-secret-key` header. Uses `service_role` to bypass RLS and calls `create_journal_entry_service` with an explicit `p_user_id`. Required env vars on the Supabase side: `SHORTCUT_SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_USER_ID`.

### Styling

Tailwind CSS with a custom design token convention. Common tokens used throughout: `text-ink` (primary text), `text-muted`, `bg-faint`, `border-border`. Configured in `tailwind.config.js`.
