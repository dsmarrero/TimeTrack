import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentEmployee } from "@/lib/session";
import TimeEntryForm from "./TimeEntryForm";
import TimeEntryRow from "./TimeEntryRow";

export default async function TiemposPage({ searchParams }) {
  const employee = await getCurrentEmployee();
  if (!employee) {
    redirect("/login");
  }

  const isAdmin = employee.role === "ADMIN";

  const { projectId = "", employeeId = "", from = "", to = "" } = await searchParams;

  const where = {
    endedAt: { not: null },
    ...(isAdmin ? {} : { employeeId: employee.id }),
  };
  if (projectId) {
    where.projectId = projectId;
  }
  if (isAdmin && employeeId) {
    where.employeeId = employeeId;
  }
  if (from || to) {
    where.startedAt = {};
    if (from) {
      where.startedAt.gte = new Date(`${from}T00:00:00`);
    }
    if (to) {
      where.startedAt.lt = new Date(new Date(`${to}T00:00:00`).getTime() + 24 * 60 * 60 * 1000);
    }
  }

  const [entries, projects, employees] = await Promise.all([
    prisma.timeEntry.findMany({
      where,
      include: { project: true, employee: true },
      orderBy: { startedAt: "desc" },
    }),
    prisma.project.findMany({ where: { active: true } }),
    isAdmin ? prisma.employee.findMany({ orderBy: { name: "asc" } }) : Promise.resolve([]),
  ]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Histórico de tiempos</h1>

      <form method="GET" className="mt-4 flex flex-wrap items-end gap-2 text-sm">
        <label className="flex flex-col">
          Proyecto
          <select name="projectId" defaultValue={projectId}>
            <option value="">Todos</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
        {isAdmin && (
          <label className="flex flex-col">
            Empleado
            <select name="employeeId" defaultValue={employeeId}>
              <option value="">Todos</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="flex flex-col">
          Desde
          <input type="date" name="from" defaultValue={from} />
        </label>
        <label className="flex flex-col">
          Hasta
          <input type="date" name="to" defaultValue={to} />
        </label>
        <button type="submit">Filtrar</button>
      </form>

      <TimeEntryForm projects={projects} />

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="text-left">
            <th>Proyecto</th>
            {isAdmin && <th>Empleado</th>}
            <th>Inicio</th>
            <th>Fin</th>
            <th>Nota</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <TimeEntryRow
              key={`${entry.id}-${entry.updatedAt.toISOString()}`}
              entry={entry}
              projects={projects}
              isAdmin={isAdmin}
            />
          ))}
        </tbody>
      </table>
      {entries.length === 0 && <p className="mt-4 text-zinc-600">Sin entradas registradas</p>}
    </div>
  );
}
