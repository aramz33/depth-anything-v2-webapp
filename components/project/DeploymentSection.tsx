import { useTranslations } from "next-intl"

export function DeploymentSection() {
  const t = useTranslations("deployment")

  const steps = [
    { step: t("step1Label"), detail: t("step1Detail") },
    { step: t("step2Label"), detail: t("step2Detail") },
    { step: t("step3Label"), detail: t("step3Detail") },
  ]

  return (
    <section id="deployment" className="scroll-mt-20 space-y-5">
      <h2 className="text-2xl font-bold">{t("heading")}</h2>
      <p className="text-muted-foreground">{t("intro")}</p>

      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/5-system-deployment.drawio.svg"
          alt="End-to-end system deployment architecture"
          className="w-full rounded-lg border border-border"
        />
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          {t("fig5Caption")}
        </figcaption>
      </figure>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{t("protocolHeading")}</h3>
        <p className="text-sm text-muted-foreground">{t("protocolIntro")}</p>
        <ol className="space-y-2">
          {steps.map(({ step, detail }) => (
            <li key={step} className="rounded-lg border border-border p-4">
              <p className="mb-1 text-sm font-medium">{step}</p>
              <p className="text-sm text-muted-foreground">{detail}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-4">
        <p className="mb-1 text-sm font-medium">{t("infraNoteHeading")}</p>
        <p className="text-sm text-muted-foreground">{t("infraNoteBody")}</p>
      </div>
    </section>
  )
}
