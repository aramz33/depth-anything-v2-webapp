import { useTranslations } from "next-intl"

export function ConclusionSection() {
  const t = useTranslations("conclusion")

  return (
    <section id="conclusion" className="scroll-mt-20 space-y-4">
      <h2 className="text-2xl font-bold">{t("heading")}</h2>
      <div className="space-y-4 text-muted-foreground">
        <p>{t("p1")}</p>
        <p>{t("p2")}</p>
        <p>{t("p3")}</p>
      </div>
    </section>
  )
}
