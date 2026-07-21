import { getCurrentEmployee } from "@/lib/session";
import { logout } from "@/app/logout/actions";
import NavMenu from "./NavMenu";

interface employee {
name: string;
role: "ADMIN" | "EMPLOYEE";
}

export default async function NavBar() {
  const employee: employee | null = await getCurrentEmployee();
  if (!employee) {
    return null;
  }

  const isAdmin: boolean = employee.role === "ADMIN";

  return (
    <div className="sticky top-0 z-10 border-b border-border bg-background px-4 py-3 text-sm md:px-6 md:py-4">
      <NavMenu
        isAdmin={isAdmin}
        employeeName={employee.name}
        employeeRoleLabel={isAdmin ? "Administrador" : "Empleado"}
        logoutAction={logout}
      />
    </div>
  );
}
