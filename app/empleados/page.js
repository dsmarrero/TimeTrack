import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentEmployee } from "@/lib/session";
import NavBar from "@/components/NavBar";
import EmployeeForm from "./EmployeeForm";

export default async function EmployeesPage() {
  const currentEmployee = await getCurrentEmployee();
  if (!currentEmployee || currentEmployee.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const employees = await prisma.employee.findMany();

  return (
    <div>
      <NavBar />
      <div className="p-8">
        <h1 className="text-2xl font-semibold">Empleados</h1>
        <EmployeeForm />
        <ul className="mt-6 text-sm">
          {employees.map((employee) => (
            <li key={employee.id}>
              <Link href={`/empleados/${employee.id}`} className="underline">
                {employee.name}
              </Link>{" "}
              — {employee.email} — {employee.role === "ADMIN" ? "Administrador" : "Empleado"} —{" "}
              {employee.active ? "Activo" : "Inactivo"}
            </li>
          ))}
          {employees.length === 0 && <li>Sin empleados registrados</li>}
        </ul>
      </div>
    </div>
  );
}
