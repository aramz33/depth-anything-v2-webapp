import { useTranslations } from "next-intl"

export function DatasetSection() {
  const t = useTranslations("datasets")

  const DATASETS = [
    {
      name: "Hypersim",
      type: t("hypersimType"),
      role: t("hypersimRole"),
      images: "77,400",
      labels: t("hypersimLabels"),
      notes: t("hypersimNotes"),
    },
    {
      name: "Virtual KITTI 2",
      type: t("vkitti2Type"),
      role: t("vkitti2Role"),
      images: "21,260",
      labels: t("vkitti2Labels"),
      notes: t("vkitti2Notes"),
    },
    {
      name: "SA-1B",
      type: t("sa1bType"),
      role: t("sa1bRole"),
      images: "∼11M",
      labels: t("sa1bLabels"),
      notes: t("sa1bNotes"),
    },
    {
      name: "NYU-Depth V2",
      type: t("nyuType"),
      role: t("nyuRole"),
      images: "654 test",
      labels: t("nyuLabels"),
      notes: t("nyuNotes"),
    },
    {
      name: "KITTI",
      type: t("kittiType"),
      role: t("kittiRole"),
      images: "652 test",
      labels: t("kittiLabels"),
      notes: t("kittiNotes"),
    },
  ]

  const headers = [
    t("colDataset"),
    t("colType"),
    t("colRole"),
    t("colImages"),
    t("colLabels"),
    t("colNotes"),
  ]

  return (
    <section id="datasets" className="scroll-mt-20 space-y-5">
      <h2 className="text-2xl font-bold">{t("heading")}</h2>
      <p className="text-muted-foreground">{t("intro")}</p>

      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/3-data-pipeline.drawio.svg"
          alt="Dataset and data pipeline"
          className="w-full rounded-lg border border-border"
        />
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          {t("fig3Caption")}
        </figcaption>
      </figure>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DATASETS.map((d, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{d.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.type}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.role}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.images}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.labels}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{d.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
