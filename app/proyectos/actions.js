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