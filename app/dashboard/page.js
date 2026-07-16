import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import NavBar from "@/components/NavBar";
import Cronometro from "@/components/Chrono";

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

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [activeEntry, projects, todayEntries] = await Promise.all([
    prisma.timeEntry.findFirst({
      where: { employeeId: employee.id, endedAt: null },
      include: { project: true },
    }),
    prisma.project.findMany({ where: { active: true } }),
    prisma.timeEntry.findMany({
      where: { employeeId: employee.id, startedAt: { gte: startOfDay }, durationMin: { gt: 0 } },
      include: { project: true },
    }),
  ]);

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
      <div className="p-8">
        <h1 className="text-2xl font-semibold">Hola, {employee.name}</h1>
        <Cronometro activeEntry={activeEntry} projects={projects} />

        <h2 className="mt-6 text-lg font-semibold">Resumen del día</h2>
        <ul className="mt-2 text-sm">
          {[...byProject.entries()].map(([projectId, row]) => (
            <li key={projectId}>
              {row.name} — {formatMinutes(row.minutes)}
            </li>
          ))}
          {byProject.size === 0 && <li>Sin tiempo registrado hoy</li>}
        </ul>
        <p className="mt-1 text-sm font-semibold">Total hoy: {formatMinutes(totalToday)}</p>
      </div>
    </div>
  );
}
