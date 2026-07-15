import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentEmployee } from "@/lib/session";
import TimeEntryForm from "./TimeEntryForm";
import TimeEntryRow from "./TimeEntryRow";

export default async function TiemposPage() {
  const employee = await getCurrentEmployee();
  if (!employee) {
    redirect("/login");
  }

  const isAdmin = employee.role === "ADMIN";

  const [entries, projects] = await Promise.all([
    prisma.timeEntry.findMany({
      where: {
        endedAt: { not: null },
        ...(isAdmin ? {} : { employeeId: employee.id }),
      },
      include: { project: true, employee: true },
      orderBy: { startedAt: "desc" },
    }),
    prisma.project.findMany({ where: { active: true } }),
  ]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Histórico de tiempos</h1>

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
            <TimeEntryRow key={entry.id} entry={entry} projects={projects} isAdmin={isAdmin} />
          ))}
        </tbody>
      </table>
      {entries.length === 0 && <p className="mt-4 text-zinc-600">Sin entradas registradas</p>}
    </div>
  );
}
