# Supabase — Índice de objetos

## Views
| Nombre | Descripción corta | Depende de | Migration |
|---|---|---|---|
| v_postings_enriched | Postings + cuenta + entry + merchant. Base para reportes | postings, accounts, journal_entries, merchants | 001 |
| v_account_balances | Saldo vigente por cuenta (ASSET, LIABILITY, EXPENSE, INCOME) | accounts, postings, journal_entries | 002 |

## RPCs de lectura (report_*)
| report_expense_total | from_date date, to_date date | numeric | Total de gastos del período | postings, accounts, journal_entries | 003 |
| report_income_total | from_date date, to_date date | numeric | Total de ingresos del período | postings, accounts, journal_entries | 004 |
| report_expense_by_category | from_date date, to_date date | table | Gastos agrupados por categoría con jerarquía | postings, accounts, journal_entries | 005 |
| report_dashboard | from_date date, to_date date | jsonb | Todas las métricas del dashboard en una sola llamada | v_account_balances, report_expense_total, report_income_total, report_expense_by_category | 006 |
| get_recent_entries | p_limit int | table | Últimos N movimientos con tipo calculado | journal_entries, postings, accounts, merchants | 007 |

## RPCs de escritura (ledger_*)
| Nombre | Descripción | Estado | Migration |
|---|---|---|---|
| create_journal_entry_with_postings | Crea entry + postings atómicamente | ✅ listo | — |