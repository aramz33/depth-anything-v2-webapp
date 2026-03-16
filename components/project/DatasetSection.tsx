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
    notes: "Outdoor driving simulation; weather, time-of-day, and camera angle variations.",
  },
  {
    name: "SA-1B",
    type: "Real (unlabeled)",
    role: "Pseudo-label generation & student training",
    images: "∼11M",
    labels: "Teacher pseudo-labels",
    notes: "Diverse real-world imagery from SAM; broad scene and lighting diversity.",
  },
  {
    name: "NYU-Depth V2",
    type: "Real (labeled)",
    role: "Evaluation only",
    images: "654 test",
    labels: "Structured-light GT",
    notes: "Standard indoor benchmark; metric ground truth from Kinect. Never seen during training.",
  },
  {
    name: "KITTI",
    type: "Real (labeled)",
    role: "Evaluation only",
    images: "652 test",
    labels: "LiDAR GT (sparse)",
    notes: "Standard outdoor driving benchmark; sparse LiDAR ground truth. Never seen during training.",
  },
]

export function DatasetSection() {
  return (
    <section id="datasets" className="scroll-mt-20 space-y-5">
      <h2 className="text-2xl font-bold">5. Datasets &amp; Data Pipeline</h2>
      <p className="text-muted-foreground">
        The pipeline consumes three distinct categories of data. Labeled synthetic data
        provides clean depth supervision for the teacher. Large-scale unlabeled real data
        receives pseudo-labels from the frozen teacher and drives student training.
        Held-out labeled benchmarks are reserved exclusively for final evaluation and
        are never exposed during training.
      </p>

      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/3-data-pipeline.drawio.svg"
          alt="Dataset and data pipeline"
          className="w-full rounded-lg border border-border"
        />
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          Figure 3 — Data pipeline. Synthetic datasets feed teacher training; the frozen
          teacher generates pseudo-labels over SA-1B for student training; evaluation
          benchmarks are strictly held out.
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
