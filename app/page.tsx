import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HeroPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24">
      {/* Badge row */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Badge variant="secondary">ViT-Small · 25M params</Badge>
        <Badge variant="secondary">DINOv2 Backbone</Badge>
        <Badge variant="secondary">Teacher-Student Distillation</Badge>
        <Badge variant="secondary">Telecom SudParis</Badge>
      </div>

      {/* Headline */}
      <h1 className="mb-4 text-5xl font-bold tracking-tight">
        Monocular Depth Estimation
        <br />
        <span className="text-muted-foreground">from a single image</span>
      </h1>

      {/* Sub-headline */}
      <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
        A reproduction of Depth Anything V2 — training a lightweight ViT-Small
        student model via knowledge distillation from a DINOv2-Giant teacher,
        deployed at scale on Hugging Face Spaces.
      </p>

      {/* CTAs */}
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/demo">Try the Demo →</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/project">Read the Docs</Link>
        </Button>
        <Button asChild size="lg" variant="ghost">
          <a
            href="https://github.com/aramsis/Monocular-Depth-Vision-PFE"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub ↗
          </a>
        </Button>
      </div>

      {/* Feature strip */}
      <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          {
            title: "Depth from a single image",
            desc: "Predicts per-pixel depth maps from uncalibrated RGB images using a ViT backbone and DPT decoder.",
          },
          {
            title: "Distilled at scale",
            desc: "Student trained on pseudo-labels from a frozen DINOv2-Giant teacher on the SA-1B real-image dataset.",
          },
          {
            title: "Deployed on HF Spaces",
            desc: "Inference runs live on Hugging Face Spaces. API-first design, accessible from anywhere.",
          },
        ].map((f) => (
          <div key={f.title} className="rounded-lg border border-border/60 p-6">
            <h3 className="mb-2 font-semibold">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
