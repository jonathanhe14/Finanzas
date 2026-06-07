# Finanzas

App web para llevar mis finanzas personales, con un detalle que la hace distinta:
casi nunca registro nada a mano. Lo hago hablándole a un bot de Telegram. Por debajo
todo se guarda con contabilidad de partida doble sobre Supabase.

> **Proyecto personal.** Lo armé para controlar mi propio dinero y, de paso, para
> aprender Supabase a fondo y meterle mano a un modelo contable de verdad. No es un
> producto ni está pensado para multiusuario: tiene un solo dueño (yo) y lo comparto
> como portafolio. Si lo usás, es bajo tu propia responsabilidad.

## Demo

> Videos en camino.


**La app web** (dashboard, registrar un movimiento, reportes)

<!-- ![Demo de la app web](docs/demo-web.gif) -->

**El bot de Telegram** (escribir un gasto, mandar una foto de factura, confirmar)

<!-- ![Demo del bot de Telegram](docs/demo-bot.gif) -->

## Registro automático con Telegram

Toda app de finanzas choca con lo mismo: anotar cada gasto a mano es tedioso y uno
lo termina abandonando a las dos semanas. Por eso el punto de entrada de datos de
este proyecto no es un formulario, es un bot de Telegram. Le hablo como a una
persona y él arma el movimiento.

Hay tres formas de cargar algo sin abrir la app:

1. **Escribiéndolo normal.** "gasté 5000 en el súper con WINK", "me pagaron 120 mil
   de salario", "pasé 30 mil de BAC a WINK".
2. **Mandando una foto de la factura.** El bot lee el total, el comercio y la fecha,
   y elige la categoría solo.
3. **Desde los correos del banco.** Las notificaciones de transacción que llegan al
   correo se detectan solas y aparecen en Telegram para confirmarlas.

En los tres casos el bot **propone** el movimiento y yo lo **confirmo** con botones.
Nunca registra nada por su cuenta.

Un ejemplo. Escribo:

> gasté 5000 en el súper con WINK

y el bot contesta con algo así:

```
🟡 Compra — ₡5 000,00
Súper
Categoría: Alimentación
Sale de: WINK

[ ✅ Confirmar ]
[ Aliment. ] [ Transp. ] [ Salud ] [ Ocio ]
[ ✏️ Monto ] [ ❌ Rechazar ]
```

Le doy Confirmar y queda asentado. Si la categoría está mal la cambio con un botón;
si el monto está mal toco "Monto" y le mando el número correcto. Para casos
ambiguos pregunta lo justo: un SINPE que entra entra como "¿es mío o son fondos
pendientes?", un depósito a WINK como "¿vino de BCR, de BAC, o es ingreso externo?".

### Cómo funciona por dentro

El bot corre como **Edge Functions de Supabase** (Deno), no como un servidor aparte:

- `telegram-webhook` recibe los mensajes. Interpreta el texto o la imagen con
  **Claude (Haiku 4.5)**, que devuelve un JSON con tipo, monto, cuenta y categoría.
  El prompt conoce mis cuentas y categorías reales y entiende modismos ("10 mil",
  "5 lucas", "2k") y reglas propias, como la contabilidad de los cobros de apps de
  delivery (Peya), que no son ingreso sino una deuda que sube.
- `poll-outlook` revisa el correo cada cierto tiempo buscando avisos del banco.
- `parse-email-transaction` extrae el monto y el comercio de esos correos.

Lo detectado no se escribe directo. Primero queda como pendiente en la tabla
`email_events` y se manda a Telegram con los botones. Recién cuando confirmo, el bot
construye los asientos de débito y crédito y los inserta llamando a **la misma RPC
que usa la web** (`create_journal_entry_with_postings`). Es la parte que más me
importa: la app y el bot entran por la misma puerta, así que la contabilidad nunca
se descuadra sin importar de dónde venga el dato.

El bot también paga los gastos fijos. Con `/pagos` lista lo que está por vencer y
registro el pago desde la cuenta que elija, con un botón.

Por seguridad solo responde a mi chat (está fijado a un único `chat_id`) y valida un
secreto en el webhook. Es de un solo usuario, a propósito.

Resumen del flujo:

```
Telegram (texto / foto) ─┐
                         ├─→ Edge Function → Claude → propuesta con botones
Correo del banco ─ poll ─┘                                   │
                                                    confirmo  ▼
                                  create_journal_entry_with_postings  (partida doble)
```

## Funcionalidades de la web

