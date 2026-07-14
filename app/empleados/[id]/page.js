import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentEmployee } from "@/lib/session";
import EmployeeEditForm from "./EmployeeEditForm";

export default async function EmployeeDetailPage({ params }) {
  const currentEmployee = await getCurrentEmployee();
  if (!currentEmployee || currentEmployee.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;

  const employee = await prisma.employee.findUnique({ where: { id } });
  if (!employee) {
    notFound();
  }

  return (
    <div>
      <h1>{employee.name}</h1>
      <EmployeeEditForm employee={employee} />
    </div>
  );
}
