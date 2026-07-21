"use client";

import { useEffect, useState } from "react";
import { IconMoonFilled } from '@tabler/icons-react';
import { IconSun } from '@tabler/icons-react';


type Theme = "dark" | "light";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    setTheme(
      stored ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    );
  }, []);

  function toggle(): void {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
      className="flex h-9 w-9 items-center justify-center text-foreground/70 hover:text-brand"
    >
      {theme === "dark" ? (
        <IconSun stroke={2} />
      ) : (
        <IconMoonFilled />
      )}
    </button>
  );
}
