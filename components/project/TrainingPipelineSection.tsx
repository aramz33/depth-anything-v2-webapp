import { useTranslations } from "next-intl"

export function TrainingPipelineSection() {
  const t = useTranslations("training")

  const phases = [
    {
      number: t("phase1Number"),
      title: t("phase1Title"),
      description: t("phase1Desc"),
      inputs: [t("phase1Inputs")],
      output: t("phase1Output"),
    },
    {
      number: t("phase2Number"),
      title: t("phase2Title"),
      description: t("phase2Desc"),
      inputs: [t("phase2Inputs")],
      output: t("phase2Output"),
    },
    {
      number: t("phase3Number"),
      title: t("phase3Title"),
      description: t("phase3Desc"),
      inputs: [t("phase3Inputs")],
      output: t("phase3Output"),
    },
  ]

  return (
    <section id="training" className="scroll-mt-20 space-y-5">
      <h2 className="text-2xl font-bold">{t("heading")}</h2>
      <p className="text-muted-foreground">{t("intro")}</p>

      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/2-training-pipeline.drawio.svg"
          alt="Three-phase training pipeline"
          className="w-full rounded-lg border border-border"
        />
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          {t("fig2Caption")}
        </figcaption>
      </figure>

      <div className="space-y-4">
        {phases.map((p) => (
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
                <strong className="text-foreground">{t("inputsLabel")}</strong>{" "}
                {p.inputs.join(", ")}
              </span>
              <span>
                <strong className="text-foreground">{t("outputLabel")}</strong> {p.output}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
