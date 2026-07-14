'use client'

import { useActionState } from "react";
import { updateEmployee } from "../actions";

export default function EmployeeEditForm({ employee }) {
  const [state, formAction, isPending] = useActionState(updateEmployee, { error: null });

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={employee.id} />

      <input type="text" name="name" placeholder="Nombre" defaultValue={employee.name} />
      <input type="email" name="email" placeholder="Email" defaultValue={employee.email} />

      <select name="role" defaultValue={employee.role}>
        <option value="EMPLOYEE">Empleado</option>
        <option value="ADMIN">Administrador</option>
      </select>

      <label>
        <input type="checkbox" name="active" defaultChecked={employee.active} />
        Activo
      </label>

      <button type="submit" disabled={isPending}>
        Guardar cambios
      </button>

      {state.error && <p>{state.error}</p>}
    </form>
  );
}
