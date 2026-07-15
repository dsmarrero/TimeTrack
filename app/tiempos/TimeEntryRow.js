'use client';

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateTimeEntry, deleteTimeEntry } from "./actions";

function toLocalInput(date) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function TimeEntryRow({ entry, projects, isAdmin }) {
  const [editing, setEditing] = useState(false);
  const [updateState, updateAction, updatePending] = useActionState(updateTimeEntry, { error: null });
  const [deleteState, deleteAction, deletePending] = useActionState(deleteTimeEntry, { error: null });
  const router = useRouter();
  const wasUpdatePending = useRef(false);

  useEffect(() => {
    if (wasUpdatePending.current && !updatePending && !updateState.error) {
      setEditing(false);
      router.refresh();
    }
    wasUpdatePending.current = updatePending;
  }, [updatePending, updateState, router]);

  if (editing) {
    return (
      <tr className="border-t">
        <td colSpan={isAdmin ? 6 : 5}>
          <form action={updateAction} className="flex flex-wrap items-end gap-2 py-2">
            <input type="hidden" name="id" value={entry.id} />
            <select name="projectId" defaultValue={entry.projectId} required>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <input type="datetime-local" name="startedAt" defaultValue={toLocalInput(entry.startedAt)} required />
            <input type="datetime-local" name="endedAt" defaultValue={toLocalInput(entry.endedAt)} required />
            <input type="text" name="note" defaultValue={entry.note ?? ""} placeholder="Nota" />
            <button type="submit" disabled={updatePending}>
              Guardar
            </button>
            <button type="button" onClick={() => setEditing(false)}>
              Cancelar
            </button>
            {updateState.error && <p className="text-red-600">{updateState.error}</p>}
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t">
      <td>{entry.project.name}</td>
      {isAdmin && <td>{entry.employee.name}</td>}
      <td>{new Date(entry.startedAt).toLocaleString()}</td>
      <td>{new Date(entry.endedAt).toLocaleString()}</td>
      <td>{entry.note}</td>
      <td className="flex gap-2">
        <button type="button" onClick={() => setEditing(true)}>
          Editar
        </button>
        <form
          action={deleteAction}
          onSubmit={(e) => {
            if (!confirm("¿Eliminar esta entrada?")) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={entry.id} />
          <button type="submit" disabled={deletePending}>
            Eliminar
          </button>
        </form>
        {deleteState.error && <p className="text-red-600">{deleteState.error}</p>}
      </td>
    </tr>
  );
}
