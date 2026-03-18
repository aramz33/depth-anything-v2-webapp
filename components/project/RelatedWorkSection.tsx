import { useTranslations } from "next-intl"

const RELATED_WORK_KEYS = [
  { citation: "Ranftl et al., TPAMI 2022", name: "MiDaS", key: "midas" },
  { citation: "Ranftl et al., ICCV 2021", name: "DPT — Dense Prediction Transformer", key: "dpt" },
  { citation: "Oquab et al., TMLR 2024", name: "DINOv2", key: "dinov2" },
  { citation: "Yang et al., CVPR 2024", name: "Depth Anything V1", key: "dav1" },
  { citation: "Yang et al., NeurIPS 2024", name: "Depth Anything V2", key: "dav2" },
] as const

export function RelatedWorkSection() {
  const t = useTranslations("relatedWork")

  return (
    <section id="related-work" className="scroll-mt-20 space-y-5">
      <h2 className="text-2xl font-bold">{t("heading")}</h2>
      <div className="space-y-3">
        {RELATED_WORK_KEYS.map((w) => (
          <div key={w.name} className="rounded-lg border border-border p-4">
            <div className="mb-1 flex items-start justify-between gap-4">
              <p className="font-medium">{w.name}</p>
              <span className="shrink-0 text-xs text-muted-foreground">{w.citation}</span>
            </div>
            <p className="text-sm text-muted-foreground">{t(w.key)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
