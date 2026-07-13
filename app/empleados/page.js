import { prisma } from "@/lib/prisma";
import EmployeeForm from "./EmployeeForm";

export default async function EmployeesPage() {
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
