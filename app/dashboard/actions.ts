'use server';
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentEmployee } from "@/lib/session";
import { logAudit } from "@/lib/audit";

interface ActionResponse {
error: string | null;
}

export async function startTimer(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return { error: "No autorizado" };
  }

  const projectId = formData.get("projectId");
if (!projectId || typeof projectId !== "string") {
    return { error: "Selecciona un proyecto" };
  }

  const activeEntry = await prisma.timeEntry.findFirst({
    where: { employeeId: employee.id, endedAt: null },
  });
  if (activeEntry) {
    return { error: "Ya tienes un cronómetro activo" };
  }

  await prisma.$transaction(async (tx) => {
    const created = await tx.timeEntry.create({
      data: {
        employeeId: employee.id,
        projectId,
        startedAt: new Date(),
      },
    });
    await logAudit(tx, {
      timeEntryId: created.id,
      action: "CREATE",
      changedBy: employee.id,
      before: null,
      after: created,
    });
  });

  revalidatePath("/dashboard");
  return { error: null };
}

export async function stopTimer(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return { error: "No autorizado" };
  }

  const entryId = formData.get("entryId");
  if (!entryId || typeof entryId !== "string") {
    return { error: "Entrada no válida" };
  }

  const entry = await prisma.timeEntry.findUnique({ where: { id: entryId } });

  if (!entry || entry.endedAt) {
    return { error: "Entrada no encontrada o ya cerrada" };
  }
  if (entry.employeeId !== employee.id && employee.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  const endedAt = new Date();
const durationMin = Math.round((endedAt.getTime() - entry.startedAt.getTime()) / 60000);

  await prisma.$transaction(async (tx) => {
    const updated = await tx.timeEntry.update({
      where: { id: entryId },
      data: { endedAt, durationMin },
    });
    await logAudit(tx, {
      timeEntryId: entryId,
      action: "UPDATE",
      changedBy: employee.id,
      before: entry,
      after: updated,
    });
  });

  revalidatePath("/dashboard");
  return { error: null };
}
