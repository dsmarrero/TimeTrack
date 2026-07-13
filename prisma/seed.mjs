import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Iniciando seed...");

  await prisma.timeEntry.deleteMany();
  await prisma.project.deleteMany();
  await prisma.employee.deleteMany();

  const admin = await prisma.employee.create({
    data: { name: "Ana Martínez", email: "ana@empresa.com", role: "ADMIN" },
  });

  const employee1 = await prisma.employee.create({
    data: { name: "Carlos López", email: "carlos@empresa.com", role: "EMPLOYEE" },
  });

  const employee2 = await prisma.employee.create({
    data: { name: "Lucía Fernández", email: "lucia@empresa.com", role: "EMPLOYEE" },
  });

  const employee3 = await prisma.employee.create({
    data: { name: "Javier Ruiz", email: "javier@empresa.com", role: "EMPLOYEE" },
  });

  console.log("Empleados creados");

  const projectA = await prisma.project.create({
    data: { name: "Rediseño Web Corporativa", description: "Actualización completa del sitio web de la empresa" },
  });

  const projectB = await prisma.project.create({
    data: { name: "App Móvil Interna", description: "Aplicación para gestión de tareas del equipo" },
  });

  console.log("Proyectos creados");

  await prisma.timeEntry.create({
    data: {
      employeeId: employee1.id,
      projectId: projectA.id,
      startedAt: new Date("2026-07-10T09:00:00"),
      endedAt: new Date("2026-07-10T11:30:00"),
      durationMin: 150,
      note: "Maquetación de la home",
    },
  });

  await prisma.timeEntry.create({
    data: {
      employeeId: employee1.id,
      projectId: projectB.id,
      startedAt: new Date("2026-07-11T14:00:00"),
      endedAt: new Date("2026-07-11T16:00:00"),
      durationMin: 120,
      note: "Configuración inicial del proyecto",
    },
  });

  await prisma.timeEntry.create({
    data: {
      employeeId: employee2.id,
      projectId: projectA.id,
      startedAt: new Date("2026-07-11T10:00:00"),
      endedAt: new Date("2026-07-11T13:00:00"),
      durationMin: 180,
      note: "Revisión de diseño UX",
    },
  });

  await prisma.timeEntry.create({
    data: {
      employeeId: employee3.id,
      projectId: projectB.id,
      startedAt: new Date("2026-07-12T08:30:00"),
      endedAt: new Date("2026-07-12T12:00:00"),
      durationMin: 210,
      note: "Desarrollo de pantalla de login",
    },
  });

  await prisma.timeEntry.create({
    data: {
      employeeId: employee2.id,
      projectId: projectB.id,
      startedAt: new Date(),
      endedAt: null,
      durationMin: null,
      note: null,
    },
  });

  console.log("Sesiones de tiempo creadas");
  console.log("Seed completado");
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });