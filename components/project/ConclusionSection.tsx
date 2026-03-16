export function ConclusionSection() {
  return (
    <section id="conclusion" className="scroll-mt-20 space-y-4">
      <h2 className="text-2xl font-bold">9. Conclusion</h2>
      <div className="space-y-4 text-muted-foreground">
        <p>
          This work presents a partial reproduction of the Depth Anything V2 pipeline,
          demonstrating that high-quality monocular depth estimation can be achieved by a
          compact student model (ViT-Small, 25M parameters) trained exclusively through
          knowledge distillation from a large synthetic-supervised teacher (DINOv2-Giant,
          1.1B parameters). The central design insight — substituting noisy real-world
          annotations with clean teacher pseudo-labels on large-scale unlabeled data —
          proves both scalable and effective at bridging the synthetic-to-real domain gap.
        </p>
        <p>
          The three-phase training curriculum provides a principled framework that
          decouples teacher quality from student efficiency. The teacher can be made
          arbitrarily powerful without constraining the student&apos;s deployment
          footprint. The live deployment on HuggingFace Spaces confirms the practical
          end-to-end viability of the approach: the student model produces visually
          coherent depth maps on arbitrary real-world images through a fully automated
          web pipeline.
        </p>
        <p>
          Beyond the specific task of monocular depth estimation, this work validates the
          teacher-student distillation paradigm as a principled and cost-effective
          alternative to large-scale supervised annotation — with direct implications for
          any dense prediction task operating in the real world under annotation scarcity.
        </p>
      </div>
    </section>
  )
}
