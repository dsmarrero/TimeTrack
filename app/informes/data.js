import { prisma } from "@/lib/prisma";

export async function getInformesData(employee, { from, to }) {
  const isAdmin = employee.role === "ADMIN";

  const where = {
    durationMin: { gt: 0 },
    status: "APPROVED",
    ...(isAdmin ? {} : { employeeId: employee.id }),
  };

  if (from || to) {
    where.startedAt = {};
    if (from) {
      where.startedAt.gte = new Date(`${from}T00:00:00`);
    }
    if (to) {
      where.startedAt.lt = new Date(new Date(`${to}T00:00:00`).getTime() + 24 * 60 * 60 * 1000);
    }
  }

  const entries = await prisma.timeEntry.findMany({
    where,
    include: { project: true, employee: true },
    orderBy: { startedAt: "desc" },
  });

  const byProject = new Map();
  const byEmployee = new Map();
  const crossTable = new Map();

  for (const entry of entries) {
    const minutes = entry.durationMin;

    const project = byProject.get(entry.projectId) ?? { name: entry.project.name, minutes: 0 };
    project.minutes += minutes;
    byProject.set(entry.projectId, project);

    const emp = byEmployee.get(entry.employeeId) ?? { name: entry.employee.name, minutes: 0 };
    emp.minutes += minutes;
    byEmployee.set(entry.employeeId, emp);

    const crossKey = `${entry.employeeId}|${entry.projectId}`;
    const cross = crossTable.get(crossKey) ?? {
      employeeName: entry.employee.name,
      projectName: entry.project.name,
      minutes: 0,
    };
    cross.minutes += minutes;
    crossTable.set(crossKey, cross);
  }

  const totalMinutes = entries.reduce((sum, entry) => sum + entry.durationMin, 0);

  return { isAdmin, byProject, byEmployee, crossTable, totalMinutes };
}
