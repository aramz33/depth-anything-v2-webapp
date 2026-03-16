export function MethodologySection() {
  return (
    <div className="space-y-10">
      <section id="methodology" className="scroll-mt-20 space-y-5">
        <h2 className="text-2xl font-bold">3. Proposed Approach</h2>
        <p className="text-muted-foreground">
          Our approach follows the teacher-student distillation paradigm. A
          powerful teacher model trained on synthetic data with ground-truth
          annotations generates high-quality pseudo-labels on real unlabeled
          images. A lightweight student model then learns from these
          pseudo-labels, inheriting the teacher&apos;s depth understanding while
          operating at a fraction of the computational cost.
        </p>

        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/1-teacher-student-architecture.drawio.svg"
            alt="Teacher-student distillation architecture"
            className="w-full rounded-lg border border-border"
          />
          <figcaption className="mt-2 text-center text-xs text-muted-foreground">
            Figure 1: Teacher-student distillation architecture. The teacher
            (DINOv2-Giant + DPT, frozen) generates pseudo-labels; the student
            (ViT-Small + DPT) learns to match them via distillation losses.
          </figcaption>
        </figure>
      </section>

      <section id="teacher" className="scroll-mt-20 space-y-3">
        <h3 className="text-xl font-semibold">3.1 Teacher Model</h3>
        <p className="text-muted-foreground">
          The teacher pairs a frozen{" "}
          <strong className="text-foreground">DINOv2-Giant</strong> backbone
          (ViT-Giant, 1.1B parameters) with a DPT (Dense Prediction Transformer)
          decoder. DINOv2 extracts multi-scale feature maps at four intermediate
          transformer layers (6, 12, 18, 24). The DPT decoder reassembles these
          features into progressively higher-resolution representations via
          learned fusion blocks, and a final convolutional head maps them to a
          full-resolution relative depth map.
        </p>
        <p className="text-muted-foreground">
          Only the DPT decoder is trained during Phase 1; the DINOv2 backbone
          remains frozen throughout all training stages, preserving the rich
          visual representations learned during self-supervised pre-training.
        </p>
      </section>

      <section id="distillation" className="scroll-mt-20 space-y-3">
        <h3 className="text-xl font-semibold">3.2 Pseudo-label Generation</h3>
        <p className="text-muted-foreground">
          After teacher training converges on synthetic data, the teacher is
          frozen and applied to the SA-1B dataset (~11M diverse real-world
          images). For each image, the teacher infers a depth map that serves as
          a pseudo ground-truth label. These pseudo-labels carry the
          teacher&apos;s depth understanding into the real-image distribution
          without requiring any manual annotation — effectively converting an
          unlabeled corpus into a large-scale supervised training set for the
          student.
        </p>
      </section>

      <section id="student" className="scroll-mt-20 space-y-3">
        <h3 className="text-xl font-semibold">3.3 Student Model</h3>
        <p className="text-muted-foreground">
          The student uses a{" "}
          <strong className="text-foreground">ViT-Small</strong> backbone (25M
          parameters, trainable) with the same DPT decoder architecture as the
          teacher. Feature maps are extracted at layers 3, 6, 9, and 12.
          Training on teacher pseudo-labels allows the student to learn
          real-world depth generalisation at 44× fewer parameters — suitable for
          deployment on resource-constrained hardware.
        </p>
      </section>

      <section id="losses" className="scroll-mt-20 space-y-4">
        <h3 className="text-xl font-semibold">3.4 Loss Functions</h3>
        <p className="text-muted-foreground">
          Both teacher and student are trained with a composite loss designed to
          be invariant to the inherent scale and shift ambiguity of relative
          depth estimation:
        </p>

        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="mb-1 font-medium">
              Scale-and-Shift Invariant Loss &mdash; &#x2112;
              <sub>ssi</sub>
            </p>
            <p className="mb-2 text-sm text-muted-foreground">
              Normalizes predictions by their median and mean absolute deviation
              before computing the error, making training invariant to global
              scale and shift transformations inherent to relative depth.
            </p>
            <code className="block rounded bg-muted px-3 py-2 text-xs">
              d&#x303; = (d &minus; t(d)) / s(d) &nbsp;&nbsp; &#x2112;
              <sub>ssi</sub> = (1/T) &Sigma; &#x03C1;(d&#x303;<sub>i</sub>{" "}
              &minus; d&#x303;*<sub>i</sub>)
            </code>
            <p className="mt-1 text-xs text-muted-foreground">
              where t(d) = median(d), s(d) = mean absolute deviation, &#x03C1; =
              pseudo-Huber
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="mb-1 font-medium">
              Gradient Matching Loss &mdash; &#x2112;<sub>gm</sub>
            </p>
            <p className="mb-2 text-sm text-muted-foreground">
              Penalizes differences in depth gradients between prediction and
              target, enforcing sharp boundaries and structural consistency at
              depth discontinuities.
            </p>
            <code className="block rounded bg-muted px-3 py-2 text-xs">
              &#x2112;<sub>gm</sub> = (1/T) &Sigma; (|&part;<sub>x</sub>R
              <sub>i</sub>| + |&part;<sub>y</sub>R<sub>i</sub>|) &nbsp;&nbsp;
              where R = d&#x303; &minus; d&#x303;*
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
  );
}
