import { useTranslations } from "next-intl"

export function LimitationsSection() {
  const t = useTranslations("limitations")

  const limitations = [
    { title: t("lim1Title"), desc: t("lim1Desc") },
    { title: t("lim2Title"), desc: t("lim2Desc") },
    { title: t("lim3Title"), desc: t("lim3Desc") },
    { title: t("lim4Title"), desc: t("lim4Desc") },
    { title: t("lim5Title"), desc: t("lim5Desc") },
  ]

  const difficulties = [
    { title: t("diff1Title"), desc: t("diff1Desc") },
    { title: t("diff2Title"), desc: t("diff2Desc") },
    { title: t("diff3Title"), desc: t("diff3Desc") },
    { title: t("diff4Title"), desc: t("diff4Desc") },
  ]

  const mlops = [
    t("mlops1"),
    t("mlops2"),
    t("mlops3"),
    t("mlops4"),
    t("mlops5"),
  ]

  const futureWork = [
    { title: t("future1Title"), desc: t("future1Desc") },
    { title: t("future2Title"), desc: t("future2Desc") },
    { title: t("future3Title"), desc: t("future3Desc") },
  ]

  return (
    <section id="limitations" className="scroll-mt-20 space-y-8">
      <div>
        <h2 className="text-2xl font-bold">{t("heading")}</h2>
        <p className="mt-2 text-muted-foreground">{t("intro")}</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{t("technicalHeading")}</h3>
        <ul className="space-y-3">
          {limitations.map((l) => (
            <li key={l.title} className="rounded-lg border border-border p-4">
              <p className="font-medium">{l.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{l.desc}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{t("difficultiesHeading")}</h3>
        <p className="text-sm text-muted-foreground">{t("difficultiesIntro")}</p>
        <ul className="space-y-3">
          {difficulties.map((d) => (
            <li key={d.title} className="rounded-lg border border-border bg-muted/10 p-4">
              <p className="font-medium">{d.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{d.desc}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{t("mlopsHeading")}</h3>
        <p className="text-sm text-muted-foreground">{t("mlopsIntro")}</p>
        <ul className="space-y-2">
          {mlops.map((m, i) => (
            <li key={i} className="flex gap-3 rounded-lg border border-border p-3 text-sm">
              <span className="mt-0.5 shrink-0 font-mono text-xs text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-muted-foreground">{m}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{t("futureHeading")}</h3>
        <ul className="space-y-3">
          {futureWork.map((f) => (
            <li key={f.title} className="rounded-lg border border-border bg-muted/10 p-4">
              <p className="font-medium">{f.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
