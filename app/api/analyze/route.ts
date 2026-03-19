import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TRANSPORT_LABELS: Record<string, string> = {
  car: "voiture",
  bike: "vélo",
  walk: "à pied",
};

function parseBase64(raw: string): {
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  data: string;
} {
  const [mimeTypePart, data] = raw.includes(",")
    ? (raw.split(",") as [string, string])
    : ["data:image/jpeg;base64", raw];
  const mediaType = mimeTypePart
    .replace("data:", "")
    .replace(";base64", "") as
    | "image/jpeg"
    | "image/png"
    | "image/gif"
    | "image/webp";
  return { mediaType, data };
}

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

  const { mediaType, data: b64data } = parseBase64(imageBase64);
  const transportLabel = TRANSPORT_LABELS[transport] ?? transport;

  const langInstruction = `Réponds toujours dans la même langue que l'interface utilisateur. La locale actuelle est ${locale} (fr = français, en = anglais). Si locale = 'fr', réponds en français. Si locale = 'en', réponds en anglais.`;

  const systemPrompt = `Tu es un système d'analyse de sécurité embarqué. Tu reçois l'image originale ET sa depth map colorisée (chaud = proche, froid = loin). Utilise la depth map pour estimer les distances réelles des obstacles. Mode : ${transportLabel}, Vitesse : ${speedKmh} km/h. Identifie les obstacles dangereux avec leur distance estimée en mètres. Réponds UNIQUEMENT en JSON : { level: 'safe'|'warning'|'danger', alert: string } ${langInstruction}`;

  const imageContent: Anthropic.ImageBlockParam = {
    type: "image",
    source: { type: "base64", media_type: mediaType, data: b64data },
  };

  let depthContent: Anthropic.ImageBlockParam | undefined;
  if (depthMapBase64) {
    const { mediaType: dmMime, data: dmData } = parseBase64(depthMapBase64);
    depthContent = {
      type: "image",
      source: { type: "base64", media_type: dmMime, data: dmData },
    };
  }

  const userContent: Anthropic.ContentBlockParam[] = [
    imageContent,
    ...(depthContent ? [depthContent] : []),
    { type: "text", text: "Analyse la scène." },
  ];

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    });

    const raw =
      message.content[0]?.type === "text" ? message.content[0].text : "";

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Unexpected response format from Claude", detail: raw },
        { status: 502 },
      );
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      level: "safe" | "warning" | "danger";
      alert: string;
    };

    return NextResponse.json({ level: parsed.level, alert: parsed.alert });
  } catch (err) {
    return NextResponse.json(
      { error: `Claude API error: ${String(err)}` },
      { status: 502 },
    );
  }
}
