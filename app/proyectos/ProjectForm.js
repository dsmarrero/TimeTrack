'use client'

import { useActionState } from "react";
import { createProject } from "./actions";

export default function ProjectForm() {
  const [state, formAction, isPending] = useActionState(createProject, { error: null });

  return (
    <form action={formAction}>
      <input type="text" name="name" placeholder="Nombre" />
      <input type="textarea" name="description" placeholder="Descripción" />

      <button type="submit" disabled={isPending}>
        Crear proyecto
      </button>

      {state.error && <p>{state.error}</p>}
    </form>
  );
}
