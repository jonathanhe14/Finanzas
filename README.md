# Registros App

Aplicación web para consultar y filtrar registros financieros. Construida con **React**, **Supabase** y **Tailwind CSS**.

## Estructura del Proyecto

```
├── public/
├── src/
│   ├── components/
│   │   ├── EmptyState.jsx      # Estado cuando no hay registros
│   │   ├── ErrorState.jsx      # Estado de error con botón de reintento
│   │   ├── Filters.jsx         # Filtros por categoría y rango de fechas
│   │   ├── LoadingState.jsx    # Spinner de carga
│   │   ├── RegistrosTable.jsx  # Tabla/lista de registros (responsive)
│   │   └── StatsBar.jsx        # Tarjetas de estadísticas resumen
│   ├── hooks/
│   │   └── useRegistros.js     # Hook personalizado para fetch y filtrado
│   ├── lib/
│   │   └── supabaseClient.js   # Cliente de Supabase
│   ├── App.jsx                 # Componente principal
│   ├── main.jsx                # Punto de entrada
│   └── index.css               # Estilos base con Tailwind
├── .env.example                # Plantilla de variables de entorno
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

## Requisitos Previos

- **Node.js** >= 18
- Un proyecto en **Supabase** con una tabla `registros`

## Tabla en Supabase

La app espera una tabla `registros` con la siguiente estructura:

| Columna      | Tipo        | Descripción                    |
|-------------|-------------|--------------------------------|
| `id`        | int8 / uuid | Clave primaria (auto)          |
| `nombre`    | text        | Nombre del registro            |
| `monto`     | numeric     | Monto en colones               |
| `categoria` | text        | Categoría (ej: Alimentación)   |
| `metodo`    | text        | Método de pago (ej: Efectivo)  |
| `created_at`| timestamptz | Fecha de creación (auto)       |

### SQL para crear la tabla

```sql
CREATE TABLE registros (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre TEXT NOT NULL,
  monto NUMERIC NOT NULL DEFAULT 0,
  categoria TEXT,
  metodo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (opcional)
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública (ajustar según necesidad)
CREATE POLICY "Lectura pública" ON registros
  FOR SELECT USING (true);
```

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase:
#   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
#   VITE_SUPABASE_ANON_KEY=tu-anon-key

# 3. Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`

## Scripts Disponibles

| Comando          | Descripción                          |
|-----------------|--------------------------------------|
| `npm run dev`   | Servidor de desarrollo (Vite)        |
| `npm run build` | Build de producción                  |
| `npm run preview` | Preview del build de producción    |

## Funcionalidades

- **Consulta de registros** desde Supabase en tiempo real
- **Filtrado por categoría** con dropdown dinámico
- **Filtrado por rango de fechas** (desde / hasta)
- **Estadísticas resumen**: total de registros, monto total y promedio
- **Estados de UI**: loading (spinner), error (con reintento), lista vacía
- **Diseño responsive**: tabla en desktop, tarjetas en móvil
- **Botón de actualización** para refrescar datos manualmente

## Tecnologías

- [React](https://react.dev/) — UI library
- [Vite](https://vitejs.dev/) — Build tool
- [Supabase](https://supabase.com/) — Backend (PostgreSQL + API)
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
