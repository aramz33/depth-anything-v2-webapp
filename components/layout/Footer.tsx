export function Footer() {
  return (
    <footer className="border-t border-border/40 py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
        <p>
          Depth Anything V2 · PFE Telecom SudParis · MAIA ·{" "}
          <a
            href="https://github.com/aramsis/Monocular-Depth-Vision-PFE"
            className="underline underline-offset-4 hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
      </div>
    </footer>
  )
}