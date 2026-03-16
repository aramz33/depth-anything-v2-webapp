const DATASETS = [
  {
    name: "Hypersim",
    type: "Synthetic",
    role: "Teacher training",
    images: "77,400",
    labels: "Dense GT depth",
    notes: "Photorealistic indoor scenes; ray-traced depth at full resolution.",
  },
  {
    name: "Virtual KITTI 2",
    type: "Synthetic",
    role: "Teacher training",
    images: "21,260",
    labels: "Dense GT depth",
    notes: "Outdoor driving simulation; weather and lighting variations.",
  },
  {
    name: "SA-1B",
    type: "Real (unlabeled)",
    role: "Pseudo-label generation & student training",
    images: "∼11M",
    labels: "Teacher pseudo-labels",
    notes: "Diverse real-world imagery from SAM dataset; covers broad visual domains.",
  },
  {
    name: "NYU-Depth V2",
    type: "Real (labeled)",
    role: "Evaluation only",
    images: "654 test",
    labels: "Structured-light GT",
    notes: "Standard indoor depth benchmark; metric ground truth from Kinect.",
  },
  {
    name: "KITTI",
    type: "Real (labeled)",
    role: "Evaluation only",
    images: "652 test",
    labels: "LiDAR GT (sparse)",
    notes: "Standard outdoor driving benchmark; sparse LiDAR ground truth.",
  },
]

export function DatasetSection() {
  return (
    <section id="datasets" className="scroll-mt-20 space-y-5">
      <h2 className="text-2xl font-bold">5. Datasets</h2>
      <p className="text-muted-foreground">
        The pipeline consumes three categories of data: labeled synthetic data for teacher
        supervision, large-scale unlabeled real data for pseudo-label generation, and held-out
        real benchmarks for evaluation only (never seen during training).
      </p>

      <figure>
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
          Data pipeline diagram — export{" "}
          <code className="rounded bg-muted px-1 text-xs">
            diagrams/3-data-pipeline.drawio
          </code>{" "}
          to{" "}
          <code className="rounded bg-muted px-1 text-xs">/public/data-pipeline.svg</code>{" "}
          and replace this placeholder.
        </div>
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          Figure 3: Data pipeline. Synthetic datasets feed the teacher; real unlabeled data
          receives pseudo-labels from the frozen teacher; benchmarks are reserved for evaluation.
        </figcaption>
      </figure>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {["Dataset", "Type", "Role", "Images", "Labels", "Notes"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DATASETS.map((d, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{d.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.type}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.role}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.images}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.labels}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{d.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
