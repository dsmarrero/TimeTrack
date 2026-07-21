import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { getCurrentEmployee } from "@/lib/session";
import NavBar from "@/components/NavBar";
import Pagination from "@/components/Pagination";
import TimeEntryForm from "./TimeEntryForm";
import TimeEntryRow from "./TimeEntryRow";

const PER_PAGE = 10;

interface TiemposPageProps {
  searchParams: Promise<{
    projectId?: string;
    employeeId?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}

export default async function TiemposPage({ searchParams }: TiemposPageProps) {

  const employee = await getCurrentEmployee();
  if (!employee) {
    redirect("/login");
  }

  const isAdmin = employee.role === "ADMIN";

  const { projectId = "", employeeId = "", from = "", to = "", page: pageParam = "1" } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: Prisma.TimeEntryWhereInput = {
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

  const [entries, total, projects, employees] = await Promise.all([
    prisma.timeEntry.findMany({
      where,
      include: { project: true, employee: true },
      orderBy: { startedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.timeEntry.count({ where }),
    prisma.project.findMany({ where: { active: true } }),
    isAdmin ? prisma.employee.findMany({ orderBy: { name: "asc" } }) : Promise.resolve([]),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const inputClass =
    "rounded-md border border-border bg-transparent px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";

  return (
    <div>
      <NavBar />
      <div className="mx-auto max-w-5xl p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Histórico de tiempos</h1>
          {isAdmin && (
            <Link href="/tiempos/auditoria" className="text-sm font-medium text-brand hover:underline">
              Ver auditoría
            </Link>
          )}
        </div>

        <form method="GET" className="mt-4 flex flex-wrap items-end gap-3 text-sm">
          <label className="flex flex-col gap-1 text-foreground/70">
            Proyecto
            <select name="projectId" defaultValue={projectId} className={inputClass}>
              <option value="">Todos</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          {isAdmin && (
            <label className="flex flex-col gap-1 text-foreground/70">
              Empleado
              <select name="employeeId" defaultValue={employeeId} className={inputClass}>
                <option value="">Todos</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="flex flex-col gap-1 text-foreground/70">
            Desde
            <input type="date" name="from" defaultValue={from} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-foreground/70">
            Hasta
            <input type="date" name="to" defaultValue={to} className={inputClass} />
          </label>
          <button
            type="submit"
            className="rounded-md bg-brand px-4 py-2 font-medium text-white transition-colors hover:bg-brand-hover"
          >
            Filtrar
          </button>
          <Link href="/tiempos" className="px-2 py-2 text-foreground/60 hover:text-brand">
            Borrar filtro
          </Link>
        </form>

        <div className="mt-6 rounded-xl border border-border p-6">
          <TimeEntryForm projects={projects} />
        </div>

        <div className="mt-6 md:overflow-x-auto md:rounded-xl md:border md:border-border">
          <table className="w-full text-sm">
            <thead className="hidden md:table-header-group">
              <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-foreground/50">
                <th className="px-4 py-3">Proyecto</th>
                {isAdmin && <th className="px-4 py-3">Empleado</th>}
                <th className="px-4 py-3">Inicio</th>
                <th className="px-4 py-3">Fin</th>
                <th className="px-4 py-3">Nota</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="block space-y-3 md:table-row-group md:space-y-0 md:divide-y md:divide-border">
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
          {entries.length === 0 && (
            <p className="px-1 py-4 text-sm text-foreground/50 md:px-4">Sin entradas registradas</p>
          )}
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          basePath="/tiempos"
          query={{ projectId, employeeId, from, to }}
        />
      </div>
    </div>
  );
}
