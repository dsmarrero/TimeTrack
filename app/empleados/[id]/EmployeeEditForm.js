'use client'

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateEmployee } from "../actions";

export default function EmployeeEditForm({ employee }) {
  const [state, formAction, isPending] = useActionState(updateEmployee, { error: null });
  const router = useRouter();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !isPending && !state.error) {
      router.refresh();
    }
    wasPending.current = isPending;
  }, [isPending, state, router]);

  const inputClass =
    "rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="id" value={employee.id} />

      <input type="text" name="name" placeholder="Nombre" defaultValue={employee.name} className={inputClass} />
      <input type="email" name="email" placeholder="Email" defaultValue={employee.email} className={inputClass} />

      <select name="role" defaultValue={employee.role} className={inputClass}>
        <option value="EMPLOYEE">Empleado</option>
        <option value="ADMIN">Administrador</option>
      </select>

      <label className="flex items-center gap-2 pb-2 text-sm text-foreground/70">
        <input
          type="checkbox"
          name="active"
          defaultChecked={employee.active}
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
