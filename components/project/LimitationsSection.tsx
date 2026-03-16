const LIMITATIONS = [
  {
    title: "Compute constraints",
    desc: "Training DINOv2-Giant (1.1B parameters) on an H100 requires significant GPU-hours. Our implementation operated under a limited compute budget, which restricts the number of training epochs and the scale of the pseudo-label corpus used — directly impacting the student's final accuracy relative to the original paper.",
  },
  {
    title: "Synthetic-to-real residual gap",
    desc: "Despite pseudo-label bridging via SA-1B, the teacher was trained exclusively on indoor (Hypersim) and driving (Virtual KITTI 2) synthetic scenes. Domains not well covered by SA-1B — aerial imagery, underwater, medical — may yield degraded depth predictions.",
  },
  {
    title: "Scale ambiguity",
    desc: "Monocular depth estimation is inherently scale-ambiguous. Our model predicts relative depth only. Recovering absolute metric depth requires camera calibration parameters, stereo geometry, or a sparse metric prior (e.g., GPS/LiDAR fusion).",
  },
  {
    title: "Pseudo-label noise propagation",
    desc: "Teacher errors in edge cases (transparent surfaces, mirrors, very dark scenes) produce noisy pseudo-labels that the student will attempt to fit. The scale-invariant loss provides some robustness, but outlier pseudo-labels can still degrade boundary sharpness.",
  },
  {
    title: "Inference latency on free-tier deployment",
    desc: "HuggingFace Spaces free tier runs CPU-only. Inference takes 5–15 s per image — acceptable for demonstration but not production. GPU deployment (A10G or equivalent) would reduce latency to sub-100 ms.",
  },
]

const DIFFICULTIES = [
  {
    title: "Gradio 5 API integration",
    desc: "The HuggingFace Spaces API changed significantly between Gradio 4 and 5. The new three-step upload → queue → SSE stream protocol required reverse-engineering the API from network traces and Gradio source code.",
  },
  {
    title: "Scale-invariant loss numerical stability",
    desc: "The SSI loss involves division by the mean absolute deviation, which can collapse to zero on near-uniform depth maps (e.g., sky regions or white walls). Clamping the denominator was necessary to prevent NaN gradients during teacher training.",
  },
  {
    title: "SA-1B storage and throughput",
    desc: "The full SA-1B dataset exceeds several terabytes. Pseudo-label generation requires running teacher inference on every image — a forward pass–only bottleneck that demands careful I/O pipeline design and checkpointing to be restartable.",
  },
  {
    title: "Evaluation metric alignment",
    desc: "Relative depth predictions must be scale-shift aligned to ground truth before computing AbsRel or RMSE. Implementing this correctly — matching the least-squares closed-form solution from the paper — was a non-trivial source of early metric discrepancies.",
  },
]

const FUTURE_WORK = [
  {
    title: "Absolute metric depth with scale recovery",
    desc: "Integrate a scale-recovery branch using sparse depth priors (GPS, LiDAR, or focal length) to produce metric depth maps from the relative output.",
  },
  {
    title: "Larger pseudo-label corpora",
    desc: "Scale pseudo-label generation beyond SA-1B to additional large-scale datasets (LAION, DataComp) to improve student generalisation to rare domains.",
  },
  {
    title: "Video temporal consistency",
    desc: "Extend the model with temporal smoothing to enforce consistent depth across video frames, addressing per-frame flickering in monocular video depth.",
  },
]

const MLOPS = [
  "Weights & Biases integration for training loss and metric curves",
  "Checkpoint management with automatic resumption on preemption",
  "Docker containerisation for reproducible training environments",
  "HuggingFace Model Hub for versioned weight storage and sharing",
  "Vercel CI/CD: automatic production deployment on git push to main",
]

export function LimitationsSection() {
  return (
    <section id="limitations" className="scroll-mt-20 space-y-8">
      <div>
        <h2 className="text-2xl font-bold">8. Limitations &amp; Honest Analysis</h2>
        <p className="mt-2 text-muted-foreground">
          An honest and transparent assessment of the system&apos;s technical constraints,
          difficulties encountered during development, and directions for future work.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Technical Limitations</h3>
        <ul className="space-y-3">
          {LIMITATIONS.map((l) => (
            <li key={l.title} className="rounded-lg border border-border p-4">
              <p className="font-medium">{l.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{l.desc}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Difficulties Encountered</h3>
        <p className="text-sm text-muted-foreground">
          Engineering challenges that were not anticipated at the outset:
        </p>
        <ul className="space-y-3">
          {DIFFICULTIES.map((d) => (
            <li key={d.title} className="rounded-lg border border-border bg-muted/10 p-4">
              <p className="font-medium">{d.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{d.desc}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">MLOps Perspectives</h3>
        <p className="text-sm text-muted-foreground">
          Tooling and infrastructure practices explored or identified for future iterations:
        </p>
        <ul className="space-y-2">
          {MLOPS.map((m, i) => (
            <li key={i} className="flex gap-3 rounded-lg border border-border p-3 text-sm">
              <span className="mt-0.5 shrink-0 font-mono text-xs text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-muted-foreground">{m}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Future Work</h3>
        <ul className="space-y-3">
          {FUTURE_WORK.map((f) => (
            <li key={f.title} className="rounded-lg border border-border bg-muted/10 p-4">
              <p className="font-medium">{f.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
