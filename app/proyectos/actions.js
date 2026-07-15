'use server';
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentEmployee } from "@/lib/session";

export async function createProject(prevState, formData) {
  const employee = await getCurrentEmployee();
  if (!employee || employee.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  const name = formData.get("name");
  const description = formData.get("description");
 
  if (!name || name.trim().length === 0) {
    return { error: "El nombre es obligatorio" };
  }

  await prisma.project.create({
    data: { name, description },
  });

  revalidatePath("/proyectos");
  return { error: null };
}

export async function updateProject(prevState, formData) {
  const employee = await getCurrentEmployee();
  if (!employee || employee.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  const id = formData.get("id");
  const name = formData.get("name");
  const description = formData.get("description");
  const active = formData.get("active") === "on";

  if (!id) {
    return { error: "Proyecto no encontrado" };
  }

  if (!name || name.trim().length === 0) {
    return { error: "El nombre es obligatorio" };
  }

  try {
    await prisma.project.update({
      where: { id },
      data: { name, description, active },
    });
  } catch (err) {
    if (err.code === "P2025") {
      return { error: "Proyecto no encontrado" };
    }
    throw err;
  }

  revalidatePath("/proyectos");
  revalidatePath(`/proyectos/${id}`);
  return { error: null };
}