- Autenticación con Supabase: login, registro y recuperación de contraseña. Las
  rutas privadas pasan por un guard (`<ProtectedRoute>`).
- Dashboard del mes en curso: gastos, ingresos, balance disponible, deuda de
  tarjeta, gastos por categoría, presupuesto y últimos movimientos.
- Movimientos: alta, edición y borrado, siempre vía RPCs atómicas.
- Presupuestos mensuales por categoría y gastos fijos / programados.
- Cuentas: activos, pasivos y categorías de ingreso y gasto.
- Reportes con gráficas (ApexCharts).
- Metas de ahorro.
- Multimoneda: nunca se suman montos de monedas distintas.
- Export de movimientos a CSV.
- Pensada para usarse desde el celular además del escritorio.

## Modelo de datos: partida doble

No guarda "gastos" sueltos. Cada movimiento es un `journal_entry` con dos o más
`postings` (débito y crédito), igual que un libro contable. Eso obliga a que todo
cuadre y deja los saldos consistentes.

El frontend nunca escribe directo en esas tablas. Siempre pasa por RPCs atómicas:
`create_journal_entry_with_postings` (crear), `update_journal_entry` (editar) y
`delete_journal_entry` (borrar).

Para leer, usa principalmente:

- `v_account_balances` — balance actual por cuenta
- `v_postings_enriched` — postings con datos de cuenta, asiento y comercio
- `report_dashboard(from_date, to_date)` — métricas del dashboard en un JSONB
- `get_recent_entries(p_limit)` — últimos movimientos

Sobre seguridad: todas las tablas llevan `user_id` y tienen Row Level Security por
usuario. La protección de rutas del frontend es solo de experiencia; la seguridad
real de los datos está en las políticas RLS de la base y en que las RPCs solo las
puede ejecutar un usuario autenticado.

## Stack

- [React 19](https://react.dev/) y [Vite](https://vitejs.dev/) para el frontend
- [Supabase](https://supabase.com/) de backend: PostgreSQL, Auth, RPCs y Edge Functions
- [Claude (API de Anthropic)](https://docs.anthropic.com/) para interpretar texto e imágenes en el bot
- [Tailwind CSS](https://tailwindcss.com/) para los estilos
- [TanStack Query](https://tanstack.com/query) para el fetching y la caché
- [React Router](https://reactrouter.com/), [ApexCharts](https://apexcharts.com/) y [Lucide](https://lucide.dev/)
- Desplegada en [Vercel](https://vercel.com/) (SPA con rewrite)

## Estructura del repo

Este repo es la app web. El bot y las funciones de correo viven como Edge Functions
en Supabase. El frontend está organizado por _features_, cada una con sus páginas,
componentes y hooks:

```
src/
├── App.jsx                  # Rutas (públicas + privadas con <ProtectedRoute>)
├── main.jsx                 # Entrada: providers globales
├── context/
│   ├── AuthContext.jsx      # Estado de sesión (useAuth)
│   └── MobileNavContext.jsx # Drawer de navegación en móvil
├── components/              # Sidebar, guard de rutas, toasts, etc.
├── features/
│   ├── dashboard/           # Home y sus tarjetas
│   ├── movements/           # Movimientos
│   ├── budgets/             # Presupuestos y gastos fijos
│   ├── accounts/            # Cuentas
│   ├── reports/             # Reportes
│   └── goals/               # Metas
├── pages/                   # Login y ResetPassword
└── lib/
    ├── supabaseClient.js    # Cliente singleton de Supabase
    ├── services/            # Acceso a Supabase (RPCs y vistas)
    ├── hooks/ · constants/  # Hooks compartidos y query keys
    └── utils/               # Helpers (dinero, fechas, CSV)
```

## Correr el proyecto

Necesitás Node 18 o superior y un proyecto de Supabase.

Creá un `.env` en la raíz con las credenciales de Supabase:

```
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-anon-key>
```

Y después:

```bash
npm install      # dependencias
npm run dev      # servidor de desarrollo en http://localhost:5173
```

Scripts disponibles:

| Comando           | Qué hace                        |
|-------------------|---------------------------------|
| `npm run dev`     | Servidor de desarrollo (Vite)   |
| `npm run build`   | Build de producción             |
| `npm run preview` | Preview del build               |
| `npm run lint`    | ESLint                          |

El bot de Telegram y las funciones de correo son aparte: corren como Edge Functions
en Supabase y usan sus propios secretos (token del bot, API key de Anthropic,
service role de Supabase, etc.), que se configuran en el proyecto de Supabase y no
en este `.env`.
