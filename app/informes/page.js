import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/session";
import { getInformesData } from "./data";

function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h} h ${m} m`;
}

export default async function InformesPage({ searchParams }) {
  const employee = await getCurrentEmployee();
  if (!employee) {
    redirect("/login");
  }

  const { from, to } = await searchParams;
  const { isAdmin, byProject, byEmployee, crossTable, totalMinutes } = await getInformesData(employee, {
    from,
    to,
  });

  const csvParams = new URLSearchParams();
  if (from) csvParams.set("from", from);
  if (to) csvParams.set("to", to);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Informes</h1>

      <form className="mt-4 flex flex-wrap items-end gap-2 text-sm" method="get">
        <label className="flex flex-col">
          Desde
          <input type="date" name="from" defaultValue={from ?? ""} />
        </label>
        <label className="flex flex-col">
          Hasta
          <input type="date" name="to" defaultValue={to ?? ""} />
        </label>
        <button type="submit">Filtrar</button>
        <a href={`/informes/csv?${csvParams.toString()}`} className="underline">
          Exportar CSV
        </a>
      </form>

      <p className="mt-4 font-semibold">Total: {formatMinutes(totalMinutes)}</p>

      <h2 className="mt-6 text-lg font-semibold">Por proyecto</h2>
      <ul className="text-sm">
        {[...byProject.entries()].map(([id, row]) => (
          <li key={id}>
            {row.name} — {formatMinutes(row.minutes)}
          </li>
        ))}
        {byProject.size === 0 && <li>Sin datos</li>}
      </ul>

      {isAdmin && (
        <>
          <h2 className="mt-6 text-lg font-semibold">Por empleado</h2>
          <ul className="text-sm">
            {[...byEmployee.entries()].map(([id, row]) => (
              <li key={id}>
                {row.name} — {formatMinutes(row.minutes)}
              </li>
            ))}
            {byEmployee.size === 0 && <li>Sin datos</li>}
          </ul>
        </>
      )}

      <h2 className="mt-6 text-lg font-semibold">Proyecto x Empleado</h2>
      <table className="mt-2 w-full text-sm">
        <thead>
          <tr className="text-left">
            <th>Proyecto</th>
            {isAdmin && <th>Empleado</th>}
            <th>Tiempo</th>
          </tr>
        </thead>
        <tbody>
          {[...crossTable.entries()].map(([key, row]) => (
            <tr key={key} className="border-t">
              <td>{row.projectName}</td>
              {isAdmin && <td>{row.employeeName}</td>}
              <td>{formatMinutes(row.minutes)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {crossTable.size === 0 && <p className="mt-2 text-zinc-600">Sin entradas registradas</p>}
    </div>
  );
}
