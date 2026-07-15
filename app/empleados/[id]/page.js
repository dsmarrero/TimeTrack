import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentEmployee } from "@/lib/session";
import NavBar from "@/components/NavBar";
import EmployeeEditForm from "./EmployeeEditForm";

function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export default async function EmployeeDetailPage({ params }) {
  const currentEmployee = await getCurrentEmployee();
  if (!currentEmployee || currentEmployee.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      timeEntries: {
        include: { project: true },
      },
    },
  });
  if (!employee) {
    notFound();
  }

  const completedEntries = employee.timeEntries.filter(
    (entry) => entry.durationMin > 0
  );

  const byProject = new Map();
  for (const entry of completedEntries) {
    const key = entry.projectId;
    const current = byProject.get(key) ?? { name: entry.project.name, minutes: 0 };
    current.minutes += entry.durationMin;
    byProject.set(key, current);
  }

  return (
    <div>
      <NavBar />
      <h1>{employee.name}</h1>
      <EmployeeEditForm key={employee.updatedAt.toISOString()} employee={employee} />

      <h2>Historial de tiempo por proyecto</h2>
      <ul>
        {[...byProject.entries()].map(([projectId, row]) => (
          <li key={projectId}>
            {row.name} — {formatMinutes(row.minutes)}
          </li>
        ))}
        {byProject.size === 0 && <li>Sin entradas registradas</li>}
      </ul>
    </div>
  );
}
