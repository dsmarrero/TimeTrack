# TimeTrack

App de seguimiento de tiempo por proyecto y empleado (Next.js 16 + Prisma + PostgreSQL + Firebase Auth).

## Funcionalidades

- **Login** (`/login`) — autenticación con Firebase Auth (email/password); sesión guardada en cookie httpOnly verificada server-side en cada ruta.
- **Dashboard** (`/dashboard`) — cronómetro para fichar entrada/salida en un proyecto (una entrada activa por empleado, persiste si recargas o cierras el navegador), resumen de horas del día por proyecto y, para admin, listado en vivo de qué empleados están trabajando ahora mismo.
- **Proyectos** (`/proyectos`) — CRUD de proyectos (solo admin), con alta/edición/baja; desactivar un proyecto con gente trabajando en él pide confirmación.
- **Empleados** (`/empleados`) — CRUD de empleados (solo admin): alta con rol (`ADMIN`/`EMPLOYEE`), edición, baja.
- **Histórico de tiempos** (`/tiempos`) — listado de entradas cerradas con filtro por proyecto/empleado/rango de fechas; admin ve y edita las de todos, empleado solo las suyas.
- **Auditoría** (`/tiempos/auditoria`, solo admin) — registro de todos los altas/ediciones/bajas de entradas de tiempo, mostrando qué campo cambió, cuándo y los valores antes/después.
- **Informes** (`/informes`) — totales de horas por proyecto (con gráfico), por empleado (admin) y tabla cruzada proyecto x empleado, filtrables por fecha; exportación a CSV y PDF.
- **Modo claro/oscuro** — toggle en el navbar, persistente en `localStorage`.
- Control de acceso por rol aplicado en el servidor (Server Actions), no solo ocultando UI: un empleado no puede leer ni modificar datos de otros vía API aunque manipule el formulario.

## Requisitos

- Node.js 20+
- PostgreSQL (instancia propia o gestionada, ej. Supabase/Neon)
- Proyecto de Firebase (Authentication habilitado) con una cuenta de servicio

## Instalación

```bash
cd frontend
npm install
```

## Variables de entorno

Crear `frontend/.env` con:

```bash
# PostgreSQL
DATABASE_URL="postgresql://usuario:password@host:5432/timetrack"

# Firebase (config pública del cliente, panel de Firebase > Configuración del proyecto)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Además, para el SDK de admin (usado en Server Actions para verificar sesión y crear usuarios), descargar la clave de cuenta de servicio desde Firebase (Configuración del proyecto > Cuentas de servicio > Generar nueva clave privada) y guardarla como:

```
frontend/firebase-service-account.json
```

Ambos (`.env` y `firebase-service-account.json`) están en `.gitignore` — no se suben al repo.

## Prisma

El cliente de Prisma se genera en una ruta custom (`app/generated/prisma`, gitignored), así que hace falta regenerarlo tras cada `npm install` o cambio de esquema:

```bash
npx prisma generate       # regenera el cliente en app/generated/prisma
npx prisma migrate dev    # crea/aplica migraciones en desarrollo (corre el seed automáticamente)
npx prisma db seed        # solo el seed (prisma/seed.mjs)
npx prisma studio         # explorador visual de la base de datos
```

## Comandos

```bash
npm run dev     # servidor de desarrollo (http://localhost:3000)
npm run build   # build de producción
npm run start   # levanta el build de producción
npm run lint    # ESLint
```

## Estructura

- `app/` — rutas de Next.js (App Router): `/login`, `/dashboard`, `/proyectos`, `/empleados`, `/tiempos`, `/informes`, con Server Components + Server Actions.
- `lib/` — Prisma client compartido, sesión (Firebase Admin), config de Firebase cliente.
- `prisma/` — esquema, migraciones y seed.
