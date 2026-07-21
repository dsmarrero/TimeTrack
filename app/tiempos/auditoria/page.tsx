import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentEmployee } from "@/lib/session";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import BackButton from "@/components/BackButton";
import Pagination from "@/components/Pagination";
import type { AuditLog, Prisma } from "@/app/generated/prisma/client";

const PER_PAGE = 10;

const actionLabels: Record<string, string> = {
  CREATE: "Creación",
  UPDATE: "Edición",
  DELETE: "Eliminación",
  APPROVE: "Aprobación",
  REJECT: "Rechazo",
};

const trackedFields = [
  { key: "projectId", label: "Proyecto" },
  { key: "employeeId", label: "Empleado" },
  { key: "startedAt", label: "Inicio" },
  { key: "endedAt", label: "Fin" },
  { key: "note", label: "Nota" },
  { key: "status", label: "Estado" },
];

const statusValueLabels: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

function formatDate(value: Date | string | null | undefined): string {
  return value ? new Date(value).toLocaleString() : "—";
}

function formatFieldValue(
  key: string,
  value: any,
  employeeNames: Map<string, string>,
  projectNames: Map<string, string>,
): string {
  if (value === null || value === undefined || value === "") return "—";
  if (key === "projectId") return projectNames.get(value) || value;
  if (key === "employeeId") return employeeNames.get(value) || value;
  if (key === "startedAt" || key === "endedAt") return formatDate(value);
  if (key === "status") return statusValueLabels[value] || value;
  return String(value);
}

function getChanges(
  log: AuditLog,
  employeeNames: Map<string, string>,
  projectNames: Map<string, string>,
) {
  const before = (log.before || {}) as Record<string, any>;
  const after = (log.after || {}) as Record<string, any>;
  return trackedFields
    .filter(({ key }) => {
      if (log.action === "CREATE" || log.action === "DELETE") {
        return true;
      }
      return (
        JSON.stringify(before[key] ?? null) !==
        JSON.stringify(after[key] ?? null)
      );
    })
    .map(({ key, label }) => ({
      label,
      before: formatFieldValue(key, before[key], employeeNames, projectNames),
      after: formatFieldValue(key, after[key], employeeNames, projectNames),
    }));
}

interface AuditoriaPageProps {
  searchParams: Promise<{
    employeeId?: string;
    projectId?: string;
    action?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}

export default async function AuditoriaPage({
  searchParams,
}: AuditoriaPageProps) {
  const employee = await getCurrentEmployee();
  if (!employee) {
    redirect("/login");
  }
  if (employee.role !== "ADMIN") {
    redirect("/tiempos");
  }

  const {
    employeeId = "",
    projectId = "",
    action = "",
    from = "",
    to = "",
    page: pageParam = "1",
  } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: Prisma.AuditLogWhereInput = {};
  if (employeeId) {
    where.changedBy = employeeId;
  }
  if (action) {
    where.action = action;
  }
  if (from || to) {
    where.createdAt = {};
    if (from) {
      where.createdAt.gte = new Date(`${from}T00:00:00`);
    }
    if (to) {
      where.createdAt.lt = new Date(
        new Date(`${to}T00:00:00`).getTime() + 24 * 60 * 60 * 1000,
      );
    }
  }
  if (projectId) {
    where.OR = [
      { after: { path: ["projectId"], equals: projectId } },
      { before: { path: ["projectId"], equals: projectId } },
    ];
  }

  const [logs, total, employees, projects] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.auditLog.count({ where }),
    prisma.employee.findMany(),
    prisma.project.findMany(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const employeeNames = new Map(employees.map((e) => [e.id, e.name]));
  const projectNames = new Map(projects.map((p) => [p.id, p.name]));

  const inputClass =
    "rounded-md border border-border bg-transparent px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";

  return (
    <div>
      <NavBar />
      <div className="mx-auto max-w-5xl p-8">
        <BackButton />
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Auditoría de tiempos
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          Historial de altas, ediciones y bajas de entradas de tiempo.
        </p>

        <form
          method="GET"
          className="mt-4 flex flex-wrap items-end gap-3 text-sm"
        >
          <label className="flex flex-col gap-1 text-foreground/70">
            Empleado
            <select
              name="employeeId"
              defaultValue={employeeId}
              className={inputClass}
            >
              <option value="">Todos</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-foreground/70">
            Proyecto
            <select
              name="projectId"
              defaultValue={projectId}
              className={inputClass}
            >
              <option value="">Todos</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-foreground/70">
            Acción
            <select name="action" defaultValue={action} className={inputClass}>
              <option value="">Todas</option>
              <option value="CREATE">Creación</option>
              <option value="UPDATE">Edición</option>
              <option value="DELETE">Eliminación</option>
              <option value="APPROVE">Aprobación</option>
              <option value="REJECT">Rechazo</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-foreground/70">
            Desde
            <input
              type="date"
              name="from"
              defaultValue={from}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-foreground/70">
            Hasta
            <input
              type="date"
              name="to"
              defaultValue={to}
              className={inputClass}
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-brand px-4 py-2 font-medium text-white transition-colors hover:bg-brand-hover"
          >
            Filtrar
          </button>
          <Link
            href="/tiempos/auditoria"
            className="px-2 py-2 text-foreground/60 hover:text-brand"
          >
            Borrar filtro
          </Link>
        </form>

        <div className="mt-6 space-y-3">
          {logs.map((log) => {
            const changes = getChanges(log, employeeNames, projectNames);
            const entryProjectId =
              (log.after as Record<string, any>)?.projectId ||
              (log.before as Record<string, any>)?.projectId;
            const projectName = projectNames.get(entryProjectId) || "—";
            return (
              <div key={log.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-medium text-foreground">
                    {projectName}
                  </span>
                  <span className="font-mono text-foreground/60">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-foreground/60">
                  {actionLabels[log.action] || log.action} · por{" "}
                  {employeeNames.get(log.changedBy) || log.changedBy}
                </p>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {changes.map((change) => (
                    <li
                      key={change.label}
                      className="flex flex-wrap items-center gap-2"
                    >
                      <span className="w-20 shrink-0 text-foreground/50">
                        {change.label}
                      </span>
                      {log.action !== "CREATE" && (
                        <>
                          <span className="text-foreground/50 line-through">
                            {change.before}
                          </span>
                          <span className="text-foreground/40">→</span>
                        </>
                      )}
                      <span className="font-medium text-foreground">
                        {log.action === "DELETE" ? "eliminado" : change.after}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {logs.length === 0 && (
            <p className="px-1 py-4 text-sm text-foreground/50">
              Sin cambios registrados
            </p>
          )}
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          basePath="/tiempos/auditoria"
          query={{ employeeId, projectId, action, from, to }}
        />
      </div>
    </div>
  );
}
