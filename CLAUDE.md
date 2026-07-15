@AGENTS.md
Monitor pr�cticas empresa. Yo alumno bootcamp full-stack ironhack. Gu�a esto:

# Especificaci�n de Proyecto: TimeTrack

Sistema seguimiento tiempo por proyecto y empleado.

## 1. Objetivo del Proyecto

Desarrollar app web: gestiona proyectos y empleados, registra tiempo dedicado v�a cron�metro.

**Alcance funcional principal:**

* Alta, edici�n, baja (l�gica) proyectos.
* Alta, edici�n, baja (l�gica) empleados.
* Selector proyecto activo + cron�metro (iniciar/detener).
* Registro hist�rico sesiones tiempo (editable manual).
* Listado y filtros tiempo: por proyecto, por empleado, por rango fechas.
* Autenticaci�n usuarios + control acceso por roles (admin/empleado).

## 2. Stack Tecnol�gico

| Capa | Tecnolog�a |
| --- | --- |
| Framework | Next.js 14+ (App Router) |
| Lenguaje | TypeScript |
| ORM | Prisma |
| Base de datos | PostgreSQL |
| Estilos | Tailwind CSS |
| Autenticaci�n | **FIREBASE** |
| Validaci�n | **NO** |
| Estado en cliente | React Query / Server Actions |
| Despliegue sugerido | **NO** |

*Notas adicionales:*

* *Anotaci�n manual: "No GITHUB"*

## 3. Modelo de Datos (Prisma)

```prisma
model Employee {
  id          String      @id @default(cuid())
  name        String
  email       String      @unique
  role        Role        @default(EMPLOYEE)
  active      Boolean     @default(true)
  timeEntries TimeEntry[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Project {
  id          String      @id @default(cuid())
  name        String
  description String?
  active      Boolean     @default(true)
  timeEntries TimeEntry[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model TimeEntry {
  id         String   @id @default(cuid())
  employeeId String
  projectId  String
  startedAt  DateTime
  endedAt    DateTime?
  durationMin Int?
  note       String?
  employee   Employee @relation(fields: [employeeId], references: [id])
  project    Project  @relation(fields: [projectId], references: [id])
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([employeeId])
  @@index([projectId])
}

enum Role {
  ADMIN
  EMPLOYEE
}

```

*Nota: `endedAt` nulo = cron�metro activo. `durationMin` calcula al cerrar entrada.*

## 4. Funcionalidades Detalladas

### 4.1 Gesti�n de proyectos

* CRUD proyectos (nombre, descripci�n, estado activo/inactivo).
* Listado con buscador + filtro por estado.
* Vista detalle: tiempo total acumulado + desglose por empleado.

### 4.2 Gesti�n de empleados

* CRUD empleados (nombre, email, rol, estado activo/inactivo).
* Solo admin crea, edita, desactiva empleados.
* Vista detalle: historial tiempo por proyecto.

### 4.3 Cron�metro de tiempo

* Selecci�n proyecto activo.
* Bot�n **Iniciar**: crea entrada, `startedAt = ahora`, `endedAt = null`.
* Bot�n **Detener**: actualiza `endedAt`, calcula duraci�n.
* Validaci�n: no iniciar nuevo si ya hay uno activo (servidor).
* Persiste estado si se cierra navegador.

### 4.4 Edici�n del hist�rico

* Listado entradas editable (fecha/hora inicio/fin, proyecto, nota).
* Creaci�n entradas manuales.
* Confirmaci�n antes de eliminar.

### 4.5 Informes

* Tiempo total por proyecto y por empleado (rango fechas).
* Tabla cruzada proyecto x empleado.
* Exportaci�n a CSV.

## 5. Autenticaci�n y Roles

| Rol | Permisos |
| --- | --- |
| Administrador | Acceso total: gesti�n proyectos, empleados, edici�n cualquier entrada, ve todos informes. |
| Empleado | Solo inicia/detiene su propio cron�metro, edita sus propias entradas, ve sus propios informes. |

*Toda mutaci�n servidor valida sesi�n y rol.*

## 6. Estructura de Pantallas Sugerida

* `/login`
* `/dashboard` (cron�metro, accesos r�pidos, resumen del d�a)
* `/proyectos` (listado)
* `/proyectos/[id]` (detalle y tiempo acumulado)
* `/empleados` (listado - solo admin)
* `/empleados/[id]` (detalle e historial)
* `/tiempos` (hist�rico editable)
* `/informes` (agregados y filtros)

## 7. Buenas Pr�cticas

* Arquitectura por capas.
* Manejo errores consistente.
* Tipado estricto (sin `any`).
* Componentes reutilizables.
* Migraciones Prisma versionadas.
* Variables entorno para credenciales.

## 8. Entregables

* README (instalaci�n, variables, comandos Prisma).
* Script seed (datos ejemplo).
* App desplegada.

## 9. Extras Opcionales

* Gr�ficas tiempo (ej. Recharts).
* Notificaci�n si cron�metro lleva activo demasiado tiempo.
* Modo oscuro.
* Exportaci�n informes a PDF.
* Registro auditor�a de cambios.

Nunca nombrar claude como coautor o colaborador
explicar todos los pasos como si fuese niño de 10 años