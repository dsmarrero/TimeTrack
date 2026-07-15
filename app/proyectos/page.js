import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentEmployee } from "@/lib/session";
import NavBar from "@/components/NavBar";
import ProjectForm from "./ProjectForm";

export default async function ProjectsPage({ searchParams }) {
  const currentEmployee = await getCurrentEmployee();
  const isAdmin = currentEmployee?.role === "ADMIN";

  const { q = "", estado = "todos" } = await searchParams;

  const where = {};
  if (q) {
    where.name = { contains: q, mode: "insensitive" };
  }
  if (estado === "activo") where.active = true;
  if (estado === "inactivo") where.active = false;
  if (!isAdmin) {
    where.timeEntries = { some: { employeeId: currentEmployee?.id } };
  }

  const projects = await prisma.project.findMany({ where });

  return (
    <div>
      <NavBar />
      <div className="p-8">
        <h1 className="text-2xl font-semibold">Proyectos</h1>
        {isAdmin && <ProjectForm />}

        <form method="GET" className="mt-4 flex flex-wrap items-end gap-2 text-sm">
          <label className="flex flex-col">
            Buscar
            <input type="text" name="q" placeholder="Buscar proyecto..." defaultValue={q} />
          </label>
          <label className="flex flex-col">
            Estado
            <select name="estado" defaultValue={estado}>
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </label>
          <button type="submit">Filtrar</button>
        </form>

        <ul className="mt-6 text-sm">
          {projects.map((project) => (
            <li key={project.id}>
              <Link href={`/proyectos/${project.id}`} className="underline">
                {project.name}
              </Link>{" "}
              — {project.description} — {project.active ? "Activo" : "Inactivo"}
            </li>
          ))}
          {projects.length === 0 && <li>Sin proyectos registrados</li>}
        </ul>
      </div>
    </div>
  );
}
