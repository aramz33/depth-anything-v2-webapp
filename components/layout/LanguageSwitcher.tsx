"use client"
import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter } from "@/lib/navigation"
import { useTransition } from "react"

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const t = useTranslations("nav")

  const targetLocale = locale === "fr" ? "en" : "fr"

  function handleSwitch() {
    startTransition(() => {
      router.replace(pathname, { locale: targetLocale })
    })
  }

  return (
    <button
      onClick={handleSwitch}
      disabled={isPending}
      className="rounded-sm px-2 py-1 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-40"
      style={{
        color: "var(--tsp-teal)",
        letterSpacing: "0.12em",
        border: "1px solid rgba(0,163,181,0.4)",
      }}
      aria-label={`Switch to ${targetLocale === "fr" ? "Français" : "English"}`}
    >
      {t("langSwitch")}
    </button>
  )
}
