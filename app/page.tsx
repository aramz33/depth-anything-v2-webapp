import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HeroPage() {
  return (
    <div className="tsp-hero-bg min-h-screen">
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-28">
        {/* Badge row */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Badge variant="secondary" className="tsp-label rounded-sm px-2 py-1" style={{ backgroundColor: "rgba(0,163,181,0.15)", color: "var(--tsp-teal)", border: "1px solid rgba(0,163,181,0.3)" }}>
            ViT-Small · 25M params
          </Badge>
          <Badge variant="secondary" className="tsp-label rounded-sm px-2 py-1" style={{ backgroundColor: "rgba(0,163,181,0.15)", color: "var(--tsp-teal)", border: "1px solid rgba(0,163,181,0.3)" }}>
            DINOv2 Backbone
          </Badge>
          <Badge variant="secondary" className="tsp-label rounded-sm px-2 py-1" style={{ backgroundColor: "rgba(0,163,181,0.15)", color: "var(--tsp-teal)", border: "1px solid rgba(0,163,181,0.3)" }}>
            Teacher-Student Distillation
          </Badge>
          <Badge variant="secondary" className="tsp-label rounded-sm px-2 py-1" style={{ backgroundColor: "rgba(13,63,121,0.8)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.2)" }}>
            Télécom SudParis · MAIA
          </Badge>
        </div>

        {/* Headline */}
        <h1
          className="mb-6 text-5xl font-extrabold uppercase leading-tight tracking-tight sm:text-6xl"
          style={{ letterSpacing: "-0.01em" }}
        >
          Monocular Depth
          <br />
          <span style={{ color: "var(--tsp-teal)" }}>Estimation</span>
        </h1>

        {/* Sub-headline */}
        <p className="mb-10 max-w-2xl text-lg leading-relaxed" style={{ color: "rgba(240,247,255,0.75)" }}>
          A reproduction of Depth Anything V2 — training a lightweight ViT-Small
          student model via knowledge distillation from a DINOv2-Giant teacher,
          deployed at scale on Hugging Face Spaces.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            size="lg"
            className="rounded-sm font-bold uppercase tracking-widest"
            style={{ backgroundColor: "var(--tsp-teal)", color: "#ffffff", letterSpacing: "0.1em" }}
          >
            <Link href="/demo">Try the Demo →</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-sm font-bold uppercase tracking-widest"
            style={{ borderColor: "rgba(255,255,255,0.3)", color: "#ffffff", backgroundColor: "transparent", letterSpacing: "0.1em" }}
          >
            <Link href="/project">Read the Docs</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="rounded-sm font-bold uppercase tracking-widest"
            style={{ color: "rgba(240,247,255,0.6)", letterSpacing: "0.1em" }}
          >
            <a
              href="https://github.com/aramsis/Monocular-Depth-Vision-PFE"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub ↗
            </a>
          </Button>
        </div>

        {/* Divider */}
        <div className="mt-20 mb-8 flex items-center gap-4">
          <div className="h-px flex-1" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
          <span className="tsp-label">Key capabilities</span>
          <div className="h-px flex-1" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
        </div>

        {/* Feature strip */}
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-3">
          {[
            {
              label: "01",
              title: "Single-Image Depth",
              desc: "Predicts per-pixel depth maps from uncalibrated RGB images using a ViT backbone and DPT decoder.",
              accent: "var(--tsp-teal)",
            },
            {
              label: "02",
              title: "Distilled at Scale",
              desc: "Student trained on pseudo-labels from a frozen DINOv2-Giant teacher on the SA-1B real-image dataset.",
              accent: "var(--tsp-orange)",
            },
            {
              label: "03",
              title: "Live HF Deployment",
              desc: "Inference runs live on Hugging Face Spaces. API-first design, accessible from anywhere.",
              accent: "var(--tsp-green)",
            },
          ].map((f, i) => (
            <div
              key={f.title}
              className="border-t p-8"
              style={{
                borderColor: "rgba(255,255,255,0.1)",
                borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.1)" : undefined,
              }}
            >
              <div
                className="mb-4 text-xs font-black uppercase tracking-widest"
                style={{ color: f.accent, letterSpacing: "0.2em" }}
              >
                {f.label}
              </div>
              <h3
                className="mb-3 text-sm font-extrabold uppercase tracking-wider"
                style={{ letterSpacing: "0.1em" }}
              >
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(240,247,255,0.6)" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
