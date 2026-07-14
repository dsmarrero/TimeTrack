'use server';
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentEmployee } from "@/lib/session";

export async function startTimer(prevState, formData) {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return { error: "No autorizado" };
  }

  const projectId = formData.get("projectId");
  if (!projectId) {
    return { error: "Selecciona un proyecto" };
  }

  const activeEntry = await prisma.timeEntry.findFirst({
    where: { employeeId: employee.id, endedAt: null },
  });
  if (activeEntry) {
    return { error: "Ya tienes un cronómetro activo" };
  }

  await prisma.timeEntry.create({
    data: {
      employeeId: employee.id,
      projectId,
      startedAt: new Date(),
    },
  });

  revalidatePath("/dashboard");
  return { error: null };
}

export async function stopTimer(prevState, formData) {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return { error: "No autorizado" };
  }

  const entryId = formData.get("entryId");
  const entry = await prisma.timeEntry.findUnique({ where: { id: entryId } });

  if (!entry || entry.endedAt) {
    return { error: "Entrada no encontrada o ya cerrada" };
  }
  if (entry.employeeId !== employee.id && employee.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  const endedAt = new Date();
  const durationMin = Math.round((endedAt - entry.startedAt) / 60000);

  await prisma.timeEntry.update({
    where: { id: entryId },
    data: { endedAt, durationMin },
  });

  revalidatePath("/dashboard");
  return { error: null };
}
