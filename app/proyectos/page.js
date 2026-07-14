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
            {project.name} — {project.description} - {project.active}
          </li>
        ))}
      </ul>
    </div>
  );
}
