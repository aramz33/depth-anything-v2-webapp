import { InferencePanel } from "@/components/demo/InferencePanel"

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Depth Estimation Playground</h1>
        <p className="mt-2 text-muted-foreground">
          Select a sample image or upload your own. The model runs on{" "}
          <a
            href="https://huggingface.co/spaces/aramsis/depth-anything-v2-pfe-tsp"
            className="underline underline-offset-4 hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            Hugging Face Spaces
          </a>
          .
        </p>
      </div>
      <InferencePanel />
    </div>
  )
}
