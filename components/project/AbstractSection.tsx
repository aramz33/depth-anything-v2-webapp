export function AbstractSection() {
  return (
    <section id="abstract" className="scroll-mt-20">
      <div className="rounded-lg border border-border bg-muted/20 p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Abstract
        </p>
        <p className="text-sm leading-relaxed">
          We present a partial reproduction of <em>Depth Anything V2</em>, a state-of-the-art
          monocular depth estimation framework based on knowledge distillation between Vision
          Transformers. Our implementation trains a lightweight student model (ViT-Small, 25M
          parameters) by distilling knowledge from a large frozen teacher (DINOv2-Giant, 1.1B
          parameters). The teacher is first trained on labeled synthetic datasets (Hypersim,
          Virtual KITTI 2) with ground-truth depth supervision, then generates pseudo-depth
          labels on real unlabeled images from SA-1B. The student learns to match these
          pseudo-labels through a combination of scale-and-shift invariant loss and gradient
          matching loss. The resulting model achieves competitive depth estimation at 44× fewer
          parameters and is deployed as a live interactive demonstration via HuggingFace Spaces.
        </p>
      </div>
    </section>
  )
}