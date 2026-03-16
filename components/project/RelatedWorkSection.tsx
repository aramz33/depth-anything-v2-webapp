const RELATED_WORK = [
  {
    citation: "Ranftl et al., TPAMI 2022",
    name: "MiDaS",
    contribution:
      "Introduced multi-objective training across heterogeneous datasets using scale-invariant losses, enabling zero-shot cross-domain depth transfer. Established the foundation for generalizable monocular depth estimation.",
  },
  {
    citation: "Ranftl et al., ICCV 2021",
    name: "DPT — Dense Prediction Transformer",
    contribution:
      "Replaced convolutional decoders with transformer-based reassembly and fusion heads operating on multi-scale ViT features. Demonstrated that vision transformers capture richer global context than CNNs for dense prediction tasks.",
  },
  {
    citation: "Oquab et al., TMLR 2024",
    name: "DINOv2",
    contribution:
      "Self-supervised ViT pre-training on 142M curated images via knowledge distillation. Features transfer strongly to dense prediction tasks (depth, segmentation) without fine-tuning, making DINOv2-Giant the natural choice for a powerful teacher backbone.",
  },
  {
    citation: "Yang et al., CVPR 2024",
    name: "Depth Anything V1",
    contribution:
      "Scaled unlabeled real-world data for student training via auxiliary supervision. Demonstrated that large-scale pseudo-label distillation improves generalization over purely supervised baselines.",
  },
  {
    citation: "Yang et al., NeurIPS 2024",
    name: "Depth Anything V2",
    contribution:
      "Replaced noisy real-world pseudo-labels with high-quality synthetic labels from a powerful teacher model, eliminating annotation noise and enabling robust synthetic-to-real transfer. Our work partially reproduces this pipeline using ViT-Small as the student.",
  },
]

export function RelatedWorkSection() {
  return (
    <section id="related-work" className="scroll-mt-20 space-y-5">
      <h2 className="text-2xl font-bold">2. Related Work</h2>
      <div className="space-y-3">
        {RELATED_WORK.map((w) => (
          <div key={w.name} className="rounded-lg border border-border p-4">
            <div className="mb-1 flex items-start justify-between gap-4">
              <p className="font-medium">{w.name}</p>
              <span className="shrink-0 text-xs text-muted-foreground">{w.citation}</span>
            </div>
            <p className="text-sm text-muted-foreground">{w.contribution}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
