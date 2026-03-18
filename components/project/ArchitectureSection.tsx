import { useTranslations } from "next-intl"

export function MethodologySection() {
  const t = useTranslations("architecture")

  return (
    <div className="space-y-10">
      <section id="methodology" className="scroll-mt-20 space-y-5">
        <h2 className="text-2xl font-bold">{t("heading")}</h2>
        <p className="text-muted-foreground">{t("intro")}</p>

        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/1-teacher-student-architecture.drawio.svg"
            alt="Teacher-student distillation architecture"
            className="w-full rounded-lg border border-border"
          />
          <figcaption className="mt-2 text-center text-xs text-muted-foreground">
            {t("fig1Caption")}
          </figcaption>
        </figure>
      </section>

      <section id="teacher" className="scroll-mt-20 space-y-3">
        <h3 className="text-xl font-semibold">{t("teacherHeading")}</h3>
        <p className="text-muted-foreground">{t("teacherP1")}</p>
        <p className="text-muted-foreground">{t("teacherP2")}</p>
      </section>

      <section id="distillation" className="scroll-mt-20 space-y-3">
        <h3 className="text-xl font-semibold">{t("pseudoHeading")}</h3>
        <p className="text-muted-foreground">{t("pseudoBody")}</p>
      </section>

      <section id="student" className="scroll-mt-20 space-y-3">
        <h3 className="text-xl font-semibold">{t("studentHeading")}</h3>
        <p className="text-muted-foreground">{t("studentBody")}</p>
      </section>

      <section id="losses" className="scroll-mt-20 space-y-4">
        <h3 className="text-xl font-semibold">{t("lossesHeading")}</h3>
        <p className="text-muted-foreground">{t("lossesIntro")}</p>

        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="mb-1 font-medium">
              {t("ssiTitle")} &mdash; &#x2112;<sub>ssi</sub>
            </p>
            <p className="mb-2 text-sm text-muted-foreground">{t("ssiDesc")}</p>
            <code className="block rounded bg-muted px-3 py-2 text-xs">
              d&#x303; = (d &minus; t(d)) / s(d) &nbsp;&nbsp; &#x2112;
              <sub>ssi</sub> = (1/T) &Sigma; &#x03C1;(d&#x303;<sub>i</sub>{" "}
              &minus; d&#x303;*<sub>i</sub>)
            </code>
            <p className="mt-1 text-xs text-muted-foreground">{t("ssiNote")}</p>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="mb-1 font-medium">
              {t("gmTitle")} &mdash; &#x2112;<sub>gm</sub>
            </p>
            <p className="mb-2 text-sm text-muted-foreground">{t("gmDesc")}</p>
            <code className="block rounded bg-muted px-3 py-2 text-xs">
              &#x2112;<sub>gm</sub> = (1/T) &Sigma;
              (|&part;<sub>x</sub>R<sub>i</sub>| + |&part;<sub>y</sub>R
              <sub>i</sub>|) &nbsp;&nbsp; R = d&#x303; &minus; d&#x303;*
            </code>
          </div>

          <div className="rounded-lg border border-border bg-primary/5 p-4">
            <p className="mb-1 font-medium">{t("combinedTitle")}</p>
            <code className="block rounded bg-muted px-3 py-2 text-xs">
              &#x2112; = &#x03B1; &middot; &#x2112;<sub>ssi</sub> + &#x03B2;
              &middot; &#x2112;<sub>gm</sub> &nbsp;&nbsp; (&#x03B1; = &#x03B2; =
              0.5)
            </code>
          </div>
        </div>
      </section>
    </div>
  )
}
