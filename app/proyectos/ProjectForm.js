'use client'

import { useActionState } from "react";
import { createProject } from "./actions";

export default function ProjectForm() {
  const [state, formAction, isPending] = useActionState(createProject, { error: null });

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-1 min-w-[10rem] flex-col gap-1 text-sm text-foreground/70">
        Nombre
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          className="rounded-md border border-border bg-transparent px-3 py-2 text-foreground placeholder:text-foreground/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </label>
      <label className="flex flex-1 min-w-[14rem] flex-col gap-1 text-sm text-foreground/70">
        Descripción
        <input
          type="text"
          name="description"
          placeholder="Descripción"
          className="rounded-md border border-border bg-transparent px-3 py-2 text-foreground placeholder:text-foreground/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Creando..." : "Crear proyecto"}
      </button>

      {state.error && <p className="w-full text-sm text-danger">{state.error}</p>}
    </form>
  );
}
