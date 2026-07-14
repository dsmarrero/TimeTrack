import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentEmployee } from "@/lib/session";
import ProjectForm from "./ProjectForm";

export default async function ProjectsPage() {
  const currentEmployee = await getCurrentEmployee();
  const isAdmin = currentEmployee?.role === "ADMIN";

  const projects = await prisma.project.findMany();

  return (
    <div>
      <h1>Proyectos</h1>
      {isAdmin && <ProjectForm />}
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
