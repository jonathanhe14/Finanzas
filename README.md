# Finanzas — App de finanzas personales

> ⚠️ **Proyecto personal.** Lo construí para llevar el control de mis propias
> finanzas y para aprender/experimentar. No es un producto comercial ni está
> pensado para uso multiusuario en producción; se comparte con fines educativos
> y de portafolio. Úsalo bajo tu propia responsabilidad.

Aplicación web para registrar movimientos, presupuestos, metas de ahorro y ver
reportes de tus finanzas. Usa un modelo de **contabilidad de partida doble**
(cada movimiento genera asientos de débito y crédito) sobre **Supabase**.

Construida con **React 19**, **Vite**, **Supabase** (PostgreSQL + Auth) y
**Tailwind CSS**. Desplegada en **Vercel** (SPA con rewrite).

## Funcionalidades

- **Autenticación** con Supabase (login, registro y recuperación de contraseña).
  Las rutas privadas están protegidas con `<ProtectedRoute>`.
- **Dashboard**: resumen del mes actual — gastos, ingresos, balance disponible,
  deuda de tarjeta, gastos por categoría, presupuesto y últimos movimientos.
- **Movimientos**: alta, edición y borrado de movimientos (vía RPCs atómicas).
- **Presupuestos** mensuales por categoría y gastos fijos / programados.
- **Cuentas**: gestión de cuentas (activos, pasivos, categorías).
- **Reportes** con gráficas (ApexCharts).
- **Metas** de ahorro.
- **Multi-moneda**: nunca se suman montos de monedas distintas.

## Requisitos previos

- **Node.js** >= 18
- Un proyecto en **Supabase** (PostgreSQL + Auth)

## Variables de entorno

Crea un archivo `.env` en la raíz con tus credenciales de Supabase:

```
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-anon-key>
```

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno (ver sección anterior)
#    Crea el archivo .env en la raíz

# 3. Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`.

## Scripts disponibles

| Comando           | Descripción                       |
|-------------------|-----------------------------------|
| `npm run dev`     | Servidor de desarrollo (Vite)     |
| `npm run build`   | Build de producción               |
| `npm run preview` | Preview del build de producción   |
| `npm run lint`    | ESLint                            |

## Estructura del proyecto

Organizado por _features_ (cada una con sus páginas, componentes y hooks):

```
src/
├── App.jsx                  # Rutas (públicas + privadas con <ProtectedRoute>)
├── main.jsx                 # Punto de entrada (providers globales)
├── context/
│   └── AuthContext.jsx      # Estado de sesión reactivo (useAuth)
├── components/
│   ├── ProtectedRoute.jsx   # Guard de rutas privadas
│   ├── Sidebar.jsx          # Navegación lateral
│   ├── ErrorBoundary.jsx    # Captura de errores de render
│   └── ToastProvider.jsx    # Notificaciones
├── features/
│   ├── dashboard/           # Página principal (Home) y sus tarjetas
│   ├── movements/           # Movimientos
│   ├── budgets/             # Presupuestos y gastos fijos
│   ├── accounts/            # Cuentas
│   ├── reports/             # Reportes (gráficas)
│   └── goals/               # Metas de ahorro
├── pages/
│   ├── Login.jsx
│   └── ResetPassword.jsx
└── lib/
    ├── supabaseClient.js    # Cliente singleton de Supabase
    ├── services/            # Acceso a Supabase (RPCs y vistas)
    ├── constants/           # Query keys de React Query
    ├── hooks/               # Hooks compartidos
    └── utils/               # Helpers (dinero, fechas)
```

## Modelo de datos (partida doble)

El backend usa un libro mayor de partida doble: cada evento financiero es un
`journal_entry` con dos o más `postings` (débito + crédito). El frontend nunca
escribe directamente en esas tablas; siempre pasa por RPCs atómicas:
`create_journal_entry_with_postings`, `update_journal_entry` y
`delete_journal_entry`.

Principales superficies de lectura:

- `v_postings_enriched` — postings con datos de cuenta/asiento/comercio
- `v_account_balances` — balance actual por cuenta
- `report_dashboard(from_date, to_date)` — métricas del dashboard como JSONB
- `get_recent_entries(p_limit)` — últimos movimientos

> **Seguridad:** todas las tablas usan `user_id` + **Row Level Security (RLS)**
> por usuario en Supabase. La protección de rutas en el frontend es solo de UX;
> la seguridad real de los datos vive en las políticas RLS de la base.

## Tecnologías

- [React 19](https://react.dev/) — UI library
- [Vite](https://vitejs.dev/) — Build tool
- [Supabase](https://supabase.com/) — Backend (PostgreSQL + Auth + RPC)
- [React Router](https://reactrouter.com/) — Routing
- [TanStack Query](https://tanstack.com/query) — Data fetching / caché
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
- [ApexCharts](https://apexcharts.com/) — Gráficas
- [Lucide](https://lucide.dev/) — Iconos
