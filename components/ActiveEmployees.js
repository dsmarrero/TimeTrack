"use client";

import { useEffect, useState } from "react";

function formatElapsed(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function ActiveEmployees({ entries }) {
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(Date.now());
    if (entries.length === 0) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [entries.length]);

  if (entries.length === 0) {
    return <p className="py-2 text-sm text-foreground/50">Nadie está trabajando</p>;
  }

  return (
    <ul className="divide-y divide-border text-sm">
      {entries.map((entry) => {
        const startedAt = new Date(entry.startedAt).getTime();
        return (
          <li key={entry.id} className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className="font-medium text-foreground">{entry.employeeName}</p>
              <p className="text-foreground/60">{entry.projectName}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
              </span>
              <span className="font-mono text-live">
                {now === null ? "--:--:--" : formatElapsed(now - startedAt)}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
