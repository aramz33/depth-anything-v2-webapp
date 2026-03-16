export function MethodologySection() {
  return (
    <div className="space-y-10">
      <section id="methodology" className="scroll-mt-20 space-y-5">
        <h2 className="text-2xl font-bold">3. Architecture &amp; Proposed Approach</h2>
        <p className="text-muted-foreground">
          Our system follows the teacher-student distillation paradigm. A powerful
          teacher model trained on synthetic ground-truth depth generates high-quality
          pseudo-labels on real unlabeled images. A lightweight student model then learns
          from those pseudo-labels, inheriting the teacher&apos;s depth representations
          while operating at a fraction of the computational cost.
        </p>

        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/1-teacher-student-architecture.drawio.svg"
            alt="Teacher-student distillation architecture"
            className="w-full rounded-lg border border-border"
          />
          <figcaption className="mt-2 text-center text-xs text-muted-foreground">
            Figure 1 — Teacher-student distillation architecture. The teacher
            (DINOv2-Giant + DPT, frozen after Phase 1) generates pseudo-labels; the
            student (ViT-Small + DPT) learns to match them via the composite
            distillation loss.
          </figcaption>
        </figure>
      </section>

      <section id="teacher" className="scroll-mt-20 space-y-3">
        <h3 className="text-xl font-semibold">3.1 Teacher Model</h3>
        <p className="text-muted-foreground">
          The teacher pairs a frozen{" "}
          <strong className="text-foreground">DINOv2-Giant</strong> backbone
          (ViT-Giant, 1.1B parameters) with a DPT (Dense Prediction Transformer)
          decoder. DINOv2 extracts rich multi-scale feature maps at four intermediate
          transformer layers (6, 12, 18, 24). The DPT decoder reassembles these
          features into progressively higher-resolution representations through learned
          fusion blocks, and a final convolutional prediction head maps the fused
          features to a full-resolution relative depth map.
        </p>
        <p className="text-muted-foreground">
          The DINOv2 backbone is frozen throughout all training stages. Only the
          DPT decoder is optimised during Phase 1, preserving the rich visual
          representations acquired during self-supervised pre-training and
          preventing catastrophic forgetting.
        </p>
      </section>

      <section id="distillation" className="scroll-mt-20 space-y-3">
        <h3 className="text-xl font-semibold">3.2 Pseudo-label Generation</h3>
        <p className="text-muted-foreground">
          After teacher training converges on synthetic data, the teacher is frozen
          and applied to unlabeled real-world images from SA-1B (~11M images). For
          each image, the teacher infers a high-quality relative depth map that
          serves as a pseudo ground-truth label. This step is the architectural
          cornerstone: pseudo-labels carry the teacher&apos;s depth understanding into
          the real-image distribution without requiring any manual annotation —
          effectively converting a massive unlabeled corpus into a large-scale
          supervised training signal for the student.
        </p>
      </section>

      <section id="student" className="scroll-mt-20 space-y-3">
        <h3 className="text-xl font-semibold">3.3 Student Model</h3>
        <p className="text-muted-foreground">
          The student uses a{" "}
          <strong className="text-foreground">ViT-Small</strong> backbone (25M
          parameters, fully trainable) paired with an identical DPT decoder
          architecture. Feature maps are extracted at layers 3, 6, 9, and 12.
          Training on teacher pseudo-labels allows the student to acquire real-world
          depth generalisation at 44× fewer parameters, making it suitable for
          deployment on resource-constrained hardware and low-latency inference
          environments.
        </p>
      </section>

      <section id="losses" className="scroll-mt-20 space-y-4">
        <h3 className="text-xl font-semibold">3.4 Loss Functions</h3>
        <p className="text-muted-foreground">
          Both teacher and student are trained with a composite loss specifically
          designed to be invariant to the scale and shift ambiguity inherent to
          relative monocular depth:
        </p>

        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="mb-1 font-medium">
              Scale-and-Shift Invariant Loss &mdash; &#x2112;<sub>ssi</sub>
            </p>
            <p className="mb-2 text-sm text-muted-foreground">
              Normalizes predictions by their median and mean absolute deviation before
              computing the residual error, making training invariant to global scale
              and shift transformations. This is critical for relative depth estimation
              where absolute metric scale is undefined.
            </p>
            <code className="block rounded bg-muted px-3 py-2 text-xs">
              d&#x303; = (d &minus; t(d)) / s(d) &nbsp;&nbsp; &#x2112;
              <sub>ssi</sub> = (1/T) &Sigma; &#x03C1;(d&#x303;<sub>i</sub>{" "}
              &minus; d&#x303;*<sub>i</sub>)
            </code>
            <p className="mt-1 text-xs text-muted-foreground">
              t(d) = median, s(d) = mean absolute deviation, &#x03C1; = pseudo-Huber
              robustness function
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="mb-1 font-medium">
              Gradient Matching Loss &mdash; &#x2112;<sub>gm</sub>
            </p>
            <p className="mb-2 text-sm text-muted-foreground">
              Penalizes discrepancies in depth gradients between prediction and target,
              enforcing sharp boundaries and structural consistency at depth
              discontinuities. Without this term, depth maps tend to be spatially smooth
              but lose fine edge detail.
            </p>
            <code className="block rounded bg-muted px-3 py-2 text-xs">
              &#x2112;<sub>gm</sub> = (1/T) &Sigma;
              (|&part;<sub>x</sub>R<sub>i</sub>| + |&part;<sub>y</sub>R
              <sub>i</sub>|) &nbsp;&nbsp; R = d&#x303; &minus; d&#x303;*
            </code>
          </div>

          <div className="rounded-lg border border-border bg-primary/5 p-4">
            <p className="mb-1 font-medium">Combined Objective</p>
            <code className="block rounded bg-muted px-3 py-2 text-xs">
              &#x2112; = &#x03B1; &middot; &#x2112;<sub>ssi</sub> + &#x03B2;
              &middot; &#x2112;<sub>gm</sub> &nbsp;&nbsp; (&#x03B1; = &#x03B2; =
              0.5)
            </code>
          </div>
        </div>
      </section>
    </div>
  )
}
