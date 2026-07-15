'use client';

import { useActionState } from "react";
import { createTimeEntry } from "./actions";

export default function TimeEntryForm({ projects }) {
  const [state, formAction, isPending] = useActionState(createTimeEntry, { error: null });

  return (
    <form action={formAction} className="mt-4 flex flex-wrap items-end gap-2">
      <select name="projectId" defaultValue="" required>
        <option value="" disabled>
          Selecciona un proyecto
        </option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
      <input type="datetime-local" name="startedAt" required />
      <input type="datetime-local" name="endedAt" required />
      <input type="text" name="note" placeholder="Nota" />
      <button type="submit" disabled={isPending}>
        Añadir entrada
      </button>
      {state.error && <p className="text-red-600">{state.error}</p>}
    </form>
  );
}
