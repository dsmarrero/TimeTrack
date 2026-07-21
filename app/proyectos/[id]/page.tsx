import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentEmployee } from "@/lib/session";
import NavBar from "@/components/NavBar";
import ProjectEditForm from "./ProjectEditForm";
import type { Project, TimeEntry, Employee } from "@/app/generated/prisma/client";

type ProjectWithRelations = Project & {
  timeEntries: (TimeEntry & {
    employee: Employee;
  })[];
};

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h} h ${m} min`;
}

export default async function ProjectDetailPage({ params }:ProjectDetailPageProps) {
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
  }) as ProjectWithRelations | null;

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

  const byEmployee = new Map<string, { name: string; minutes: number }>();
  for (const entry of completedEntries) {
    const key = entry.employeeId;
    const current = byEmployee.get(key) ?? { name: entry.employee.name, minutes: 0 };
    current.minutes += entry.durationMin;
    byEmployee.set(key, current);
  }

  return (
    <div>
      <NavBar />
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold text-foreground">{project.name}</h1>
        {project.description && <p className="mt-1 text-foreground/60">{project.description}</p>}
        <p className="mt-2 font-mono text-sm font-semibold text-foreground">
          Tiempo total: {formatMinutes(totalMinutes)}
        </p>

        {isAdmin && (
          <div className="mt-4 rounded-xl border border-border p-6">
            <ProjectEditForm key={project.updatedAt.toISOString()} project={project} />
          </div>
        )}

        <div className="mt-6 rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground">Desglose por empleado</h2>
          <ul className="mt-3 divide-y divide-border text-sm">
            {[...byEmployee.entries()].map(([employeeId, row]) => (
              <li key={employeeId} className="flex items-center justify-between py-2">
                <span className="text-foreground/80">{row.name}</span>
                <span className="font-mono text-foreground/60">{formatMinutes(row.minutes)}</span>
              </li>
            ))}
            {byEmployee.size === 0 && (
              <li className="py-2 text-foreground/50">Sin entradas registradas</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
