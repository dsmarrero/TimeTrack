"use client";

import { useState } from "react";
import Link from "next/link";
import BackButton from "./BackButton";
import ThemeToggle from "./ThemeToggle";
import {
  IconDashboard,
  IconFolder,
  IconClock,
  IconFileAnalytics,
  IconUsers,
  IconLogout,
} from "@tabler/icons-react";

const baseLinks = [
  { href: "/dashboard", label: "Dashboard", icon: IconDashboard },
  { href: "/proyectos", label: "Proyectos", icon: IconFolder },
  { href: "/tiempos", label: "Tiempos", icon: IconClock },
  { href: "/informes", label: "Informes", icon: IconFileAnalytics },
];

export default function NavMenu({
  isAdmin,
  employeeName,
  employeeRoleLabel,
  logoutAction,
}) {
  const [open, setOpen] = useState(false);
  const links = isAdmin
    ? [
        ...baseLinks,
        { href: "/empleados", label: "Empleados", icon: IconUsers },
      ]
    : baseLinks;

  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="flex items-center justify-between gap-3">
        <BackButton />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center text-foreground/70 hover:text-brand md:hidden"
        >
          <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      <div
        className={`${open ? "flex" : "hidden"} flex-col gap-3 pt-3 md:flex md:flex-row md:items-center md:gap-5 md:pt-0`}
      >
        <nav className="flex flex-col gap-3 font-medium md:flex-row md:items-center md:gap-5">
          {links.map((link) => {
            const IconComponent = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 text-foreground/70 transition-colors hover:text-brand"
              >
                {IconComponent && <IconComponent size={18} stroke={1.5} />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-between gap-4 border-t border-border pt-3 md:border-t-0 md:pt-0">
          <span className="text-foreground/60">
            {employeeName}{" "}
            <span className="text-foreground/40">({employeeRoleLabel})</span>
          </span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <form action={logoutAction}>
              <button
                type="submit"
                className="font-medium text-danger hover:underline"
              >
              <div className="flex items-center gap-2">
                <IconLogout size={16} />
                Cerrar sesión
              </div>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
