import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, GROQ_MODEL } from "@/lib/groq-client";
import { toDataUri } from "@/lib/parse-base64";
import {
  type ContentPart,
  type ConversationMessage,
  type SafetyAlert,
} from "@/lib/types";
import { SCENE_INIT_PROMPTS, SCENE_CHAT_PROMPTS } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  let messages: ConversationMessage[];
  let imageBase64: string;
  let depthMapBase64: string | undefined;
  let safetyResult: SafetyAlert | null;
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

  const initPrompt =
    (SCENE_INIT_PROMPTS[locale] ?? SCENE_INIT_PROMPTS["fr"]) + safetyContext;
  const systemPrompt = SCENE_CHAT_PROMPTS[locale] ?? SCENE_CHAT_PROMPTS["fr"];

  const firstUserContent: ContentPart[] = [
    { type: "image_url", image_url: { url: toDataUri(imageBase64) } },
    ...(depthMapBase64
      ? [
          {
            type: "image_url",
            image_url: { url: toDataUri(depthMapBase64) },
          } satisfies ContentPart,
        ]
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

    const updatedMessages: ConversationMessage[] = [
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
