'use client';

import { useActionState, useEffect, useState } from "react";
import { startTimer, stopTimer } from "../app/dashboard/actions";

// const timeLimit = 8 * 60 * 60 * 1000; // 8 horas
const timeLimit = 10 * 1000 // 10 s

function formatElapsed(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function Chrono ({ activeEntry, projects }) {
  const [startState, startAction, startPending] = useActionState(startTimer, { error: null });
  const [stopState, stopAction, stopPending] = useActionState(stopTimer, { error: null });
  const [elapsed, setElapsed] = useState(0);
  const tooMuchTime = elapsed > timeLimit;

  useEffect(() => {
    if (!activeEntry) return;
    const startedAt = new Date(activeEntry.startedAt).getTime();
    const tick = () => setElapsed(Date.now() - startedAt);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeEntry]);

  if (activeEntry) {
    return (
      <div className="rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 text-sm font-medium text-live">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
          </span>
          En curso
        </div>
        <p className="mt-2 text-foreground/70">Proyecto activo: {activeEntry.project.name}</p>
        <p className="mt-1 font-mono text-4xl font-semibold tabular-nums text-foreground">
          {formatElapsed(elapsed)}
        </p>
        {tooMuchTime && (
          <p className="mt-3 rounded-md bg-danger/10 px-3 py-2 text-sm font-semibold text-danger">
            El cronómetro lleva activo 8 horas
          </p>
        )}
        <form action={stopAction} className="mt-4">
          <input type="hidden" name="entryId" value={activeEntry.id} />
          <button
            type="submit"
            disabled={stopPending}
            className="rounded-md bg-danger px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {stopPending ? "Deteniendo..." : "Detener"}
          </button>
        </form>
        {stopState.error && <p className="mt-2 text-sm text-danger">{stopState.error}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border p-6">
      <form action={startAction} className="flex flex-wrap items-center gap-3">
        <select
          name="projectId"
          defaultValue=""
          className="rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        >
          <option value="" disabled>
            Selecciona un proyecto
          </option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={startPending}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {startPending ? "Iniciando..." : "Iniciar"}
        </button>
      </form>
      {startState.error && <p className="mt-2 text-sm text-danger">{startState.error}</p>}
    </div>
  );
}
