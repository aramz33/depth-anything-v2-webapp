import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, GROQ_MODEL } from "@/lib/groq-client";
import { toDataUri } from "@/lib/parse-base64";

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

const SYSTEM_PROMPTS: Record<string, string> = {
  fr:
    "Tu es un expert en analyse spatiale et amenagement interieur. Tu recois deux images : d'abord l'image couleur originale, puis la carte de disparite colorisee. " +
    "IMPORTANT convention de profondeur : couleurs chaudes/claires (jaune, orange, rouge) = PROCHE de la camera ; couleurs froides/sombres (violet, noir, bleu) = LOIN. En niveaux de gris : blanc = proche, noir = loin. Ne jamais inverser. " +
    "Utilise la carte de disparite combinee avec l'image couleur pour raisonner sur les dimensions, les distances et les zones libres. Reponds de facon concise et precise. " +
    "Si la question n'est pas liee a l'analyse spatiale, au placement d'objets, aux distances ou a la scene visible, reponds brievement que tu ne peux repondre qu'aux questions sur l'espace et le placement.",
  en:
    "You are an expert in spatial analysis and interior layout. You receive two images: first the original color image, then the colorized disparity map. " +
    "IMPORTANT depth convention: bright/warm colors (yellow, orange, red) = CLOSE to camera; dark/cool colors (purple, black, blue) = FAR. In grayscale: white = close, black = far. Do NOT invert this. " +
    "Use the disparity map combined with the color image to reason about space dimensions, distances between objects, and free areas. Be concise and precise. " +
    "If the question is not related to spatial analysis, object placement, distances, or the visible scene, briefly explain that you can only answer questions about the space and layout.",
};

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

  const systemPrompt = SYSTEM_PROMPTS[locale] ?? SYSTEM_PROMPTS["fr"];

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
