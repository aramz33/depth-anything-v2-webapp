"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const SECTION_IDS = [
  { id: "abstract", key: "abstract" },
  { id: "problem", key: "problem" },
  { id: "related-work", key: "relatedWork" },
  { id: "methodology", key: "methodology" },
  { id: "teacher", key: "teacher", indent: true },
  { id: "distillation", key: "distillation", indent: true },
  { id: "student", key: "student", indent: true },
  { id: "losses", key: "losses", indent: true },
  { id: "training", key: "training" },
  { id: "datasets", key: "datasets" },
  { id: "deployment", key: "deployment" },
  { id: "results", key: "results" },
  { id: "limitations", key: "limitations" },
  { id: "conclusion", key: "conclusion" },
  { id: "references", key: "references" },
] as const;

export function DocsSidebar() {
  const t = useTranslations("project.sections");
  const tProject = useTranslations("project");
  const [active, setActive] = useState("abstract");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "0px 0px -60% 0px" },
    );
    SECTION_IDS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="sticky top-20 w-52 shrink-0">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {tProject("onThisPage")}
      </p>
      <ul className="space-y-1">
        {SECTION_IDS.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={cn(
                "block rounded px-2 py-1 text-sm transition-colors",
                "indent" in s && s.indent && "pl-4",
                active === s.id
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(s.key)}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
