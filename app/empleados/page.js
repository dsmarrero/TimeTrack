import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentEmployee } from "@/lib/session";
import EmployeeForm from "./EmployeeForm";

export default async function EmployeesPage() {
  const currentEmployee = await getCurrentEmployee();
  if (!currentEmployee || currentEmployee.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const employees = await prisma.employee.findMany();

  return (
    <div>
      <h1>Empleados</h1>
      <EmployeeForm />
      <ul>
        {employees.map((employee) => (
          <li key={employee.id}>
            <Link href={`/empleados/${employee.id}`}>{employee.name}</Link> — {employee.email} — {employee.role === "ADMIN" ? "Administrador" : "Empleado"} - {employee.active ? "Activo" : "Inactivo"}
          </li>
        ))}
      </ul>
    </div>
  );
}
