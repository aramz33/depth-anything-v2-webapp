import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

const BASE_SYSTEM_PROMPT =
  "Tu es un expert en analyse spatiale et aménagement intérieur. Tu reçois l'image originale ET sa depth map colorisée (zones chaudes = proches, zones froides = lointaines). Utilise la depth map pour raisonner sur les dimensions réelles de l'espace, les distances entre objets, les zones libres. Réponds de façon concise et précise en te basant sur la géométrie visible.";

export async function POST(req: NextRequest) {
  let imageBase64: string;
  let depthMapBase64: string | undefined;
  let query: string;
  let locale: string;

  try {
    const body = await req.json();
    imageBase64 = body?.imageBase64;
    depthMapBase64 = body?.depthMapBase64;
    query = body?.query;
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
  if (!query || typeof query !== "string") {
    return NextResponse.json(
      { error: "query is required" },
      { status: 400 },
    );
  }

  const { mediaType, data: b64data } = parseBase64(imageBase64);

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
    { type: "text", text: query },
  ];

  try {
    const langInstruction = `Réponds toujours dans la même langue que l'interface utilisateur. La locale actuelle est ${locale} (fr = français, en = anglais). Si locale = 'fr', réponds en français. Si locale = 'en', réponds en anglais.`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: `${BASE_SYSTEM_PROMPT} ${langInstruction}`,
      messages: [{ role: "user", content: userContent }],
    });

    const response =
      message.content[0]?.type === "text" ? message.content[0].text : "";

    return NextResponse.json({ response });
  } catch (err) {
    return NextResponse.json(
      { error: `Claude API error: ${String(err)}` },
      { status: 502 },
    );
  }
}
