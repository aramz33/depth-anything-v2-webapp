const PHASES = [
  {
    number: "Phase 1",
    title: "Teacher Training on Synthetic Data",
    description:
      "The teacher model (DINOv2-Giant + DPT) is trained on synthetic datasets with dense ground-truth depth maps. Scale-and-shift invariant loss and gradient matching loss are jointly minimized. The teacher backbone is kept frozen; only the DPT decoder is trained. After convergence, the teacher produces highly accurate relative depth predictions on in-distribution synthetic scenes.",
    inputs: ["Hypersim", "Virtual KITTI 2"],
    output: "Trained Teacher Model",
  },
  {
    number: "Phase 2",
    title: "Pseudo-label Generation on Real Images",
    description:
      "The frozen teacher is applied to unlabeled real-world images from the SA-1B dataset (∼11M images). For each image, the teacher infers a high-quality depth map that serves as a pseudo ground-truth label. This step bridges the domain gap: the pseudo-labels carry the teacher's depth understanding into the real-image distribution without any manual annotation.",
    inputs: ["SA-1B (∼11M unlabeled real images)"],
    output: "Pseudo-label Database",
  },
  {
    number: "Phase 3",
    title: "Student Distillation on Real Images",
    description:
      "The student (ViT-Small + DPT) trains on real images paired with their teacher-generated pseudo-labels. The same composite loss (L_ssi + L_gm) is applied between the student's predictions and the pseudo-labels. The student learns a compressed representation that generalizes across domains at 44× fewer parameters than the teacher.",
    inputs: ["Real Images + Pseudo-labels"],
    output: "Trained Student Model (Deployed)",
  },
];

export function TrainingPipelineSection() {
  return (
    <section id="training" className="scroll-mt-20 space-y-5">
      <h2 className="text-2xl font-bold">4. Training Pipeline</h2>
      <p className="text-muted-foreground">
        Training follows a strict three-phase curriculum. Each phase builds on
        the previous, progressively transferring knowledge from high-quality
        synthetic supervision to real-world generalisation.
      </p>

      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/2-training-pipeline.drawio.svg"
          alt="Three-phase training pipeline"
          className="w-full rounded-lg border border-border"
        />
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          Figure 2: Three-phase training pipeline. Phase 1 establishes teacher
          quality on synthetic data; Phase 2 generates pseudo-labels on real
          images; Phase 3 distils into the compact student.
        </figcaption>
      </figure>

      <div className="space-y-4">
        {PHASES.map((p) => (
          <div key={p.number} className="rounded-lg border border-border p-5">
            <div className="mb-2 flex items-center gap-3">
              <span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {p.number}
              </span>
              <p className="font-semibold">{p.title}</p>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">
              {p.description}
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
              <span>
                <strong className="text-foreground">Inputs:</strong>{" "}
                {p.inputs.join(", ")}
              </span>
              <span>
                <strong className="text-foreground">Output:</strong> {p.output}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
