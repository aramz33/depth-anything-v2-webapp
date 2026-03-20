import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, GROQ_MODEL } from "@/lib/groq-client";
import { toDataUri } from "@/lib/parse-base64";

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

interface VisionChatOutput {
  response: string;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  fr:
    "Tu es un assistant vocal pour personnes non-voyantes. Tu reçois deux images : l'image originale en couleur, puis la carte de profondeur colorisée issue d'un modèle d'estimation de profondeur monoculaire. " +
    "Convention de profondeur : couleurs chaudes/claires (jaune, orange, rouge) = PROCHE ; couleurs froides/sombres (violet, bleu, noir) = LOIN. Ne jamais inverser. " +
    "LA DISTANCE EST L'INFORMATION PRINCIPALE. Commence TOUJOURS par les éléments les plus proches avec leur distance estimée en mètres, puis les éléments intermédiaires, puis les lointains. " +
    "Chaque élément mentionné DOIT être accompagné de sa distance estimée. Exemple : 'À cinquante centimètres devant vous, une chaise. À un mètre cinquante, une table. À trois mètres, la porte.' " +
    "Après les distances, précise la position (gauche, droite, devant) et si c'est un obstacle ou un passage. " +
    "Pas de markdown, pas de listes, phrases courtes et naturelles optimisées pour la synthèse vocale. " +
    'Réponds UNIQUEMENT en JSON valide : { "response": string }.',
  en:
    "You are a vocal assistant for blind users. You receive two images: the original color image, then the colorized depth map produced by a monocular depth estimation model. " +
    "Depth convention: bright/warm colors (yellow, orange, red) = CLOSE; dark/cool colors (purple, blue, black) = FAR. Do NOT invert this. " +
    "DISTANCE IS THE PRIMARY INFORMATION. ALWAYS start with the closest elements and their estimated distance in metres, then mid-range, then distant ones. " +
    "Every element mentioned MUST include its estimated distance. Example: 'Fifty centimetres ahead, a chair. One and a half metres, a table. Three metres, the door.' " +
    "After distances, add position (left, right, ahead) and whether it is an obstacle or passageway. " +
    "Be precise about distances and positions. For indoors, describe walls, doors, windows, furniture. " +
    "For outdoors, describe the road, pavements, buildings, vegetation. " +
    "No markdown, no lists, short natural sentences optimized for text-to-speech. " +
    'Respond ONLY with valid JSON: { "response": string }.',
};

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

  const systemPrompt = SYSTEM_PROMPTS[locale] ?? SYSTEM_PROMPTS["fr"];

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
