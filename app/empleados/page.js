import { redirect } from "next/navigation";
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
            {employee.name} — {employee.email} — {employee.role} - {employee.active}
          </li>
        ))}
      </ul>
    </div>
  );
}
