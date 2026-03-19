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
  needsCapture: boolean;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  fr:
    "Tu es un assistant vocal pour personnes malvoyantes. Tu recois deux images : l'image couleur originale puis la carte de profondeur colorisee. " +
    "Convention de profondeur : couleurs chaudes/claires (jaune, orange, rouge) = PROCHE ; couleurs froides/sombres (violet, bleu, noir) = LOIN. Ne jamais inverser. " +
    "Decris l'environnement en termes de distances et obstacles avec des phrases courtes et naturelles (ex: 'Porte a 1.5 metres devant vous, sol degagé a droite'). " +
    "Pas de markdown, pas de listes, phrases courtes optimisees pour la synthese vocale. " +
    "Reponds UNIQUEMENT en JSON valide : { \"response\": string, \"needsCapture\": boolean }. " +
    "Mets needsCapture a true SEULEMENT si l'utilisateur indique explicitement un changement de scene (mots-cles : 'maintenant', 'la', 'regarde', 'maintenant t\\'en penses quoi', 'et ca'). " +
    "Dans tous les autres cas, needsCapture est false.",
  en:
    "You are a vocal assistant for visually impaired users. You receive two images: first the original color image, then the colorized depth map. " +
    "Depth convention: bright/warm colors (yellow, orange, red) = CLOSE; dark/cool colors (purple, blue, black) = FAR. Do NOT invert this. " +
    "Describe the environment in terms of distances and obstacles using short natural sentences (e.g. 'Door 1.5 metres ahead, clear floor to your right'). " +
    "No markdown, no lists, short sentences optimized for text-to-speech. " +
    "Respond ONLY with valid JSON: { \"response\": string, \"needsCapture\": boolean }. " +
    "Set needsCapture to true ONLY when the user explicitly implies a scene change (keywords: 'now', 'look', 'what about now', 'and this'). " +
    "In all other cases, needsCapture is false.",
};

const SYSTEM_PROMPTS_NO_CAPTURE: Record<string, string> = {
  fr:
    SYSTEM_PROMPTS["fr"] +
    " IMPORTANT : needsCapture doit etre false dans ta reponse. Tu dois repondre avec les images fournies.",
  en:
    SYSTEM_PROMPTS["en"] +
    " IMPORTANT: needsCapture must be false in your response. Answer using the provided images.",
};

export async function POST(req: NextRequest) {
  let messages: ConversationMessage[];
  let imageBase64: string;
  let depthMapBase64: string;
  let locale: string;
  let allowCapture: boolean;

  try {
    const body = await req.json();
    messages = body?.messages ?? [];
    imageBase64 = body?.imageBase64;
    depthMapBase64 = body?.depthMapBase64;
    locale = body?.locale ?? "fr";
    allowCapture = body?.allowCapture ?? true;
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

  const systemPromptMap = allowCapture ? SYSTEM_PROMPTS : SYSTEM_PROMPTS_NO_CAPTURE;
  const systemPrompt = systemPromptMap[locale] ?? systemPromptMap["fr"];

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

    const response = parsed.response ?? "";
    // Clamp needsCapture to false when allowCapture is false (safety guardrail)
    const needsCapture = allowCapture ? (parsed.needsCapture ?? false) : false;

    return NextResponse.json({ response, needsCapture });
  } catch (err) {
    return NextResponse.json(
      { error: `Groq API error: ${String(err)}` },
      { status: 502 },
    );
  }
}
