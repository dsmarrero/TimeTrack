'use client'

import { useActionState } from "react";
import { createEmployee } from "./actions";

const initialState = {
  error: null as string | null,
};

export default function EmployeeForm() {
  const [state, formAction, isPending] = useActionState(createEmployee, initialState);

  const inputClass =
    "rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="text" name="name" placeholder="Nombre" className={inputClass} />
      <input type="email" name="email" placeholder="Email" className={inputClass} />
      <input type="password" name="password" placeholder="Contraseña" minLength={6} className={inputClass} />

      <select name="role" defaultValue="EMPLOYEE" className={inputClass}>
        <option value="EMPLOYEE">Empleado</option>
        <option value="ADMIN">Administrador</option>
      </select>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Creando..." : "Crear empleado"}
      </button>

      {state?.error && <p className="w-full text-sm text-danger">{state.error}</p>}
    </form>
  );
}
