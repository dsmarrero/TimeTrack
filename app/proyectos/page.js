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
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold text-foreground">Proyectos</h1>

        {isAdmin && (
          <div className="mt-4 rounded-xl border border-border p-6">
            <ProjectForm />
          </div>
        )}

        <form method="GET" className="mt-6 flex flex-wrap items-end gap-3 text-sm">
          <label className="flex flex-col gap-1 text-foreground/70">
            Buscar
            <input
              type="text"
              name="q"
              placeholder="Buscar proyecto..."
              defaultValue={q}
              className="rounded-md border border-border bg-transparent px-3 py-2 text-foreground placeholder:text-foreground/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </label>
          <label className="flex flex-col gap-1 text-foreground/70">
            Estado
            <select
              name="estado"
              defaultValue={estado}
              className="rounded-md border border-border bg-transparent px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </label>
          <button
            type="submit"
            className="rounded-md bg-brand px-4 py-2 font-medium text-white transition-colors hover:bg-brand-hover"
          >
            Filtrar
          </button>
          <Link href="/proyectos" className="px-2 py-2 text-foreground/60 hover:text-brand">
            Borrar filtro
          </Link>
        </form>

        <ul className="mt-6 divide-y divide-border rounded-xl border border-border">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/proyectos/${project.id}`}
                className="flex items-center justify-between gap-3 px-6 py-4 text-sm transition-colors hover:bg-foreground/5"
              >
                <div>
                  <p className="font-medium text-foreground">{project.name}</p>
                  {project.description && (
                    <p className="text-foreground/60">{project.description}</p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    project.active
                      ? "bg-brand/10 text-brand"
                      : "bg-foreground/10 text-foreground/50"
                  }`}
                >
                  {project.active ? "Activo" : "Inactivo"}
                </span>
              </Link>
            </li>
          ))}
          {projects.length === 0 && (
            <li className="px-6 py-4 text-sm text-foreground/50">Sin proyectos registrados</li>
          )}
        </ul>
      </div>
    </div>
  );
}
