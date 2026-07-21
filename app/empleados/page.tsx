import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentEmployee } from "@/lib/session";
import NavBar from "@/components/NavBar";
import Pagination from "@/components/Pagination";
import EmployeeForm from "./EmployeeForm";
import type { Employee } from "@/app/generated/prisma/client";

const PER_PAGE = 10;

interface EmployeesPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function EmployeesPage({ searchParams }: EmployeesPageProps) {
  const currentEmployee = await getCurrentEmployee();
  if (!currentEmployee || currentEmployee.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { page: pageParam = "1" } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [employees, total]: [Employee[], number] = await Promise.all([
    prisma.employee.findMany({
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.employee.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div>
      <NavBar />
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold text-foreground">Empleados</h1>

        <div className="mt-4 rounded-xl border border-border p-6">
          <EmployeeForm />
        </div>

        <ul className="mt-6 divide-y divide-border rounded-xl border border-border">
          {employees.map((employee) => (
            <li key={employee.id}>
              <Link
                href={`/empleados/${employee.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm transition-colors hover:bg-foreground/5"
              >
                <div>
                  <p className="font-medium text-foreground">{employee.name}</p>
                  <p className="text-foreground/60">{employee.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-foreground/10 px-2.5 py-1 text-xs font-medium text-foreground/60">
                    {employee.role === "ADMIN" ? "Administrador" : "Empleado"}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      employee.active ? "bg-brand/10 text-brand" : "bg-foreground/10 text-foreground/50"
                    }`}
                  >
                    {employee.active ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
          {employees.length === 0 && (
            <li className="px-6 py-4 text-sm text-foreground/50">Sin empleados registrados</li>
          )}
        </ul>

        <Pagination page={page} totalPages={totalPages} basePath="/empleados" query={{}} />
      </div>
    </div>
  );
}
