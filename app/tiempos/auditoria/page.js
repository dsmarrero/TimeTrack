import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentEmployee } from "@/lib/session";
import NavBar from "@/components/NavBar";
import BackButton from "@/components/BackButton";

const actionLabels = { CREATE: "Creación", UPDATE: "Edición", DELETE: "Eliminación" };

const trackedFields = [
  { key: "projectId", label: "Proyecto" },
  { key: "employeeId", label: "Empleado" },
  { key: "startedAt", label: "Inicio" },
  { key: "endedAt", label: "Fin" },
  { key: "note", label: "Nota" },
];

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "—";
}

function formatFieldValue(key, value, employeeNames, projectNames) {
  if (value === null || value === undefined || value === "") return "—";
  if (key === "projectId") return projectNames.get(value) || value;
  if (key === "employeeId") return employeeNames.get(value) || value;
  if (key === "startedAt" || key === "endedAt") return formatDate(value);
  return String(value);
}

function getChanges(log, employeeNames, projectNames) {
  const before = log.before || {};
  const after = log.after || {};
  return trackedFields
    .filter(({ key }) => {
      if (log.action === "UPDATE") {
        return JSON.stringify(before[key] ?? null) !== JSON.stringify(after[key] ?? null);
      }
      return true;
    })
    .map(({ key, label }) => ({
      label,
      before: formatFieldValue(key, before[key], employeeNames, projectNames),
      after: formatFieldValue(key, after[key], employeeNames, projectNames),
    }));
}

export default async function AuditoriaPage() {
  const employee = await getCurrentEmployee();
  if (!employee) {
    redirect("/login");
  }
  if (employee.role !== "ADMIN") {
    redirect("/tiempos");
  }

  const [logs, employees, projects] = await Promise.all([
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.employee.findMany(),
    prisma.project.findMany(),
  ]);

  const employeeNames = new Map(employees.map((e) => [e.id, e.name]));
  const projectNames = new Map(projects.map((p) => [p.id, p.name]));

  return (
    <div>
      <NavBar />
      <div className="mx-auto max-w-5xl p-8">
        <BackButton />
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Auditoría de tiempos</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Historial de altas, ediciones y bajas de entradas de tiempo.
        </p>

        <div className="mt-6 space-y-3">
          {logs.map((log) => {
            const changes = getChanges(log, employeeNames, projectNames);
            return (
              <div key={log.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-medium text-foreground">{actionLabels[log.action] || log.action}</span>
                  <span className="font-mono text-foreground/60">{formatDate(log.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm text-foreground/60">
                  Por {employeeNames.get(log.changedBy) || log.changedBy}
                </p>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {changes.map((change) => (
                    <li key={change.label} className="flex flex-wrap items-center gap-2">
                      <span className="w-20 shrink-0 text-foreground/50">{change.label}</span>
                      {log.action !== "CREATE" && (
                        <>
                          <span className="text-foreground/50 line-through">{change.before}</span>
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
            <p className="px-1 py-4 text-sm text-foreground/50">Sin cambios registrados</p>
          )}
        </div>
      </div>
    </div>
  );
}
