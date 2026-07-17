'use client';

import { useActionState } from "react";
import { createTimeEntry } from "./actions";

export default function TimeEntryForm({ projects }) {
  const [state, formAction, isPending] = useActionState(createTimeEntry, { error: null });

  const inputClass =
    "rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <select name="projectId" defaultValue="" required className={inputClass}>
        <option value="" disabled>
          Selecciona un proyecto
        </option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
      <input type="datetime-local" name="startedAt" required className={inputClass} />
      <input type="datetime-local" name="endedAt" required className={inputClass} />
      <input type="text" name="note" placeholder="Nota" className={inputClass} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Añadiendo..." : "Añadir entrada"}
      </button>
      {state.error && <p className="w-full text-sm text-danger">{state.error}</p>}
    </form>
  );
}
