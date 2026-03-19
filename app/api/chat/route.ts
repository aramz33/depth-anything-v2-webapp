import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, GROQ_MODEL } from "@/lib/groq-client";
import { toDataUri } from "@/lib/parse-base64";

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface SafetyResult {
  level: "safe" | "warning" | "danger";
  alert: string;
}

const INIT_PROMPTS: Record<string, string> = {
  fr: "Decris cette scene en 2-3 phrases en mentionnant les objets principaux et leurs distances relatives.",
  en: "Describe this scene in 2-3 sentences, mentioning the main objects and their relative distances.",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  fr:
    "Tu es un assistant expert en analyse de scene et perception spatiale. Tu as acces a l'image originale et sa depth map colorisee. " +
    "Tu peux repondre a des questions sur la scene : distances, objets presents, placement de meubles, dangers, accessibilite. Sois concis et precis. " +
    "Si l'utilisateur pose une question sans rapport avec la profondeur, les obstacles, les distances ou l'analyse spatiale de la scene, reponds brievement que tu ne peux repondre qu'aux questions concernant la scene, les distances et le placement.",
  en:
    "You are an expert assistant for scene analysis and spatial perception. You have access to the original image and its colorized depth map. " +
    "You can answer questions about the scene: distances, objects present, furniture placement, dangers, accessibility. Be concise and precise. " +
    "If the user asks a question unrelated to depth, obstacles, distances, or spatial analysis of the scene, briefly explain that you can only answer questions about the scene, distances, and layout.",
};

export async function POST(req: NextRequest) {
  let messages: ChatMessage[];
  let imageBase64: string;
  let depthMapBase64: string | undefined;
  let safetyResult: SafetyResult | null;
  let locale: string;

  try {
    const body = await req.json();
    messages = body.messages ?? [];
    imageBase64 = body.imageBase64;
    depthMapBase64 = body.depthMapBase64;
    safetyResult = body.safetyResult ?? null;
    locale = body.locale ?? "fr";
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

  const safetyContext = safetyResult
    ? `\n\nSafety analysis result: level "${safetyResult.level}" - ${safetyResult.alert}`
    : "";

  const initPrompt = (INIT_PROMPTS[locale] ?? INIT_PROMPTS["fr"]) + safetyContext;
  const systemPrompt = SYSTEM_PROMPTS[locale] ?? SYSTEM_PROMPTS["fr"];

  const firstUserContent: ContentPart[] = [
    { type: "image_url", image_url: { url: toDataUri(imageBase64) } },
    ...(depthMapBase64
      ? [{ type: "image_url", image_url: { url: toDataUri(depthMapBase64) } } satisfies ContentPart]
      : []),
    { type: "text", text: initPrompt },
  ];

  const historyMessages: { role: "user" | "assistant"; content: string }[] =
    messages.map((m) => ({ role: m.role, content: m.content }));

  try {
    const completion = await getGroqClient().chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 512,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: firstUserContent },
        ...historyMessages,
      ],
    });

    const assistantText = completion.choices[0]?.message?.content ?? "";

    const updatedMessages: ChatMessage[] = [
      ...messages,
      { role: "assistant", content: assistantText },
    ];

    return NextResponse.json({ messages: updatedMessages });
  } catch (err) {
    return NextResponse.json(
      { error: `Groq API error: ${String(err)}` },
      { status: 502 },
    );
  }
}