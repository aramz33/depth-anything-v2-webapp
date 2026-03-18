"use client"

import Image from "next/image"
import { useState } from "react"
import { PaperModal } from "@/components/project/PaperModal"

export function ProjectHeader() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between">
        <Image
          src="/logo-tsp.png"
          alt="Télécom SudParis — Institut Polytechnique de Paris"
          height={40}
          width={200}
          className="object-contain object-left"
          priority
        />
        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-md bg-[#00a3b5] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Read Paper
          </button>
          <a
            href="/paper.pdf"
            download
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            ↓ Download PDF
          </a>
        </div>
      </div>

      <PaperModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
