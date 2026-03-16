import { TEAM } from "@/lib/team"

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">About</h1>
      <p className="mb-10 text-muted-foreground">
        Final year project (PFE) — Telecom SudParis, MAIA specialization, 2025–2026.
      </p>

      <h2 className="mb-6 text-xl font-semibold">Team</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {TEAM.map((m) => (
          <div key={m.name} className="rounded-lg border border-border p-5">
            <p className="font-semibold">{m.name}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{m.role}</p>
            <div className="mt-3 flex gap-2">
              <a
                href={m.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                GitHub
              </a>
              <a
                href={m.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                LinkedIn
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-lg border border-border p-6">
        <h2 className="mb-3 text-xl font-semibold">Project Links</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <span className="text-muted-foreground">HF Space: </span>
            <a
              href="https://huggingface.co/spaces/aramsis/depth-anything-v2-pfe-tsp"
              className="underline underline-offset-4 hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              aramsis/depth-anything-v2-pfe-tsp
            </a>
          </li>
          <li>
            <span className="text-muted-foreground">GitHub: </span>
            <a
              href="https://github.com/aramsis/Monocular-Depth-Vision-PFE"
              className="underline underline-offset-4 hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              Monocular-Depth-Vision-PFE
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}
