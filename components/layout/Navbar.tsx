import Image from "next/image"
import { useTranslations } from "next-intl"
import { Link } from "@/lib/navigation"
import { LanguageSwitcher } from "./LanguageSwitcher"

export function Navbar() {
  const t = useTranslations("nav")

  const links = [
    { href: "/project" as const, label: t("project") },
    { href: "/demo" as const, label: t("demo") },
    { href: "/about" as const, label: t("about") },
  ]

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "var(--tsp-navy-dark)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/tsp-logo-white.png"
            alt="Télécom SudParis"
            width={160}
            height={40}
            className="h-8 w-auto object-contain"
            priority
          />
          <span
            className="hidden border-l pl-3 text-xs font-semibold uppercase tracking-widest sm:block"
            style={{
              borderColor: "rgba(255,255,255,0.2)",
              color: "var(--tsp-teal)",
              letterSpacing: "0.15em",
            }}
          >
            {t("appTitle")}
          </span>
        </Link>

        <nav className="flex items-center gap-5">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="tsp-nav-link text-xs font-semibold uppercase"
              style={{ letterSpacing: "0.12em" }}
            >
              {l.label}
            </Link>
          ))}
          <LanguageSwitcher />
          <a
            href="https://huggingface.co/spaces/aramsis/depth-anything-v2-pfe-tsp"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--tsp-teal)",
              color: "#ffffff",
              letterSpacing: "0.1em",
            }}
          >
            {t("hfSpace")}
          </a>
        </nav>
      </div>
    </header>
  )
}
