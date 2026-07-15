'use server';
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentEmployee } from "@/lib/session";

export async function createEmployee(prevState, formData) {
  const employee = await getCurrentEmployee();
  if (!employee || employee.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

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

export async function updateEmployee(prevState, formData) {
  const employee = await getCurrentEmployee();
  if (!employee || employee.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  const id = formData.get("id");
  const name = formData.get("name");
  const email = formData.get("email");
  const role = formData.get("role");
  const active = formData.get("active") === "on";

  if (!id) {
    return { error: "Empleado no encontrado" };
  }

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

  if (id === employee.id && (role !== "ADMIN" || !active)) {
    return { error: "No puedes quitarte a ti mismo el rol de administrador ni desactivarte" };
  }

  try {
    await prisma.employee.update({
      where: { id },
      data: { name, email, role, active },
    });
  } catch (err) {
    if (err.code === "P2002") {
      return { error: "Ese email ya está en uso" };
    }
    if (err.code === "P2025") {
      return { error: "Empleado no encontrado" };
    }
    throw err;
  }

  revalidatePath("/empleados");
  revalidatePath(`/empleados/${id}`);
  return { error: null };
}