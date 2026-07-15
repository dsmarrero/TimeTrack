import Link from "next/link";
import { getCurrentEmployee } from "@/lib/session";
import { logout } from "@/app/logout/actions";
import BackButton from "./BackButton";

export default async function NavBar() {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return null;
  }

  const isAdmin = employee.role === "ADMIN";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4 text-sm">
      <div className="flex flex-wrap items-center gap-4">
        <BackButton />
        <nav className="flex flex-wrap gap-4 underline">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/proyectos">Proyectos</Link>
          <Link href="/tiempos">Tiempos</Link>
          <Link href="/informes">Informes</Link>
          {isAdmin && <Link href="/empleados">Empleados</Link>}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <span>
          {employee.name} ({employee.role === "ADMIN" ? "Administrador" : "Empleado"})
        </span>
        <form action={logout}>
          <button type="submit" className="underline">
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
