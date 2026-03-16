"use client";
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

export function ResultsSection() {
  const chartData = METRICS.map((m) => ({
    name: m.model,
    "δ1 (↑)": m.delta1,
    "δ2 (↑)": m.delta2,
    "δ3 (↑)": m.delta3,
  }));

  return (
    <section id="results" className="scroll-mt-20 space-y-6">
      <h2 className="text-2xl font-bold">6. Experiments &amp; Results</h2>
      <p className="text-muted-foreground">
        The student model is evaluated on two standard benchmarks: NYU-Depth V2
        (indoor) and KITTI (outdoor driving). Evaluation uses the standard
        relative depth metrics. No benchmark data is seen during training.
      </p>

      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/4-evaluation-framework.drawio.svg"
          alt="Evaluation framework"
          className="w-full rounded-lg border border-border"
        />
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          Figure 4: Evaluation framework. The trained student is applied to
          benchmark test sets and scored on AbsRel, RMSE, and threshold accuracy
          metrics.
        </figcaption>
      </figure>

      <p className="text-xs text-muted-foreground">{METRICS_NOTE}</p>

      {METRICS.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Benchmark results pending training completion.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {[
                    "Dataset",
                    "Model",
                    "AbsRel ↓",
                    "RMSE ↓",
                    "δ1 ↑",
                    "δ2 ↑",
                    "δ3 ↑",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {METRICS.map((m, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-3 text-muted-foreground">
                      {m.dataset}
                    </td>
                    <td className="px-4 py-3 font-medium">{m.model}</td>
                    <td className="px-4 py-3">{m.absRel.toFixed(3)}</td>
                    <td className="px-4 py-3">{m.rmse.toFixed(3)}</td>
                    <td className="px-4 py-3">{m.delta1.toFixed(3)}</td>
                    <td className="px-4 py-3">{m.delta2.toFixed(3)}</td>
                    <td className="px-4 py-3">{m.delta3.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-border p-4">
            <p className="mb-4 text-sm font-medium">
              Threshold accuracy (δ1, δ2, δ3)
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="δ1 (↑)" fill="hsl(var(--primary))" />
                <Bar dataKey="δ2 (↑)" fill="hsl(var(--primary) / 0.6)" />
                <Bar dataKey="δ3 (↑)" fill="hsl(var(--primary) / 0.3)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  );
}
