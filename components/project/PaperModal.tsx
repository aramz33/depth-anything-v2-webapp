"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"

interface PaperModalProps {
  open: boolean
  onClose: () => void
}

export function PaperModal({ open, onClose }: PaperModalProps) {
  const [loaded, setLoaded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const t = useTranslations("paperModal")

  // Detect iOS/mobile — PDF iframes don't render inline on iOS Safari
  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [])

  // Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  // Reset loaded state when closed
  useEffect(() => {
    if (!open) setLoaded(false)
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#092d57]/95 transition-opacity duration-200">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center gap-4 border-b border-white/10 px-4">
        <Image
          src="/logo-tsp.png"
          alt="Télécom SudParis"
          height={24}
          width={120}
          className="object-contain object-left"
        />
        <p className="flex-1 truncate text-center text-sm text-white/70">
          {t("title")}
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <a
            href="/paper.pdf"
            download
            className="text-sm text-white/70 underline underline-offset-4 hover:text-white"
          >
            {t("downloadPdf")}
          </a>
          <button
            onClick={onClose}
            aria-label="Close paper viewer"
            className="rounded p-1 text-white/70 hover:bg-white/10 hover:text-white"
          >
            {t("close")}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative flex-1">
        {/* Spinner until iframe loads */}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          </div>
        )}

        {isMobile ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <p className="text-sm text-white/70">{t("mobileMessage")}</p>
            <a
              href="/paper.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-[#00a3b5] px-4 py-2 text-sm font-medium text-white"
            >
              {t("openPdf")}
            </a>
          </div>
        ) : (
          // Ensure public/paper.pdf exists before deploying
          <iframe
            src="/paper.pdf"
            title="PFE Paper — Partial Reproduction of Depth Anything V2"
            className="h-full w-full border-0"
            onLoad={() => setLoaded(true)}
          />
        )}
      </div>
    </div>
  )
}
