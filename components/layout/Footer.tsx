import Image from "next/image"
import { useTranslations } from "next-intl"

export function Footer() {
  const t = useTranslations("footer")

  return (
    <footer style={{ backgroundColor: "var(--tsp-navy-dark)", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-3">
            <Image
              src="/tsp-logo-white.png"
              alt="Télécom SudParis"
              width={160}
              height={40}
              className="h-8 w-auto object-contain"
            />
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--tsp-teal)", letterSpacing: "0.15em" }}
            >
              {t("tagline")}
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 sm:items-end">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(240,247,255,0.5)", letterSpacing: "0.12em" }}>
              {t("meta")}
            </p>
            <div className="flex items-center gap-4">
              <SocialNode label="GitHub" href="https://github.com/aramsis/Monocular-Depth-Vision-PFE" />
              <NodeConnector />
              <SocialNode label="HF Space" href="https://huggingface.co/spaces/aramsis/depth-anything-v2-pfe-tsp" />
              <NodeConnector />
              <SocialNode label="TSP" href="https://www.telecom-sudparis.eu" />
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <p className="text-center text-xs" style={{ color: "rgba(240,247,255,0.35)", letterSpacing: "0.08em" }}>
            {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  )
}

function SocialNode({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col items-center gap-1"
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold transition-all group-hover:border-[--tsp-teal] group-hover:text-[--tsp-teal]"
        style={{ borderColor: "rgba(255,255,255,0.25)", color: "rgba(240,247,255,0.5)" }}
      >
        {label[0]}
      </span>
      <span
        className="text-[10px] uppercase tracking-wider transition-colors group-hover:text-[--tsp-teal]"
        style={{ color: "rgba(240,247,255,0.4)", letterSpacing: "0.1em" }}
      >
        {label}
      </span>
    </a>
  )
}

function NodeConnector() {
  return (
    <div className="mb-4 h-px w-6" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
  )
}
