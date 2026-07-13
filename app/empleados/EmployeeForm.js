'use client'

import { useActionState } from "react";
import { createEmployee } from "./actions";

export default function EmployeeForm() {
  const [state, formAction, isPending] = useActionState(createEmployee, { error: null });

  return (
    <form action={formAction}>
      <input type="text" name="name" placeholder="Nombre" />
      <input type="email" name="email" placeholder="Email" />

      <select name="role" defaultValue="EMPLOYEE">
        <option value="EMPLOYEE">Empleado</option>
        <option value="ADMIN">Administrador</option>
      </select>

      <button type="submit" disabled={isPending}>
        Crear empleado
      </button>

      {state.error && <p>{state.error}</p>}
    </form>
  );
}
