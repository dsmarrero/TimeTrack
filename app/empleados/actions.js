'use server';
import { prisma } from "@/lib/prisma"; 
import { revalidatePath } from "next/cache";

export async function createEmployee(prevState, formData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const role = formData.get("role");

  if (!name || name.trim().length === 0) {
    return { error: "El nombre es obligatorio" };
  }

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(email)) {
    return { error: "Email no válido" };
  }

  if (role !== "ADMIN" && role !== "EMPLOYEE") {
    return { error: "Rol no válido" };
  }

  await prisma.employee.create({
    data: { name, email, role },
  });

  revalidatePath("/empleados");
  return { error: null };
}