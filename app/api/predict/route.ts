import { NextRequest, NextResponse } from "next/server"

const HF_SPACE_URL =
  process.env.HF_SPACE_URL ??
  "https://aramsis-depth-anything-v2-pfe-tsp.hf.space/run/predict"

export async function POST(req: NextRequest) {
  const { imageBase64 } = await req.json()

  if (!imageBase64 || typeof imageBase64 !== "string") {
    return NextResponse.json({ error: "imageBase64 is required" }, { status: 400 })
  }

  const start = Date.now()

  const hfRes = await fetch(HF_SPACE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: [imageBase64] }),
  })

  if (!hfRes.ok) {
    let detail = ""
    try {
      const errJson = await hfRes.json()
      detail = JSON.stringify(errJson)
    } catch {
      detail = await hfRes.text()
    }
    return NextResponse.json(
      { error: `HF Spaces error: ${hfRes.status}`, detail },
      { status: 502 }
    )
  }

  const json = await hfRes.json()
  const inferenceMs = Date.now() - start

  return NextResponse.json({
    grayscale: json.data[0],
    colorized: json.data[1],
    inferenceMs,
  })
}
