import Link from "next/link"

const links = [
  { href: "/project", label: "Project" },
  { href: "/demo", label: "Demo" },
  { href: "/about", label: "About" },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-primary">Depth</span>
          <span>Anything V2</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
            TSP PFE
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <a
            href="https://huggingface.co/spaces/aramsis/depth-anything-v2-pfe-tsp"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            HF Space ↗
          </a>
        </nav>
      </div>
    </header>
  )
}
