export function LimitationsSection() {
  const limitations = [
    {
      title: "Training data bias",
      desc: "The teacher is trained exclusively on synthetic datasets (Hypersim, Virtual KITTI 2). Despite pseudo-label bridging, the student may underperform on real-world distributions not covered by SA-1B.",
    },
    {
      title: "Inference latency",
      desc: "Running on HF Spaces free tier (CPU), inference takes 5–15s per image. Production deployment on GPU would reduce this to under 100ms.",
    },
    {
      title: "Scale ambiguity",
      desc: "Monocular depth is inherently scale-ambiguous. Our model predicts relative depth only — absolute metric depth requires calibration or stereo input.",
    },
    {
      title: "Compute constraints",
      desc: "Full training of the teacher (DINOv2-Giant, 1.1B params) requires significant GPU resources. Our student model was trained with limited compute, which may affect final accuracy relative to the paper.",
    },
  ]

  return (
    <section id="limitations" className="scroll-mt-20 space-y-4">
      <h2 className="text-2xl font-bold">Limitations</h2>
      <p className="text-muted-foreground">
        An honest analysis of the current system&apos;s constraints and failure modes.
      </p>
      <ul className="space-y-3">
        {limitations.map((l) => (
          <li key={l.title} className="rounded-lg border border-border p-4">
            <p className="font-medium">{l.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{l.desc}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
