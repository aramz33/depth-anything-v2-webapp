import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, GROQ_MODEL } from "@/lib/groq-client";
import { toDataUri } from "@/lib/parse-base64";

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

const TRANSPORT_LABELS: Record<string, Record<string, string>> = {
  car: { fr: "voiture", en: "car" },
  bike: { fr: "velo", en: "bike" },
  walk: { fr: "a pied", en: "on foot" },
};

export async function POST(req: NextRequest) {
  let imageBase64: string;
  let depthMapBase64: string | undefined;
  let transport: string;
  let speedKmh: number;
  let locale: string;

  try {
    const body = await req.json();
    imageBase64 = body?.imageBase64;
    depthMapBase64 = body?.depthMapBase64;
    transport = body?.transport ?? "car";
    speedKmh = Number(body?.speedKmh ?? 0);
    locale = body?.locale ?? "fr";
  } catch {
    return NextResponse.json(
      { error: "Failed to parse request body" },
      { status: 400 },
    );
  }

  if (!imageBase64 || typeof imageBase64 !== "string") {
    return NextResponse.json(
      { error: "imageBase64 is required" },
      { status: 400 },
    );
  }

  const transportLabel =
    TRANSPORT_LABELS[transport]?.[locale] ??
    TRANSPORT_LABELS[transport]?.["fr"] ??
    transport;

  const langInstruction =
    locale === "en"
      ? "Always respond in English."
      : "Reponds toujours en francais.";

  const systemPrompt =
    `You are an embedded safety analysis system. You receive two images: first the original color image, then its colorized disparity map. ` +
    `IMPORTANT depth convention: bright/warm colors (yellow, orange, red) = CLOSE to camera; dark/cool colors (purple, black, blue) = FAR from camera. ` +
    `In grayscale: white = close, black = far. Do NOT invert this. ` +
    `Use the disparity map combined with the color image to estimate distances to obstacles. ` +
    `Mode: ${transportLabel}, Speed: ${speedKmh} km/h. ` +
    `Identify dangerous obstacles with their estimated relative distance. ` +
    `Respond ONLY with valid JSON: { "level": "safe"|"warning"|"danger", "alert": string }. ` +
    langInstruction;

  const userContent: ContentPart[] = [
    { type: "image_url", image_url: { url: toDataUri(imageBase64) } },
    ...(depthMapBase64
      ? [
          {
            type: "image_url",
            image_url: { url: toDataUri(depthMapBase64) },
          } satisfies ContentPart,
        ]
      : []),
    { type: "text", text: "Analyse la scene." },
  ];

  try {
    const completion = await getGroqClient().chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 256,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(raw) as {
      level: "safe" | "warning" | "danger";
      alert: string;
    };

    return NextResponse.json({ level: parsed.level, alert: parsed.alert });
  } catch (err) {
    return NextResponse.json(
      { error: `Groq API error: ${String(err)}` },
      { status: 502 },
    );
  }
}
