'use client'

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateProject } from "../actions";
import type { Project, TimeEntry, Employee } from "@/app/generated/prisma/client";

type ProjectWithRelations = Project & {
  timeEntries?: (TimeEntry & {
    employee?: Employee;
  })[];
};

interface ProjectEditFormProps {
  project: ProjectWithRelations;
}

export default function ProjectEditForm({ project }: ProjectEditFormProps) {
  const [state, formAction, isPending] = useActionState(updateProject, { error: null });
  const router = useRouter();
  const wasPending = useRef(false);

  const activeWorkers = project.timeEntries?.filter((entry) => !entry.endedAt).length ?? 0;

  useEffect(() => {
    if (wasPending.current && !isPending && !state?.error) {
      router.refresh();
    }
    wasPending.current = isPending;
  }, [isPending, state, router]);

  function handleSubmit(e) {
    const form = e.currentTarget;
    const activeCheckbox = form.elements.namedItem("active") as HTMLInputElement | null;
    
    if (project.active && !activeCheckbox.checked && activeWorkers > 0) {
      const message =
        activeWorkers === 1
          ? "Hay 1 persona trabajando en este proyecto. ¿Seguro que quieres desactivarlo?"
          : `Hay ${activeWorkers} personas trabajando en este proyecto. ¿Seguro que quieres desactivarlo?`;
      if (!confirm(message)) {
        e.preventDefault();
        activeCheckbox.checked = true;
      }
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="id" value={project.id} />

      <label className="flex flex-1 min-w-40 flex-col gap-1 text-sm text-foreground/70">
        Nombre
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          defaultValue={project.name}
          className="rounded-md border border-border bg-transparent px-3 py-2 text-foreground placeholder:text-foreground/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </label>
      <label className="flex flex-1 min-w-56 flex-col gap-1 text-sm text-foreground/70">
        Descripción
        <input
          type="text"
          name="description"
          placeholder="Descripción"
          defaultValue={project.description ?? ""}
          className="rounded-md border border-border bg-transparent px-3 py-2 text-foreground placeholder:text-foreground/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </label>

      <label className="flex items-center gap-2 pb-2 text-sm text-foreground/70">
        <input
          type="checkbox"
          name="active"
          defaultChecked={project.active}
          className="h-4 w-4 rounded border-border text-brand focus:ring-brand/30"
        />
        Activo
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Guardando..." : "Guardar cambios"}
      </button>

      {state.error && <p className="w-full text-sm text-danger">{state.error}</p>}
    </form>
  );
}
