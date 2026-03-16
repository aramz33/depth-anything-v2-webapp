"use client"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const SECTIONS = [
  { id: "abstract", label: "Abstract" },
  { id: "problem", label: "1. Research Problem" },
  { id: "related-work", label: "2. Related Work" },
  { id: "methodology", label: "3. Proposed Approach" },
  { id: "teacher", label: "↳ Teacher Model", indent: true },
  { id: "distillation", label: "↳ Pseudo-labels", indent: true },
  { id: "student", label: "↳ Student Model", indent: true },
  { id: "losses", label: "↳ Loss Functions", indent: true },
  { id: "training", label: "4. Training Pipeline" },
  { id: "datasets", label: "5. Datasets" },
  { id: "results", label: "6. Results" },
  { id: "limitations", label: "7. Limitations & Future Work" },
  { id: "conclusion", label: "8. Conclusion" },
  { id: "references", label: "References" },
]

export function DocsSidebar() {
  const [active, setActive] = useState("abstract")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: "0px 0px -60% 0px" },
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <nav className="sticky top-20 w-52 shrink-0">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </p>
      <ul className="space-y-1">
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={cn(
                "block rounded px-2 py-1 text-sm transition-colors",
                s.indent && "pl-4",
                active === s.id
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
