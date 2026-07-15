# TimeTrack

App web de seguimiento de tiempo por proyecto y empleado. Next.js (App Router) + Prisma + PostgreSQL + Firebase Auth + Tailwind CSS.

Ver `TimeTrack.md` para la especificación completa del proyecto.

## Requisitos

- Node.js 20+
- Una base de datos PostgreSQL
- Un proyecto de Firebase (Authentication con email/contraseña habilitado)

## Instalación

```bash
npm install
```

## Variables de entorno

Crea un archivo `.env` en la raíz de `frontend/` con:

```bash
# Conexión a PostgreSQL
DATABASE_URL="postgresql://usuario:password@host:puerto/basededatos"

# Config del proyecto Firebase (cliente, valores públicos del proyecto Firebase)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Estos valores se sacan de la consola de Firebase → Configuración del proyecto → tus apps.

Además, coloca la clave de la cuenta de servicio de Firebase Admin en `frontend/firebase-service-account.json` (Consola de Firebase → Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada). Este archivo nunca se sube a git (está en `.gitignore`).

## Base de datos (Prisma)

El cliente de Prisma se genera en una ruta personalizada (`app/generated/prisma`), no en `node_modules/@prisma/client`, así que hay que generarlo tras cada `npm install` en limpio:

```bash
npx prisma generate
```

Crear/aplicar migraciones en desarrollo (también corre el seed):

```bash
npx prisma migrate dev
```

Ejecutar solo el seed (datos de ejemplo):

```bash
npx prisma db seed
```

Explorar la base de datos con una UI:

```bash
npx prisma studio
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Otros comandos

```bash
npm run build   # build de producción
npm run start   # levanta el build de producción
npm run lint    # ESLint
```

## Notas del proyecto

- Sin Zod: la validación de formularios se hace con checks manuales (`if`/`return`) dentro de los Server Actions.
- Sin TypeScript: el proyecto se mantiene en JavaScript plano (excepto el cliente Prisma generado, que es TS por defecto de la herramienta).
- Autenticación: Firebase gestiona email/contraseña; el rol y los datos de negocio (activo/inactivo, horas, etc.) viven en Postgres (`Employee`, `Project`, `TimeEntry`).
