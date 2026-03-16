import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DocsSidebar } from "@/components/project/DocsSidebar"
import { AbstractSection } from "@/components/project/AbstractSection"
import { ProblemSection } from "@/components/project/ProblemSection"
import { RelatedWorkSection } from "@/components/project/RelatedWorkSection"
import { MethodologySection } from "@/components/project/ArchitectureSection"
import { TrainingPipelineSection } from "@/components/project/TrainingPipelineSection"
import { DatasetSection } from "@/components/project/DatasetSection"
import { DeploymentSection } from "@/components/project/DeploymentSection"
import { ResultsSection } from "@/components/project/ResultsSection"
import { LimitationsSection } from "@/components/project/LimitationsSection"
import { ConclusionSection } from "@/components/project/ConclusionSection"

const AUTHORS = [
  "Adam Ramsis",
  "Pierlouis Pillet",
  "Rodrick Zegang",
]

export default function ProjectPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-12 space-y-5">
        <Badge variant="outline">PFE 2024–2025 · Télécom SudParis</Badge>

        <h1 className="text-3xl font-bold leading-tight">
          Partial Reproduction of Depth Anything V2: Monocular Depth Estimation
          via Knowledge Distillation
        </h1>

        <div className="flex flex-wrap gap-x-8 gap-y-1 text-sm">
          {AUTHORS.map((a) => (
            <span key={a} className="font-medium">
              {a}
            </span>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          Télécom SudParis — Institut Mines-Télécom &nbsp;·&nbsp; 2024–2025
        </p>

        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Keywords:</span>{" "}
          monocular depth estimation &middot; knowledge distillation &middot;
          Vision Transformer &middot; DPT &middot; synthetic-to-real transfer
          &middot; pseudo-labels
        </p>

        <Separator />
      </header>

      <div className="flex flex-col gap-12 lg:flex-row">
        <div className="hidden lg:block">
          <DocsSidebar />
        </div>

        <div className="min-w-0 flex-1 space-y-16">
          <AbstractSection />
          <ProblemSection />
          <RelatedWorkSection />
          <MethodologySection />
          <TrainingPipelineSection />
          <DatasetSection />
          <DeploymentSection />
          <ResultsSection />
          <LimitationsSection />
          <ConclusionSection />

          <section id="references" className="scroll-mt-20">
            <h2 className="mb-4 text-2xl font-bold">References</h2>
            <ol className="list-inside list-decimal space-y-3 text-sm text-muted-foreground">
              <li>
                Yang et al. (2024).{" "}
                <em>Depth Anything V2.</em>{" "}
                NeurIPS 2024. arXiv:2406.09414.
              </li>
              <li>
                Yang et al. (2024).{" "}
                <em>
                  Depth Anything: Unleashing the Power of Large-Scale Unlabeled
                  Data.
                </em>{" "}
                CVPR 2024.
              </li>
              <li>
                Oquab et al. (2024).{" "}
                <em>
                  DINOv2: Learning Robust Visual Features without Supervision.
                </em>{" "}
                TMLR 2024. arXiv:2304.07193.
              </li>
              <li>
                Ranftl et al. (2021).{" "}
                <em>Vision Transformers for Dense Prediction.</em> ICCV 2021.
              </li>
              <li>
                Ranftl et al. (2022).{" "}
                <em>
                  Towards Robust Monocular Depth Estimation: Mixing Datasets
                  for Zero-Shot Cross-Dataset Transfer.
                </em>{" "}
                TPAMI 2022.
              </li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  )
}
