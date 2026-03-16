export function ProblemSection() {
  return (
    <section id="problem" className="scroll-mt-20 space-y-5">
      <h2 className="text-2xl font-bold">1. Research Problem &amp; Motivation</h2>

      <div className="space-y-4 text-muted-foreground">
        <p>
          <strong className="text-foreground">Monocular depth estimation</strong> — the task of
          recovering per-pixel depth from a single uncalibrated RGB image — is a fundamental
          problem in computer vision. Unlike stereo cameras or LiDAR sensors, a single camera
          provides no direct geometric cue for metric depth, making the problem inherently
          ill-posed. Learning-based approaches must infer depth from texture gradients, relative
          scale, perspective, and priors learned over large training corpora.
        </p>

        <p>
          Reliable depth perception underpins a wide range of downstream applications:
          autonomous driving, robotic manipulation, augmented and mixed reality, 3D scene
          reconstruction, and medical imaging. A model capable of producing high-quality depth
          maps from arbitrary RGB input — without specialized hardware — would significantly
          lower the barrier to deployment in resource-constrained or mobile environments.
        </p>

        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <p className="mb-1 font-medium text-foreground">
            Core challenge: the synthetic-to-real domain gap
          </p>
          <p className="text-sm">
            Acquiring ground-truth depth annotations for real-world images is expensive,
            sparse, and limited in scale (LiDAR scans, structured light). Synthetic datasets
            provide abundant and accurate depth labels, but models trained exclusively on
            synthetic scenes suffer severe degradation on real-world data due to appearance
            and geometry distribution mismatch. Bridging this gap without large-scale real
            annotations is the central technical challenge this work addresses.
          </p>
        </div>

        <p>
          Our approach follows the <em>Depth Anything V2</em> methodology: a large, expressive
          teacher model first learns reliable depth representations from high-quality synthetic
          data, then transfers its knowledge to a compact and deployable student model via
          pseudo-label supervision on real unlabeled images — effectively decoupling the need
          for real-world ground-truth annotations.
        </p>
      </div>
    </section>
  )
}
