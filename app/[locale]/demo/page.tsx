import { setRequestLocale, getTranslations } from "next-intl/server"
import { InferencePanel } from "@/components/demo/InferencePanel"

export default async function DemoPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("demo")

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("heading")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("subtitle")}{" "}
          <a
            href="https://huggingface.co/spaces/aramsis/depth-anything-v2-pfe-tsp"
            className="underline underline-offset-4 hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("subtitleLink")}
          </a>
          .
        </p>
      </div>
      <InferencePanel />
    </div>
  )
}
