"use client";

import { useState } from "react";
import Link from "next/link";
import BackButton from "./BackButton";

const baseLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/tiempos", label: "Tiempos" },
  { href: "/informes", label: "Informes" },
];

export default function NavMenu({ isAdmin, employeeName, employeeRoleLabel, logoutAction }) {
  const [open, setOpen] = useState(false);
  const links = isAdmin ? [...baseLinks, { href: "/empleados", label: "Empleados" }] : baseLinks;

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
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      <div
        className={`${open ? "flex" : "hidden"} flex-col gap-3 pt-3 md:flex md:flex-row md:items-center md:gap-5 md:pt-0`}
      >
        <nav className="flex flex-col gap-3 font-medium md:flex-row md:items-center md:gap-5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-foreground/70 transition-colors hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-between gap-4 border-t border-border pt-3 md:border-t-0 md:pt-0">
          <span className="text-foreground/60">
            {employeeName}{" "}
            <span className="text-foreground/40">({employeeRoleLabel})</span>
          </span>
          <form action={logoutAction}>
            <button type="submit" className="font-medium text-danger hover:underline">
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
