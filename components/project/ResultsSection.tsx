"use client";
import { useTranslations } from "next-intl";
import { METRICS, METRICS_NOTE } from "@/lib/metrics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const fmt = (v: number | null) => (v != null ? v.toFixed(3) : "—");

export function ResultsSection() {
  const t = useTranslations("results");

  const chartData = METRICS.filter(
    (m) => m.delta1 != null || m.delta2 != null || m.delta3 != null,
  ).map((m) => ({
    name: `${m.dataset} · ${m.model}`,
    "δ1 (↑)": m.delta1 ?? 0,
    "δ2 (↑)": m.delta2 ?? 0,
    "δ3 (↑)": m.delta3 ?? 0,
  }));

  const tableHeaders = [
    t("colDataset"),
    t("colModel"),
    "AbsRel ↓",
    "RMSE ↓",
    "log10 ↓",
    "δ1 ↑",
    "δ2 ↑",
    "δ3 ↑",
  ];

  return (
    <section id="results" className="scroll-mt-20 space-y-6">
      <h2 className="text-2xl font-bold">{t("heading")}</h2>
      <p className="text-muted-foreground">{t("intro")}</p>

      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/4-evaluation-framework.drawio.svg"
          alt="Evaluation framework"
          className="w-full rounded-lg border border-border"
        />
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          {t("fig4Caption")}
        </figcaption>
      </figure>

      <p className="text-xs text-muted-foreground">{METRICS_NOTE}</p>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {tableHeaders.map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRICS.map((m) => (
              <tr
                key={`${m.dataset}-${m.model}`}
                className="border-t border-border"
              >
                <td className="px-4 py-3 text-muted-foreground">{m.dataset}</td>
                <td className="px-4 py-3 font-medium">{m.model}</td>
                <td className="px-4 py-3">{fmt(m.absRel)}</td>
                <td className="px-4 py-3">{fmt(m.rmse)}</td>
                <td className="px-4 py-3">{fmt(m.log10)}</td>
                <td className="px-4 py-3">{fmt(m.delta1)}</td>
                <td className="px-4 py-3">{fmt(m.delta2)}</td>
                <td className="px-4 py-3">{fmt(m.delta3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-border p-4">
        <p className="mb-4 text-sm font-medium">{t("chartTitle")}</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="δ1 (↑)" fill="hsl(var(--primary))" />
            <Bar dataKey="δ2 (↑)" fill="hsl(var(--primary) / 0.6)" />
            <Bar dataKey="δ3 (↑)" fill="hsl(var(--primary) / 0.3)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
