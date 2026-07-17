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

  const inputClass =
    "rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";

  const mobileLabelClass = "text-xs font-semibold uppercase tracking-wide text-foreground/40 md:hidden";

  if (editing) {
    return (
      <tr className="block rounded-lg border border-border p-4 md:table-row md:rounded-none md:border-0 md:p-0">
        <td colSpan={isAdmin ? 6 : 5} className="block md:table-cell md:px-4 md:py-3">
          <form action={updateAction} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="id" value={entry.id} />
            <select name="projectId" defaultValue={entry.projectId} required className={inputClass}>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              name="startedAt"
              defaultValue={toLocalInput(entry.startedAt)}
              required
              className={inputClass}
            />
            <input
              type="datetime-local"
              name="endedAt"
              defaultValue={toLocalInput(entry.endedAt)}
              required
              className={inputClass}
            />
            <input
              type="text"
              name="note"
              defaultValue={entry.note ?? ""}
              placeholder="Nota"
              className={inputClass}
            />
            <button
              type="submit"
              disabled={updatePending}
              className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updatePending ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/60 hover:text-foreground"
            >
              Cancelar
            </button>
            {updateState.error && <p className="w-full text-sm text-danger">{updateState.error}</p>}
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="block rounded-lg border border-border p-4 text-foreground/80 md:table-row md:rounded-none md:border-0 md:p-0">
      <td className="flex items-center justify-between py-1 md:table-cell md:px-4 md:py-3">
        <span className={mobileLabelClass}>Proyecto</span>
        <span>{entry.project.name}</span>
      </td>
      {isAdmin && (
        <td className="flex items-center justify-between py-1 md:table-cell md:px-4 md:py-3">
          <span className={mobileLabelClass}>Empleado</span>
          <span>{entry.employee.name}</span>
        </td>
      )}
      <td className="flex items-center justify-between py-1 md:table-cell md:px-4 md:py-3">
        <span className={mobileLabelClass}>Inicio</span>
        <span className="font-mono text-foreground/60">
          {new Date(entry.startedAt).toLocaleString()}
        </span>
      </td>
      <td className="flex items-center justify-between py-1 md:table-cell md:px-4 md:py-3">
        <span className={mobileLabelClass}>Fin</span>
        <span className="font-mono text-foreground/60">
          {new Date(entry.endedAt).toLocaleString()}
        </span>
      </td>
      <td className="flex items-center justify-between py-1 md:table-cell md:px-4 md:py-3">
        <span className={mobileLabelClass}>Nota</span>
        <span className="text-right md:text-left">{entry.note}</span>
      </td>
      <td className="pt-2 md:table-cell md:px-4 md:py-3">
        <div className="flex items-center justify-end gap-3 md:justify-start">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="font-medium text-brand hover:underline"
          >
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
            <button
              type="submit"
              disabled={deletePending}
              className="font-medium text-danger hover:underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              Eliminar
            </button>
          </form>
        </div>
        {deleteState.error && <p className="mt-1 text-right text-sm text-danger md:text-left">{deleteState.error}</p>}
      </td>
    </tr>
  );
}
