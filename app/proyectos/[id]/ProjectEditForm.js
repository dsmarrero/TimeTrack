'use client'

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateProject } from "../actions";

export default function ProjectEditForm({ project }) {
  const [state, formAction, isPending] = useActionState(updateProject, { error: null });
  const router = useRouter();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !isPending && !state.error) {
      router.refresh();
    }
    wasPending.current = isPending;
  }, [isPending, state, router]);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={project.id} />

      <input type="text" name="name" placeholder="Nombre" defaultValue={project.name} />
      <input type="text" name="description" placeholder="Descripción" defaultValue={project.description ?? ""} />

      <label>
        <input type="checkbox" name="active" defaultChecked={project.active} />
        Activo
      </label>

      <button type="submit" disabled={isPending}>
        Guardar cambios
      </button>

      {state.error && <p>{state.error}</p>}
    </form>
  );
}
