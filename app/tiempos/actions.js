'use server';
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentEmployee } from "@/lib/session";

function parseDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createTimeEntry(prevState, formData) {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return { error: "No autorizado" };
  }

  const projectId = formData.get("projectId");
  const startedAt = parseDate(formData.get("startedAt"));
  const endedAt = parseDate(formData.get("endedAt"));
  const note = formData.get("note");

  if (!projectId) {
    return { error: "Selecciona un proyecto" };
  }
  if (!startedAt || !endedAt) {
    return { error: "Fecha de inicio y fin son obligatorias" };
  }
  if (endedAt <= startedAt) {
    return { error: "La fecha de fin debe ser posterior al inicio" };
  }

  const durationMin = Math.round((endedAt - startedAt) / 60000);

  await prisma.timeEntry.create({
    data: {
      employeeId: employee.id,
      projectId,
      startedAt,
      endedAt,
      durationMin,
      note: note || null,
    },
  });

  revalidatePath("/tiempos");
  return { error: null };
}

export async function updateTimeEntry(prevState, formData) {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return { error: "No autorizado" };
  }

  const id = formData.get("id");
  const entry = await prisma.timeEntry.findUnique({ where: { id } });
  if (!entry) {
    return { error: "Entrada no encontrada" };
  }
  if (entry.employeeId !== employee.id && employee.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  const projectId = formData.get("projectId");
  const startedAt = parseDate(formData.get("startedAt"));
  const endedAt = parseDate(formData.get("endedAt"));
  const note = formData.get("note");

  if (!projectId) {
    return { error: "Selecciona un proyecto" };
  }
  if (!startedAt || !endedAt) {
    return { error: "Fecha de inicio y fin son obligatorias" };
  }
  if (endedAt <= startedAt) {
    return { error: "La fecha de fin debe ser posterior al inicio" };
  }

  const durationMin = Math.round((endedAt - startedAt) / 60000);

  await prisma.timeEntry.update({
    where: { id },
    data: { projectId, startedAt, endedAt, durationMin, note: note || null },
  });

  revalidatePath("/tiempos");
  return { error: null };
}

export async function deleteTimeEntry(prevState, formData) {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return { error: "No autorizado" };
  }

  const id = formData.get("id");
  const entry = await prisma.timeEntry.findUnique({ where: { id } });
  if (!entry) {
    return { error: "Entrada no encontrada" };
  }
  if (entry.employeeId !== employee.id && employee.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  await prisma.timeEntry.delete({ where: { id } });

  revalidatePath("/tiempos");
  return { error: null };
}
