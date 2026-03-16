import { DocsSidebar } from "@/components/project/DocsSidebar"
import { ArchitectureSection } from "@/components/project/ArchitectureSection"
import { ResultsSection } from "@/components/project/ResultsSection"
import { LimitationsSection } from "@/components/project/LimitationsSection"

export default function ProjectPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">Project Documentation</h1>
        <p className="mt-2 text-muted-foreground">
          Technical deep-dive into the Depth Anything V2 reproduction.
        </p>
      </div>

      <div className="flex flex-col gap-12 lg:flex-row">
        <div className="hidden lg:block">
          <DocsSidebar />
        </div>

        <div className="min-w-0 flex-1 space-y-16">
          <ArchitectureSection />
          <ResultsSection />
          <LimitationsSection />

          <section id="references" className="scroll-mt-20">
            <h2 className="mb-4 text-2xl font-bold">References</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                Yang et al. (2024).{" "}
                <em>Depth Anything V2.</em>{" "}
                arXiv:2406.09414
              </li>
              <li>
                Oquab et al. (2023).{" "}
                <em>DINOv2: Learning Robust Visual Features without Supervision.</em>{" "}
                arXiv:2304.07193
              </li>
              <li>
                Ranftl et al. (2021).{" "}
                <em>Vision Transformers for Dense Prediction (DPT).</em>{" "}
                ICCV 2021
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
