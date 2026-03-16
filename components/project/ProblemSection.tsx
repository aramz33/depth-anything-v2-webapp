export function ProblemSection() {
  return (
    <section id="problem" className="scroll-mt-20 space-y-5">
      <h2 className="text-2xl font-bold">1. Context &amp; Motivation</h2>

      <div className="space-y-4 text-muted-foreground">
        <p>
          <strong className="text-foreground">Monocular depth estimation</strong> — the
          task of recovering per-pixel depth from a single uncalibrated RGB image — is a
          fundamental problem in computer vision. Unlike stereo cameras or LiDAR sensors,
          a monocular camera provides no direct geometric cue for metric depth, making the
          problem inherently ill-posed. Learning-based approaches must infer depth from
          texture gradients, occlusion, perspective, and statistical priors acquired over
          large training corpora.
        </p>

        <p>
          Reliable depth perception is a prerequisite for a broad class of downstream
          systems: autonomous driving, robotic manipulation, augmented and mixed reality,
          3D scene reconstruction, and medical imaging. A model capable of producing
          high-quality depth maps from any RGB camera — without specialized hardware —
          significantly lowers the deployment barrier in resource-constrained environments.
        </p>

        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <p className="mb-1 font-medium text-foreground">
            The synthetic-to-real domain gap
          </p>
          <p className="text-sm">
            Acquiring ground-truth depth annotations for real-world images is expensive,
            sparse, and limited in scale — requiring LiDAR scanners or structured-light
            sensors. Synthetic datasets provide abundant and accurate depth labels, but
            models trained exclusively on them suffer severe performance degradation on
            real data due to visual and geometric distribution mismatch. Bridging this
            gap without large-scale real annotations is the central technical challenge.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-primary/5 p-4">
          <p className="mb-1 font-medium text-foreground">Objective</p>
          <p className="text-sm text-muted-foreground">
            Reproduce the <em>Depth Anything V2</em> knowledge distillation pipeline:
            train a powerful teacher model on high-quality synthetic data, leverage it to
            generate pseudo-labels on real unlabeled images at scale, and distil that
            knowledge into a lightweight and deployable student model — eliminating the
            dependency on real-world depth annotations entirely.
          </p>
        </div>
      </div>
    </section>
  )
}
