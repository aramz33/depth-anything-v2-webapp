import type { Metadata } from "next"
import { Jost } from "next/font/google"
import { notFound } from "next/navigation"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { routing } from "@/i18n/routing"
import "@/app/globals.css"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isFr = locale === "fr"
  return {
    title: "Depth Anything V2 — TSP PFE",
    description: isFr
      ? "Estimation de profondeur monoculaire par distillation de connaissance. Projet de fin d'études à Télécom SudParis, MAIA."
      : "Monocular depth estimation via teacher-student distillation. Final year project at Telecom SudParis, MAIA.",
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as "fr" | "en")) {
    notFound()
  }

  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body className={jost.variable}>
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
