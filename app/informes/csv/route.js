import { getCurrentEmployee } from "@/lib/session";
import { getInformesData } from "../data";

function csvEscape(value) {
  const str = String(value);
  if (/[";\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request) {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return new Response("No autorizado", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const { isAdmin, crossTable } = await getInformesData(employee, { from, to });

  const header = isAdmin ? ["Proyecto", "Empleado", "Minutos"] : ["Proyecto", "Minutos"];
  const rows = [header];

  for (const row of crossTable.values()) {
    rows.push(isAdmin ? [row.projectName, row.employeeName, row.minutes] : [row.projectName, row.minutes]);
  }

  const csv = "﻿" + rows.map((row) => row.map(csvEscape).join(";")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="informe.csv"',
    },
  });
}
