import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProjectForm from "./ProjectForm";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany();

  return (
    <div>
      <h1>Proyectos</h1>
      <ProjectForm />
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <Link href={`/proyectos/${project.id}`}>{project.name}</Link> — {project.description} - {project.active}
          </li>
        ))}
      </ul>
    </div>
  );
}
