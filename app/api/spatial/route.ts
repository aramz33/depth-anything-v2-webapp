import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, GROQ_MODEL } from "@/lib/groq-client";
import { toDataUri } from "@/lib/parse-base64";
import { type ContentPart } from "@/lib/types";
import { SPATIAL_PROMPTS } from "@/lib/prompts";

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
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  const systemPrompt = SPATIAL_PROMPTS[locale] ?? SPATIAL_PROMPTS["fr"];

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
    { type: "text", text: query },
  ];

  try {
    const completion = await getGroqClient().chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 512,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    });

    const response = completion.choices[0]?.message?.content ?? "";

    return NextResponse.json({ response });
  } catch (err) {
    return NextResponse.json(
      { error: `Groq API error: ${String(err)}` },
      { status: 502 },
    );
  }
}
