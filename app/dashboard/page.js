import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/session";
import { logout } from "@/app/logout/actions";
import { prisma } from "@/lib/prisma";
import Cronometro from "./Cronometro";

export default async function DashboardPage() {
  const employee = await getCurrentEmployee();
  if (!employee) {
    redirect("/login");
  }

  const [activeEntry, projects] = await Promise.all([
    prisma.timeEntry.findFirst({
      where: { employeeId: employee.id, endedAt: null },
      include: { project: true },
    }),
    prisma.project.findMany({ where: { active: true } }),
  ]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Hola, {employee.name}</h1>
      <p className="text-zinc-600">Rol: {employee.role}</p>
      <Cronometro activeEntry={activeEntry} projects={projects} />
      <form action={logout}>
        <button type="submit" className="mt-4 text-sm underline">
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
