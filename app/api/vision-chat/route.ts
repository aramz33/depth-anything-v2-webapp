import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, GROQ_MODEL } from "@/lib/groq-client";
import { toDataUri } from "@/lib/parse-base64";
import { type ContentPart, type ConversationMessage } from "@/lib/types";
import { VISION_CHAT_PROMPTS } from "@/lib/prompts";

interface VisionChatOutput {
  response: string;
}

export async function POST(req: NextRequest) {
  let messages: ConversationMessage[];
  let imageBase64: string;
  let depthMapBase64: string;
  let locale: string;

  try {
    const body = await req.json();
    messages = body?.messages ?? [];
    imageBase64 = body?.imageBase64;
    depthMapBase64 = body?.depthMapBase64;
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
  if (!depthMapBase64 || typeof depthMapBase64 !== "string") {
    return NextResponse.json(
      { error: "depthMapBase64 is required" },
      { status: 400 },
    );
  }

  const systemPrompt = VISION_CHAT_PROMPTS[locale] ?? VISION_CHAT_PROMPTS["fr"];

  // Build messages: images only in last user message
  const lastUserIdx = [...messages].map((m) => m.role).lastIndexOf("user");

  const apiMessages = messages.map((msg, idx) => {
    if (msg.role === "user" && idx === lastUserIdx) {
      const content: ContentPart[] = [
        { type: "image_url", image_url: { url: toDataUri(imageBase64) } },
        { type: "image_url", image_url: { url: toDataUri(depthMapBase64) } },
        { type: "text", text: msg.content },
      ];
      return { role: "user" as const, content };
    }
    return { role: msg.role, content: msg.content };
  });

  try {
    const completion = await getGroqClient().chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 512,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: systemPrompt }, ...apiMessages],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let parsed: Partial<VisionChatOutput>;
    try {
      parsed = JSON.parse(raw) as Partial<VisionChatOutput>;
    } catch {
      parsed = {};
    }

    return NextResponse.json({ response: parsed.response ?? "" });
  } catch (err) {
    return NextResponse.json(
      { error: `Groq API error: ${String(err)}` },
      { status: 502 },
    );
  }
}
