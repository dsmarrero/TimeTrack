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
      <h1>Proyectos</h1>
      {isAdmin && <ProjectForm />}

      <form method="GET">
        <input type="text" name="q" placeholder="Buscar proyecto..." defaultValue={q} />
        <select name="estado" defaultValue={estado}>
          <option value="todos">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
        <button type="submit">Filtrar</button>
      </form>

      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <Link href={`/proyectos/${project.id}`}>{project.name}</Link> - {project.description} - {project.active ? "Activo" : "Inactivo"}
          </li>
        ))}
      </ul>
    </div>
  );
}
