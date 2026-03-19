import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface SafetyResult {
  level: "safe" | "warning" | "danger";
  alert: string;
}

// Automatically sent as the very first user turn to seed the conversation
const INIT_PROMPT =
  "Décris cette scène en 2-3 phrases en mentionnant les objets principaux et leurs distances relatives.";

export async function POST(req: NextRequest) {
  let messages: ChatMessage[];
  let imageBase64: string;
  let depthMapBase64: string | undefined;
  let safetyResult: SafetyResult | null;

  try {
    const body = await req.json();
    messages = body.messages ?? [];
    imageBase64 = body.imageBase64;
    depthMapBase64 = body.depthMapBase64; // accepted but optional
    safetyResult = body.safetyResult ?? null;
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

  const [mimeTypePart, b64data] = imageBase64.includes(",")
    ? (imageBase64.split(",") as [string, string])
    : ["data:image/jpeg;base64", imageBase64];
  const mediaType = mimeTypePart
    .replace("data:", "")
    .replace(";base64", "") as
    | "image/jpeg"
    | "image/png"
    | "image/gif"
    | "image/webp";

  const safetyContext = safetyResult
    ? `\n\nRésultat d'analyse de sécurité : niveau "${safetyResult.level}" — ${safetyResult.alert}`
    : "";

  // The Anthropic messages array always starts with the image turn.
  // Subsequent turns from the stored history are appended as plain text.
  const imageContent: Anthropic.ImageBlockParam = {
    type: "image",
    source: { type: "base64", media_type: mediaType, data: b64data },
  };

  // If a depth map is provided, include it as a second image in the first turn
  let depthContent: Anthropic.ImageBlockParam | null = null;
  if (depthMapBase64) {
    const [dmMime, dmB64] = depthMapBase64.includes(",")
      ? (depthMapBase64.split(",") as [string, string])
      : ["data:image/jpeg;base64", depthMapBase64];
    depthContent = {
      type: "image",
      source: {
        type: "base64",
        media_type: dmMime.replace("data:", "").replace(";base64", "") as
          | "image/jpeg"
          | "image/png"
          | "image/gif"
          | "image/webp",
        data: dmB64,
      },
    };
  }

  const firstUserContent: Anthropic.ContentBlockParam[] = [
    imageContent,
    ...(depthContent ? [depthContent] : []),
    { type: "text", text: INIT_PROMPT + safetyContext },
  ];

  const anthropicMessages: Anthropic.MessageParam[] = [
    { role: "user", content: firstUserContent },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system:
        "Tu es un assistant expert en analyse de scène et perception spatiale. Tu as accès à l'image originale, sa depth map (carte de profondeur colorisée) et un résultat d'analyse de sécurité. Tu peux répondre à des questions sur la scène : distances, objets présents, placement possible de meubles, dangers, accessibilité, etc. Sois concis et précis.",
      messages: anthropicMessages,
    });

    const assistantText =
      response.content[0]?.type === "text" ? response.content[0].text : "";

    const updatedMessages: ChatMessage[] = [
      ...messages,
      { role: "assistant", content: assistantText },
    ];

    return NextResponse.json({ messages: updatedMessages });
  } catch (err) {
    return NextResponse.json(
      { error: `Claude API error: ${String(err)}` },
      { status: 502 },
    );
  }
}
