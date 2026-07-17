import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentEmployee } from "@/lib/session";
import NavBar from "@/components/NavBar";
import ProjectTimeChart from "@/components/ProjectTimeChart";
import { getInformesData } from "./data";

function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h} h ${m} min`;
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

  const inputClass =
    "rounded-md border border-border bg-transparent px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";
  const mobileLabelClass = "text-xs font-semibold uppercase tracking-wide text-foreground/40 md:hidden";

  return (
    <div>
      <NavBar />
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold text-foreground">Informes</h1>

        <form className="mt-4 flex flex-wrap items-end gap-3 text-sm" method="get">
          <label className="flex flex-col gap-1 text-foreground/70">
            Desde
            <input type="date" name="from" defaultValue={from ?? ""} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-foreground/70">
            Hasta
            <input type="date" name="to" defaultValue={to ?? ""} className={inputClass} />
          </label>
          <button
            type="submit"
            className="rounded-md bg-brand px-4 py-2 font-medium text-white transition-colors hover:bg-brand-hover"
          >
            Filtrar
          </button>
          <Link href="/informes" className="px-2 py-2 text-foreground/60 hover:text-brand">
            Borrar filtro
          </Link>
        </form>

        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <a
            href={`/informes/csv?${csvParams.toString()}`}
            className="rounded-md border border-border px-4 py-2 font-medium text-foreground/70 transition-colors hover:border-brand hover:text-brand"
          >
            Exportar CSV
          </a>
          <a
            href={`/informes/pdf?${csvParams.toString()}`}
            className="rounded-md border border-border px-4 py-2 font-medium text-foreground/70 transition-colors hover:border-brand hover:text-brand"
          >
            Exportar PDF
          </a>
        </div>

        <p className="mt-6 flex items-center justify-between rounded-xl border border-border px-6 py-4 text-sm font-semibold text-foreground">
          <span>Total</span>
          <span className="font-mono">{formatMinutes(totalMinutes)}</span>
        </p>

        <div className="mt-6 rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground">Por proyecto</h2>
          <ul className="mt-3 divide-y divide-border text-sm">
            {[...byProject.entries()].map(([id, row]) => (
              <li key={id} className="flex items-center justify-between py-2">
                <span className="text-foreground/80">{row.name}</span>
                <span className="font-mono text-foreground/60">{formatMinutes(row.minutes)}</span>
              </li>
            ))}
            {byProject.size === 0 && <li className="py-2 text-foreground/50">Sin datos</li>}
          </ul>

          <ProjectTimeChart
            data={[...byProject.entries()].map(([id, row]) => ({ id, name: row.name, minutes: row.minutes }))}
          />
        </div>

        {isAdmin && (
          <div className="mt-6 rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground">Por empleado</h2>
            <ul className="mt-3 divide-y divide-border text-sm">
              {[...byEmployee.entries()].map(([id, row]) => (
                <li key={id} className="flex items-center justify-between py-2">
                  <span className="text-foreground/80">{row.name}</span>
                  <span className="font-mono text-foreground/60">{formatMinutes(row.minutes)}</span>
                </li>
              ))}
              {byEmployee.size === 0 && <li className="py-2 text-foreground/50">Sin datos</li>}
            </ul>
          </div>
        )}

        <div className="mt-6 md:overflow-x-auto md:rounded-xl md:border md:border-border">
          <h2 className="text-lg font-semibold text-foreground md:hidden">Proyecto x Empleado</h2>
          <table className="mt-2 w-full text-sm md:mt-0">
            <thead className="hidden md:table-header-group">
              <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-foreground/50">
                <th className="px-4 py-3">Proyecto</th>
                {isAdmin && <th className="px-4 py-3">Empleado</th>}
                <th className="px-4 py-3">Tiempo</th>
              </tr>
            </thead>
            <tbody className="block space-y-3 md:table-row-group md:space-y-0 md:divide-y md:divide-border">
              {[...crossTable.entries()].map(([key, row]) => (
                <tr
                  key={key}
                  className="block rounded-lg border border-border p-4 md:table-row md:rounded-none md:border-0 md:p-0"
                >
                  <td className="flex items-center justify-between py-1 md:table-cell md:px-4 md:py-3">
                    <span className={mobileLabelClass}>Proyecto</span>
                    <span className="text-foreground/80">{row.projectName}</span>
                  </td>
                  {isAdmin && (
                    <td className="flex items-center justify-between py-1 md:table-cell md:px-4 md:py-3">
                      <span className={mobileLabelClass}>Empleado</span>
                      <span className="text-foreground/80">{row.employeeName}</span>
                    </td>
                  )}
                  <td className="flex items-center justify-between py-1 md:table-cell md:px-4 md:py-3">
                    <span className={mobileLabelClass}>Tiempo</span>
                    <span className="font-mono text-foreground/60">{formatMinutes(row.minutes)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {crossTable.size === 0 && (
            <p className="mt-2 px-1 text-sm text-foreground/50 md:px-4 md:py-4">Sin entradas registradas</p>
          )}
        </div>
      </div>
    </div>
  );
}
