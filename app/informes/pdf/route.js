import PDFDocument from "pdfkit";
import { getCurrentEmployee } from "@/lib/session";
import { getInformesData } from "../data";

function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h} h ${m} min`;
}

function streamToBuffer(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

export async function GET(request) {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return new Response("No autorizado", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const { isAdmin, byProject, byEmployee, crossTable, totalMinutes } = await getInformesData(employee, {
    from,
    to,
  });

  const doc = new PDFDocument({ margin: 50 });
  const bufferPromise = streamToBuffer(doc);

  doc.fontSize(18).text("Informe de tiempos", { align: "left" });
  doc.fontSize(16).text(employee.name);
  if (from || to) {
    doc.fontSize(10).fillColor("#555").text(`Rango: ${from || "inicio"} - ${to || "hoy"}`);
  }
  doc.moveDown();

  doc.fillColor("#000").fontSize(12).text(`Total: ${formatMinutes(totalMinutes)}`);
  doc.moveDown();

  doc.fontSize(14).text("Por proyecto");
  doc.fontSize(10);
  if (byProject.size === 0) {
    doc.text("Sin datos");
  }
  for (const row of byProject.values()) {
    doc.text(`${row.name} — ${formatMinutes(row.minutes)}`);
  }
  doc.moveDown();

  if (isAdmin) {
    doc.fontSize(14).text("Por empleado");
    doc.fontSize(10);
    if (byEmployee.size === 0) {
      doc.text("Sin datos");
    }
    for (const row of byEmployee.values()) {
      doc.text(`${row.name} — ${formatMinutes(row.minutes)}`);
    }
    doc.moveDown();
  }

  doc.fontSize(14).text("Proyecto x Empleado");
  doc.fontSize(10);
  if (crossTable.size === 0) {
    doc.text("Sin entradas registradas");
  }
  for (const row of crossTable.values()) {
    const label = isAdmin ? `${row.projectName} — ${row.employeeName}` : row.projectName;
    doc.text(`${label} — ${formatMinutes(row.minutes)}`);
  }

  doc.end();
  const buffer = await bufferPromise;

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="informe.pdf"',
    },
  });
}
