'use server';
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentEmployee } from "@/lib/session";

type ActionResponse = {
  error: string | null;
};

export async function createProject(prevState: ActionResponse, formData: FormData,): Promise<ActionResponse> {
  const employee = await getCurrentEmployee();
  if (!employee || employee.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
 
  if (!name || name.trim().length === 0) {
    return { error: "El nombre es obligatorio" };
  }

  await prisma.project.create({
    data: { name, description },
  });

  revalidatePath("/proyectos");
  return { error: null };
}

export async function updateProject(prevState: ActionResponse, formData: FormData,): Promise<ActionResponse> {
  const employee = await getCurrentEmployee();
  if (!employee || employee.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
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