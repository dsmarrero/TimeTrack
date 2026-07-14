import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/session";
import { logout } from "@/app/logout/actions";

export default async function DashboardPage() {
  const employee = await getCurrentEmployee();
  if (!employee) {
    redirect("/login");
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Hola, {employee.name}</h1>
      <p className="text-zinc-600">Rol: {employee.role}</p>
      <form action={logout}>
        <button type="submit" className="mt-4 text-sm underline">
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
