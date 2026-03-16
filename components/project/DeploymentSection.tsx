export function DeploymentSection() {
  return (
    <section id="deployment" className="scroll-mt-20 space-y-5">
      <h2 className="text-2xl font-bold">6. System Architecture &amp; Deployment</h2>
      <p className="text-muted-foreground">
        The trained student model is served as a live API through HuggingFace Spaces,
        hosting a Gradio 5 application backed by a PyTorch inference script. A Next.js
        web frontend communicates with the Gradio API through a server-side proxy route
        that implements a three-step protocol to handle file upload, job queuing, and
        streaming result retrieval.
      </p>

      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/5-system-deployment.drawio.svg"
          alt="End-to-end system deployment architecture"
          className="w-full rounded-lg border border-border"
        />
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          Figure 5 — End-to-end deployment architecture. The client uploads an image
          through the Next.js frontend; a server-side API route orchestrates the
          three-step Gradio 5 protocol; HuggingFace Spaces runs inference and returns
          depth map URLs via SSE stream.
        </figcaption>
      </figure>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Inference Protocol</h3>
        <p className="text-sm text-muted-foreground">
          Direct client-to-HuggingFace communication is avoided to prevent exposing
          the Space URL and to centralise error handling. The Next.js API route acts as
          a controlled proxy:
        </p>
        <ol className="space-y-2">
          {[
            {
              step: "① File Upload",
              detail:
                "The input image is POSTed as multipart/form-data to /gradio_api/upload. HuggingFace returns a temporary file path on its storage.",
            },
            {
              step: "② Job Submission",
              detail:
                "The file path is submitted as a Gradio FileData payload to /gradio_api/call/predict. The server assigns an event_id and queues the inference job.",
            },
            {
              step: "③ SSE Stream",
              detail:
                "The API route opens a GET stream on /gradio_api/call/predict/{event_id} and parses Server-Sent Events until the event: complete event delivers the grayscale and colorized depth map URLs.",
            },
          ].map(({ step, detail }) => (
            <li key={step} className="rounded-lg border border-border p-4">
              <p className="mb-1 font-medium text-sm">{step}</p>
              <p className="text-sm text-muted-foreground">{detail}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-4">
        <p className="mb-1 font-medium text-sm">Infrastructure note</p>
        <p className="text-sm text-muted-foreground">
          HuggingFace Spaces free tier runs on CPU only. Inference latency is 5–15 s per
          image, acceptable for demonstration purposes but insufficient for production use.
          GPU-backed deployment (A10G or equivalent) would reduce latency to under 100 ms.
          The Next.js application is deployed on Vercel with automatic CI/CD triggered on
          push to the main branch.
        </p>
      </div>
    </section>
  )
}
