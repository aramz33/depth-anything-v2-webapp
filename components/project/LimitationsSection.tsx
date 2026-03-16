const LIMITATIONS = [
  {
    title: "Synthetic-to-real residual gap",
    desc: "Despite pseudo-label bridging, the teacher is trained exclusively on synthetic indoor and outdoor driving datasets. The student may underperform on real-world domains not covered by SA-1B, such as medical or aerial imagery.",
  },
  {
    title: "Scale ambiguity",
    desc: "Monocular depth is inherently scale-ambiguous. Our model predicts relative depth only. Recovering absolute metric depth requires camera calibration, multi-view geometry, or stereo input.",
  },
  {
    title: "Compute constraints",
    desc: "Full training of the teacher (DINOv2-Giant, 1.1B params) on an H100 required significant GPU-hours. Our student's final accuracy may fall short of the original paper due to limited training budget and data scale.",
  },
  {
    title: "Inference latency (demo deployment)",
    desc: "The live demo runs on HuggingFace Spaces free tier (CPU-only). Inference takes 5–15s per image. GPU deployment would reduce latency to under 100ms.",
  },
]

const FUTURE_WORK = [
  {
    title: "Metric depth with scale recovery",
    desc: "Integrate a scale-recovery branch using sparse depth priors (e.g., LiDAR points or monocular cues) to produce absolute metric depth maps.",
  },
  {
    title: "Larger unlabeled datasets",
    desc: "Scale pseudo-label generation beyond SA-1B to additional large-scale datasets (LAION, DataComp) to improve student generalization.",
  },
  {
    title: "Distillation from larger students",
    desc: "Evaluate intermediate student sizes (ViT-Base, ViT-Large) to characterize the accuracy-efficiency trade-off across the model family.",
  },
  {
    title: "Video depth consistency",
    desc: "Extend the model to enforce temporal consistency across video frames, addressing flickering artifacts in monocular video depth estimation.",
  },
]

export function LimitationsSection() {
  return (
    <section id="limitations" className="scroll-mt-20 space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">7. Limitations &amp; Future Work</h2>
        <p className="text-muted-foreground">
          An honest assessment of the current system&apos;s constraints, together with
          directions for future investigation.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Limitations</h3>
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
