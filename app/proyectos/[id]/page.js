import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentEmployee } from "@/lib/session";
import NavBar from "@/components/NavBar";
import ProjectEditForm from "./ProjectEditForm";

function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h} h ${m} min`;
}

export default async function ProjectDetailPage({ params }) {
  const currentEmployee = await getCurrentEmployee();
  if (!currentEmployee) {
    redirect("/login");
  }

  const { id } = await params;
  const isAdmin = currentEmployee.role === "ADMIN";

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      timeEntries: {
        where: isAdmin ? {} : { employeeId: currentEmployee.id },
        include: { employee: true },
      },
    },
  });

  if (!project) {
    notFound();
  }

  if (!isAdmin && project.timeEntries.length === 0) {
    redirect("/proyectos");
  }

  const completedEntries = project.timeEntries.filter(
    (entry) => entry.durationMin > 0
  );

  const totalMinutes = completedEntries.reduce(
    (sum, entry) => sum + entry.durationMin,
    0
  );

  const byEmployee = new Map();
  for (const entry of completedEntries) {
    const key = entry.employeeId;
    const current = byEmployee.get(key) ?? { name: entry.employee.name, minutes: 0 };
    current.minutes += entry.durationMin;
    byEmployee.set(key, current);
  }

  return (
    <div>
      <NavBar />
      <div className="p-8">
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        <p className="text-zinc-600">{project.description}</p>
        <p className="mt-1 font-semibold">Tiempo total: {formatMinutes(totalMinutes)}</p>

        {isAdmin && <ProjectEditForm key={project.updatedAt.toISOString()} project={project} />}

        <h2 className="mt-6 text-lg font-semibold">Desglose por empleado</h2>
        <ul className="mt-2 text-sm">
          {[...byEmployee.entries()].map(([employeeId, row]) => (
            <li key={employeeId}>
              {row.name} — {formatMinutes(row.minutes)}
            </li>
          ))}
          {byEmployee.size === 0 && <li>Sin entradas registradas</li>}
        </ul>
      </div>
    </div>
  );
}
