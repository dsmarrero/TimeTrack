'use client';

import { useActionState, useEffect, useState } from "react";
import { startTimer, stopTimer } from "../app/dashboard/actions";

function formatElapsed(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function Cronometro({ activeEntry, projects }) {
  const [startState, startAction, startPending] = useActionState(startTimer, { error: null });
  const [stopState, stopAction, stopPending] = useActionState(stopTimer, { error: null });
  const [elapsed, setElapsed] = useState(0);

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
      <div className="mt-4">
        <p>Proyecto activo: {activeEntry.project.name}</p>
        <p className="text-3xl font-mono">{formatElapsed(elapsed)}</p>
        <form action={stopAction}>
          <input type="hidden" name="entryId" value={activeEntry.id} />
          <button type="submit" disabled={stopPending}>
            Detener
          </button>
        </form>
        {stopState.error && <p className="text-red-600">{stopState.error}</p>}
      </div>
    );
  }

  return (
    <div className="mt-4">
      <form action={startAction}>
        <select name="projectId" defaultValue="">
          <option value="" disabled>
            Selecciona un proyecto
          </option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <button type="submit" disabled={startPending}>
          Iniciar
        </button>
      </form>
      {startState.error && <p className="text-red-600">{startState.error}</p>}
    </div>
  );
}
