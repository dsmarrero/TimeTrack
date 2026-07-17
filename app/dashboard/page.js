import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import NavBar from "@/components/NavBar";
import Cronometro from "@/components/Chrono";
import ActiveEmployees from "@/components/ActiveEmployees";

function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h} h ${m} min`;
}

export default async function DashboardPage() {
  const employee = await getCurrentEmployee();
  if (!employee) {
    redirect("/login");
  }

  const isAdmin = employee.role === "ADMIN";
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [activeEntry, projects, todayEntries, othersActiveEntries] = await Promise.all([
    prisma.timeEntry.findFirst({
      where: { employeeId: employee.id, endedAt: null },
      include: { project: true },
    }),
    prisma.project.findMany({ where: { active: true } }),
    prisma.timeEntry.findMany({
      where: { employeeId: employee.id, startedAt: { gte: startOfDay }, durationMin: { gt: 0 } },
      include: { project: true },
    }),
    isAdmin
      ? prisma.timeEntry.findMany({
          where: { endedAt: null, employeeId: { not: employee.id } },
          include: { employee: true, project: true },
          orderBy: { startedAt: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const activeEmployeeEntries = othersActiveEntries.map((entry) => ({
    id: entry.id,
    employeeName: entry.employee.name,
    projectName: entry.project.name,
    startedAt: entry.startedAt,
  }));

  const byProject = new Map();
  for (const entry of todayEntries) {
    const key = entry.projectId;
    const current = byProject.get(key) ?? { name: entry.project.name, minutes: 0 };
    current.minutes += entry.durationMin;
    byProject.set(key, current);
  }
  const totalToday = todayEntries.reduce((sum, entry) => sum + entry.durationMin, 0);

  return (
    <div>
      <NavBar />
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold text-foreground">Hola, {employee.name}</h1>

        <div className="mt-4">
          <Cronometro activeEntry={activeEntry} projects={projects} />
        </div>

        <div className="mt-6 rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground">Resumen del día</h2>
          <ul className="mt-3 divide-y divide-border text-sm">
            {[...byProject.entries()].map(([projectId, row]) => (
              <li key={projectId} className="flex items-center justify-between py-2">
                <span className="text-foreground/80">{row.name}</span>
                <span className="font-mono text-foreground/60">{formatMinutes(row.minutes)}</span>
              </li>
            ))}
            {byProject.size === 0 && (
              <li className="py-2 text-foreground/50">Sin tiempo registrado hoy</li>
            )}
          </ul>
          <p className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm font-semibold text-foreground">
            <span>Total hoy</span>
            <span className="font-mono">{formatMinutes(totalToday)}</span>
          </p>
        </div>

        {isAdmin && (
          <div className="mt-6 rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground">Trabajadores activos</h2>
            <div className="mt-3">
              <ActiveEmployees entries={activeEmployeeEntries} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
