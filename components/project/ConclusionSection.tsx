export function ConclusionSection() {
  return (
    <section id="conclusion" className="scroll-mt-20 space-y-4">
      <h2 className="text-2xl font-bold">8. Conclusion</h2>
      <div className="space-y-4 text-muted-foreground">
        <p>
          We have presented a partial reproduction of the Depth Anything V2 pipeline,
          demonstrating that high-quality monocular depth estimation can be achieved by a
          compact student model (ViT-Small, 25M parameters) trained exclusively through
          knowledge distillation from a large synthetic-supervised teacher (DINOv2-Giant,
          1.1B parameters). The key insight — replacing noisy real-world annotations with
          clean teacher pseudo-labels — proves both scalable and effective at bridging the
          synthetic-to-real domain gap.
        </p>
        <p>
          Our live deployment on HuggingFace Spaces confirms the practical viability of
          the approach: the student model runs inference on arbitrary real-world images
          and produces visually coherent relative depth maps, including colorized
          representations suitable for qualitative assessment.
        </p>
        <p>
          The results validate the teacher-student distillation paradigm as a principled
          alternative to supervised learning at scale, with direct implications for
          deployment in resource-constrained environments where large model inference is
          infeasible.
        </p>
      </div>
    </section>
  )
}
