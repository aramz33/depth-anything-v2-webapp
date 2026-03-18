import { useTranslations } from "next-intl"

export function ProblemSection() {
  const t = useTranslations("problem")

  return (
    <section id="problem" className="scroll-mt-20 space-y-5">
      <h2 className="text-2xl font-bold">{t("heading")}</h2>

      <div className="space-y-4 text-muted-foreground">
        <p>{t("p1")}</p>
        <p>{t("p2")}</p>

        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <p className="mb-1 font-medium text-foreground">{t("gapHeading")}</p>
          <p className="text-sm">{t("gapBody")}</p>
        </div>

        <div className="rounded-lg border border-border bg-primary/5 p-4">
          <p className="mb-1 font-medium text-foreground">{t("objectiveHeading")}</p>
          <p className="text-sm text-muted-foreground">{t("objectiveBody")}</p>
        </div>
      </div>
    </section>
  )
}
