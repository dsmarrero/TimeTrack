## 4. Funcionalidades Detalladas
### 4.1 Gestión de proyectos
 * CRUD de proyectos (nombre, descripción, estado activo/inactivo).
 * Listado con buscador y filtro por estado.
 * Vista de detalle con tiempo total acumulado y desglose por empleado.
### 4.2 Gestión de empleados
 * CRUD de empleados (nombre, email, rol, estado activo/inactivo).
 * Solo el administrador puede crear, editar o desactivar empleados.
 * Vista de detalle con historial de tiempo por proyecto.
### 4.3 Cronómetro de tiempo
 * Selección de proyecto activo.
 * Botón **Iniciar**: crea entrada con startedAt = ahora, endedAt = null.
 * Botón **Detener**: actualiza endedAt y calcula duración.
 * Validación: no iniciar nuevo si ya hay uno activo (servidor).
 * Persistencia de estado si se cierra el navegador.
### 4.4 Edición del histórico
 * Listado de entradas editable (fecha/hora inicio/fin, proyecto, nota).
 * Creación de entradas manuales.
 * Confirmación antes de eliminar.
### 4.5 Informes
 * Tiempo total por proyecto y por empleado (rango de fechas).
 * Tabla cruzada proyecto x empleado.
 * Exportación a CSV.
## 5. Autenticación y Roles
| Rol | Permisos |
|---|---|
| Administrador | Acceso total: gestión de proyectos, empleados, edición de cualquier entrada y visualización de todos los informes. |
| Empleado | Solo puede iniciar/detener su propio cronómetro, editar sus propias entradas y ver sus propios informes. |
*Toda mutación en el servidor debe validar sesión y rol.*
## 6. Estructura de Pantallas Sugerida
 * /login
 * /dashboard (cronómetro, accesos rápidos, resumen del día)
 * /proyectos (listado)
 * /proyectos/[id] (detalle y tiempo acumulado)
 * /empleados (listado - solo admin)
 * /empleados/[id] (detalle e historial)
 * /tiempos (histórico editable)
 * /informes (agregados y filtros)
## 7. Buenas Prácticas
 * Arquitectura por capas.
 * Validación con Zod (cliente y servidor).
 * Manejo de errores consistente.
 * Tipado estricto (sin any).
 * Componentes reutilizables.
 * Migraciones de Prisma versionadas.
 * Variables de entorno para credenciales.
## 8. Entregables
 * Repositorio Git con historial de commits.
 * Archivo README (instalación, variables, comandos Prisma).
 * Script de seed (datos de ejemplo).
 * Aplicación desplegada.
## 9. Extras Opcionales
 * Gráficas de tiempo (ej. Recharts).
 * Notificación si el cronómetro lleva activo demasiado tiempo.
 * Modo oscuro.
 * Exportación de informes a PDF.
 * Registro de auditoría de cambios.