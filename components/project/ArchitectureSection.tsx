export function ArchitectureSection() {
  return (
    <div className="space-y-8">
      <section id="overview" className="scroll-mt-20">
        <h2 className="mb-3 text-2xl font-bold">Overview</h2>
        <p className="text-muted-foreground">
          Depth Anything V2 addresses the challenge of monocular depth estimation — predicting
          per-pixel depth from a single uncalibrated RGB image. Our reproduction implements the
          full teacher-student distillation pipeline: a large teacher model trained on labeled
          synthetic data generates pseudo-labels on real unlabeled images, which a lightweight
          student model learns from at scale.
        </p>
      </section>

      <section id="architecture" className="scroll-mt-20">
        <h2 className="mb-3 text-2xl font-bold">Architecture</h2>
        <p className="mb-4 text-muted-foreground">
          The full pipeline runs in three phases: teacher training on synthetic data,
          pseudo-label generation on real images, and student distillation.
        </p>
        <div className="rounded-lg border border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          [Architecture diagram — export from draw.io and save to /public/architecture.svg]
        </div>
      </section>

      <section id="teacher" className="scroll-mt-20">
        <h3 className="mb-2 text-xl font-semibold">Teacher Model</h3>
        <p className="text-muted-foreground">
          The teacher uses a frozen <strong>DINOv2-Giant</strong> Vision Transformer (1.1B params)
          as backbone, extracting multi-scale features at 4 intermediate layers. A DPT (Dense
          Prediction Transformer) decoder with bottom-up fusion reassembles these features into a
          full-resolution depth map. Trained on synthetic datasets (Hypersim, Virtual KITTI 2)
          with ground-truth depth supervision using a Scale-and-Shift Invariant (SSI) loss and
          Gradient Matching loss.
        </p>
      </section>

      <section id="distillation" className="scroll-mt-20">
        <h3 className="mb-2 text-xl font-semibold">Pseudo-label Generation</h3>
        <p className="text-muted-foreground">
          The frozen teacher generates depth pseudo-labels on real unlabeled images from the
          SA-1B dataset. These pseudo-labels bridge the domain gap between synthetic training data
          and real-world images, enabling the student to generalize beyond synthetic distributions.
        </p>
      </section>

      <section id="student" className="scroll-mt-20">
        <h3 className="mb-2 text-xl font-semibold">Student Model (Distillation)</h3>
        <p className="text-muted-foreground">
          The student pairs a <strong>ViT-Small</strong> backbone (25M params) with the same DPT
          decoder architecture. It trains on teacher pseudo-labels, learning to match the
          teacher&apos;s depth predictions on real images at 25× fewer parameters — suitable for
          deployment at scale.
        </p>
      </section>
    </div>
  )
}
