"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ProjectData{
id: string;
  name: string;
minutes: number;
}

interface ProjectTimeChartProps{
  data: ProjectData[];
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: any;
  label?: string;
}

function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h} h ${m} min`;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-foreground/60">{formatMinutes(payload[0].value)}</p>
    </div>
  );
}

export default function ProjectTimeChart({ data }: ProjectTimeChartProps) {
  if (data.length === 0) return null;

  return (
    <div className="viz-root mt-2 h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
            axisLine={{ stroke: "var(--chart-axis)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${Math.round(v / 60)}h`}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(137,135,129,0.15)" }} />
          <Bar dataKey="minutes" fill="var(--chart-series-1)" radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
