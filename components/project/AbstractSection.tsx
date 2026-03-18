import { useTranslations } from "next-intl"

export function AbstractSection() {
  const t = useTranslations("abstract")

  const contributions = [t("c1"), t("c2"), t("c3"), t("c4")]

  return (
    <section id="abstract" className="scroll-mt-20 space-y-4">
      <div className="rounded-lg border border-border bg-muted/20 p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("label")}
        </p>
        <p className="text-sm leading-relaxed">{t("body")}</p>
      </div>

      <div className="rounded-lg border border-border p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("contributionsLabel")}
        </p>
        <ul className="space-y-2">
          {contributions.map((c, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="mt-0.5 shrink-0 font-mono text-xs font-semibold text-muted-foreground">
                C{i + 1}
              </span>
              <span className="text-muted-foreground">{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
