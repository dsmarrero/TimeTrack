'use server';
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentEmployee } from "@/lib/session";
import { adminAuth } from "@/lib/firebase-admin";
import error from "../error";

interface ActionResponse {
  error: string | null;
}

interface FirebaseError extends Error {
  code?: string;
}

interface PrismaError extends Error {
  code?: string;
}

export async function createEmployee(prevState:ActionResponse, formData: FormData): Promise<ActionResponse> {
  const employee = await getCurrentEmployee();
  if (!employee || employee.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const role = formData.get("role")?.toString();

  if (!name || name.trim().length === 0) {
    return { error: "El nombre es obligatorio" };
  }

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(email)) {
    return { error: "Email no válido" };
  }

  
  if (!password || password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" };
  }

  if (role !== "ADMIN" && role !== "EMPLOYEE") {
    return { error: "Rol no válido" };
  }

  let firebaseUser;
  try {
    firebaseUser = await adminAuth.createUser({ email, password, displayName: name });
  } catch (err) {
    if (err.code === "auth/email-already-exists") {
      return { error: "Ese email ya está registrado" };
    }
    return { error: "No se pudo crear el usuario de acceso" };
  }

  try {
    await prisma.employee.create({
      data: { name, email, role },
    });
  } catch (err: unknown) {
    await adminAuth.deleteUser(firebaseUser.uid);
    const error = err as PrismaError;
    if (error.code === "P2002") {
      return { error: "Ese email ya está en uso" };
    }
    throw err;
  }

  revalidatePath("/empleados");
  return { error: null };
}

export async function updateEmployee(prevState:ActionResponse, formData: FormData): Promise<ActionResponse> {
  const employee = await getCurrentEmployee();
  if (!employee || employee.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  const id = formData.get("id")?.toString();
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const role = formData.get("role")?.toString();
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

  const existing = await prisma.employee.findUnique({ where: { id } });
  if (!existing) {
    return { error: "Empleado no encontrado" };
  }

  try {
    await prisma.employee.update({
      where: { id },
      data: { name, email, role, active },
    });
  } catch (err: unknown) {
    const error = err as PrismaError;
    if (error.code === "P2002") {
      return { error: "Ese email ya está en uso" };
    }
    if (error.code === "P2025") {
      return { error: "Empleado no encontrado" };
    }
    throw err;
  }

  try {
    const firebaseUser = await adminAuth.getUserByEmail(existing.email);
    await adminAuth.updateUser(firebaseUser.uid, { email, disabled: !active });
  } catch {
  }

  revalidatePath("/empleados");
  revalidatePath(`/empleados/${id}`);
  return { error: null };
}

export async function deleteEmployee(id: string): Promise<ActionResponse> {
  const employee = await getCurrentEmployee();
  
  if (!employee || employee.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  if (id === employee.id) {
    return { error: "No puedes eliminar tu propia cuenta" };
  }

  const existing = await prisma.employee.findUnique({ where: { id } });
  if (!existing) {
    return { error: "Empleado no encontrado" };
  }

  try {
    const firebaseUser = await adminAuth.getUserByEmail(existing.email);
    await adminAuth.deleteUser(firebaseUser.uid);
  } catch (err) {
    console.warn("Usuario no encontrado en Firebase, procediendo con la BD:", err);
  }

  try {
    await prisma.employee.delete({
      where: { id },
    });
  } catch (err: unknown) {
    const error = err as PrismaError;
    if (error.code === "P2025") {
      return { error: "Empleado no encontrado en la base de datos" };
    }
    throw err;
  }

  revalidatePath("/empleados");
  return { error: null };
}