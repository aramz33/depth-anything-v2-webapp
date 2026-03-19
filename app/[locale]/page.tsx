import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function HeroPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <div className="tsp-hero-bg min-h-screen">
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-28">
        {/* Badge row */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="tsp-label rounded-sm px-2 py-1"
            style={{
              backgroundColor: "rgba(0,163,181,0.15)",
              color: "var(--tsp-teal)",
              border: "1px solid rgba(0,163,181,0.3)",
            }}
          >
            {t("badge1")}
          </Badge>
          <Badge
            variant="secondary"
            className="tsp-label rounded-sm px-2 py-1"
            style={{
              backgroundColor: "rgba(0,163,181,0.15)",
              color: "var(--tsp-teal)",
              border: "1px solid rgba(0,163,181,0.3)",
            }}
          >
            {t("badge2")}
          </Badge>
          <Badge
            variant="secondary"
            className="tsp-label rounded-sm px-2 py-1"
            style={{
              backgroundColor: "rgba(0,163,181,0.15)",
              color: "var(--tsp-teal)",
              border: "1px solid rgba(0,163,181,0.3)",
            }}
          >
            {t("badge3")}
          </Badge>
          <Badge
            variant="secondary"
            className="tsp-label rounded-sm px-2 py-1"
            style={{
              backgroundColor: "rgba(13,63,121,0.8)",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {t("badge4")}
          </Badge>
        </div>

        {/* Headline */}
        <h1
          className="mb-6 text-5xl font-extrabold uppercase leading-tight tracking-tight sm:text-6xl"
          style={{ letterSpacing: "-0.01em" }}
        >
          {t("headline1")}
          <br />
          <span style={{ color: "var(--tsp-teal)" }}>{t("headline2")}</span>
        </h1>

        {/* Sub-headline */}
        <p
          className="mb-10 max-w-2xl text-lg leading-relaxed"
          style={{ color: "rgba(240,247,255,0.75)" }}
        >
          {t("subheadline")}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            size="lg"
            className="rounded-sm font-bold uppercase tracking-widest"
            style={{
              backgroundColor: "var(--tsp-teal)",
              color: "#ffffff",
              letterSpacing: "0.1em",
            }}
          >
            <Link href="/demo">{t("ctaDemo")}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-sm font-bold uppercase tracking-widest"
            style={{
              borderColor: "rgba(255,255,255,0.3)",
              color: "#ffffff",
              backgroundColor: "transparent",
              letterSpacing: "0.1em",
            }}
          >
            <Link href="/project">{t("ctaDocs")}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="rounded-sm font-bold uppercase tracking-widest"
            style={{ color: "rgba(240,247,255,0.6)", letterSpacing: "0.1em" }}
          >
            <a
              href="https://github.com/pl-plt/Monocular-Depth-Vision-PFE"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("ctaGithub")}
            </a>
          </Button>
        </div>

        {/* Divider */}
        <div className="mt-20 mb-8 flex items-center gap-4">
          <div
            className="h-px flex-1"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          />
          <span className="tsp-label">{t("divider")}</span>
          <div
            className="h-px flex-1"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          />
        </div>

        {/* Feature strip */}
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-3">
          {[
            {
              label: "01",
              titleKey: "feature1Title" as const,
              descKey: "feature1Desc" as const,
            },
            {
              label: "02",
              titleKey: "feature2Title" as const,
              descKey: "feature2Desc" as const,
            },
            {
              label: "03",
              titleKey: "feature3Title" as const,
              descKey: "feature3Desc" as const,
            },
          ].map((f, i) => (
            <div
              key={f.label}
              className="border-t p-8"
              style={{
                borderColor: "rgba(255,255,255,0.1)",
                borderLeft:
                  i > 0 ? "1px solid rgba(255,255,255,0.1)" : undefined,
              }}
            >
              <div
                className="mb-4 text-xs font-black uppercase tracking-widest"
                style={{
                  color: "var(--tsp-teal)",
                  letterSpacing: "0.2em",
                }}
              >
                {f.label}
              </div>
              <h3
                className="mb-3 text-sm font-extrabold uppercase tracking-wider"
                style={{ letterSpacing: "0.1em" }}
              >
                {t(f.titleKey)}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(240,247,255,0.6)" }}
              >
                {t(f.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
