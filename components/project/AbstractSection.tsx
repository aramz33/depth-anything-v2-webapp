const CONTRIBUTIONS = [
  "A DINOv2-Giant teacher model (1.1B params) trained from scratch on labeled synthetic data (Hypersim, Virtual KITTI 2) to produce high-fidelity depth pseudo-labels.",
  "A large-scale pseudo-label generation pipeline applied to ~11M real unlabeled images from SA-1B, eliminating the need for real-world depth annotation.",
  "A ViT-Small student model (25M params) trained via knowledge distillation, achieving competitive monocular depth estimation at 44× fewer parameters.",
  "An end-to-end web deployment via HuggingFace Spaces and Next.js demonstrating production viability of the trained model.",
]

export function AbstractSection() {
  return (
    <section id="abstract" className="scroll-mt-20 space-y-4">
      <div className="rounded-lg border border-border bg-muted/20 p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Abstract
        </p>
        <p className="text-sm leading-relaxed">
          We present a partial reproduction of{" "}
          <em>Depth Anything V2</em>, a state-of-the-art monocular depth
          estimation framework based on knowledge distillation between Vision
          Transformers. Our implementation trains a lightweight student model
          (ViT-Small, 25M parameters) by distilling knowledge from a large
          frozen teacher (DINOv2-Giant, 1.1B parameters). The teacher is first
          trained on labeled synthetic datasets (Hypersim, Virtual KITTI 2)
          with ground-truth depth supervision under a scale-and-shift invariant
          loss, then generates pseudo-depth labels on real unlabeled images from
          SA-1B. The student learns to match these pseudo-labels through a
          composite distillation objective combining scale-invariant and
          gradient matching losses. The resulting model produces visually
          coherent relative depth maps on arbitrary real-world imagery and is
          deployed as a live interactive demonstration.
        </p>
      </div>

      <div className="rounded-lg border border-border p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Key Contributions
        </p>
        <ul className="space-y-2">
          {CONTRIBUTIONS.map((c, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="mt-0.5 shrink-0 font-mono text-xs font-semibold text-muted-foreground">
                C{i + 1}
              </span>
              <span className="text-muted-foreground">{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
