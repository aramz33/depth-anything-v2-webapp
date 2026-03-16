import { NextRequest, NextResponse } from "next/server";

const HF_SPACE_BASE =
  process.env.HF_SPACE_BASE ??
  "https://aramsis-depth-anything-v2-pfe-tsp.hf.space";

export async function POST(req: NextRequest) {
  const { imageBase64 } = await req.json();

  if (!imageBase64 || typeof imageBase64 !== "string") {
    return NextResponse.json(
      { error: "imageBase64 is required" },
      { status: 400 },
    );
  }

  // Step 1: Upload the image to the HF Space
  const [mimeType, b64data] = imageBase64.includes(",")
    ? (imageBase64.split(",") as [string, string])
    : ["data:image/jpeg", imageBase64];
  const mime = mimeType.replace("data:", "").replace(/;base64$/, "");
  const ext = mime.split("/")[1] ?? "jpg";
  const buffer = Buffer.from(b64data, "base64");
  const formData = new FormData();
  formData.append("files", new Blob([buffer], { type: mime }), `image.${ext}`);

  const uploadRes = await fetch(`${HF_SPACE_BASE}/gradio_api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
    let detail = "";
    try {
      detail = JSON.stringify(await uploadRes.json());
    } catch {
      detail = await uploadRes.text();
    }
    return NextResponse.json(
      { error: `HF Spaces upload error: ${uploadRes.status}`, detail },
      { status: 502 },
    );
  }

  const uploadedPaths: string[] = await uploadRes.json();
  const filePath = uploadedPaths[0];

  // Step 2: Submit the job to the Gradio 5 queue
  const submitRes = await fetch(`${HF_SPACE_BASE}/gradio_api/call/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [{ path: filePath, meta: { _type: "gradio.FileData" } }],
    }),
  });

  if (!submitRes.ok) {
    let detail = "";
    try {
      detail = JSON.stringify(await submitRes.json());
    } catch {
      detail = await submitRes.text();
    }
    return NextResponse.json(
      { error: `HF Spaces submit error: ${submitRes.status}`, detail },
      { status: 502 },
    );
  }

  const { event_id } = await submitRes.json();

  if (!event_id) {
    return NextResponse.json(
      { error: "No event_id returned from HF Spaces" },
      { status: 502 },
    );
  }

  // Step 3: Stream the SSE result
  const start = Date.now();
  const streamRes = await fetch(
    `${HF_SPACE_BASE}/gradio_api/call/predict/${event_id}`,
  );

  if (!streamRes.ok || !streamRes.body) {
    return NextResponse.json(
      { error: `HF Spaces stream error: ${streamRes.status}` },
      { status: 502 },
    );
  }

  // Read SSE lines and find the "complete" event data
  const text = await streamRes.text();
  const lines = text.split("\n");

  let outputData: unknown[] | null = null;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line === "event: complete") {
      const dataLine = lines[i + 1]?.trim();
      if (dataLine?.startsWith("data: ")) {
        try {
          outputData = JSON.parse(dataLine.slice(6));
        } catch {
          // ignore parse errors, keep scanning
        }
      }
    }
    i++;
  }

  if (!outputData || outputData.length < 2) {
    return NextResponse.json(
      {
        error: "Unexpected response format from HF Spaces",
        detail: text.slice(0, 500),
      },
      { status: 502 },
    );
  }

  const grayscale = (outputData[0] as { url?: string })?.url ?? outputData[0];
  const colorized = (outputData[1] as { url?: string })?.url ?? outputData[1];
  const inferenceMs = Date.now() - start;

  return NextResponse.json({ grayscale, colorized, inferenceMs });
}
