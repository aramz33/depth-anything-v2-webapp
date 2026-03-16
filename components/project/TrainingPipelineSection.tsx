const PHASES = [
  {
    number: "Phase 1",
    title: "Teacher Training on Synthetic Data",
    description:
      "The teacher model (DINOv2-Giant + DPT decoder) is trained on synthetic datasets with dense ground-truth depth maps using the composite ℒ_ssi + ℒ_gm objective. The DINOv2 backbone is kept frozen throughout; only the DPT decoder weights are optimised. After convergence, the teacher produces highly accurate relative depth maps on in-distribution synthetic scenes.",
    inputs: ["Hypersim (77k images)", "Virtual KITTI 2 (21k images)"],
    output: "Trained Teacher Model",
  },
  {
    number: "Phase 2",
    title: "Pseudo-label Generation on Real Images",
    description:
      "The frozen teacher is run in inference mode over the SA-1B dataset (~11M real unlabeled images). For each image the teacher produces a depth map that becomes the pseudo ground-truth label. No gradient is computed; this phase is purely a forward pass over the dataset. The resulting pseudo-label corpus bridges the synthetic-to-real gap by grounding the student training in real-image statistics.",
    inputs: ["SA-1B (~11M unlabeled real images)"],
    output: "Pseudo-label Database",
  },
  {
    number: "Phase 3",
    title: "Student Distillation on Real Images",
    description:
      "The student (ViT-Small + DPT) is trained on real images paired with their teacher pseudo-labels. The same composite loss (ℒ_ssi + ℒ_gm) is computed between the student's prediction and the pseudo-label. Backpropagation updates only the student's weights. The student acquires real-world depth generalisation at 44× fewer parameters than the teacher.",
    inputs: ["Real Images + Teacher Pseudo-labels (from Phase 2)"],
    output: "Trained Student Model (deployed to HuggingFace Spaces)",
  },
]

export function TrainingPipelineSection() {
  return (
    <section id="training" className="scroll-mt-20 space-y-5">
      <h2 className="text-2xl font-bold">4. Training Pipeline</h2>
      <p className="text-muted-foreground">
        Training follows a strict three-phase curriculum. Each phase builds on the
        previous, progressively transferring knowledge from high-quality synthetic
        supervision to real-world generalisation. Phases are strictly sequential —
        Phase 2 cannot begin until Phase 1 converges, and Phase 3 requires the
        complete pseudo-label database from Phase 2.
      </p>

      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/2-training-pipeline.drawio.svg"
          alt="Three-phase training pipeline"
          className="w-full rounded-lg border border-border"
        />
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          Figure 2 — Three-phase training curriculum. Phase 1 establishes teacher
          depth quality on synthetic data; Phase 2 generates pseudo-labels on real
          images; Phase 3 distils teacher knowledge into the compact student.
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
            <p className="mb-3 text-sm text-muted-foreground">{p.description}</p>
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
  )
}
