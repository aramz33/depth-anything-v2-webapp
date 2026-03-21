import { type ConversationMessage, type SafetyAlert } from "./types";

export type { ConversationMessage, SafetyAlert };

export type Transport = "car" | "bike" | "walk";

export interface InferenceResult {
  original: string;
  colorized: string;
  grayscale: string;
  inferenceMs: number;
}

export async function runPrediction(
  imageBase64: string,
): Promise<InferenceResult> {
  const res = await fetch("/api/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64 }),
  });
  let data: Record<string, unknown>;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server error ${res.status} (response was not JSON)`);
  }
  if (!res.ok)
    throw new Error(String(data?.detail ?? data?.error ?? "Prediction failed"));
  return { ...(data as Omit<InferenceResult, "original">), original: imageBase64 };
}

export async function runAnalysis(
  imageBase64: string,
  depthMapBase64: string | null,
  transport: Transport,
  speedKmh: number,
  locale: string,
): Promise<SafetyAlert> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64,
      depthMapBase64,
      transport,
      speedKmh,
      locale,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Analysis failed");
  return data as SafetyAlert;
}

export async function runSpatialAnalysis(
  imageBase64: string,
  depthMapBase64: string | null,
  query: string,
  locale: string,
): Promise<string> {
  const res = await fetch("/api/spatial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, depthMapBase64, query, locale }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Spatial analysis failed");
  return data.response as string;
}

export async function sendChatMessage(
  messages: ConversationMessage[],
  imageBase64: string,
  safetyResult: SafetyAlert | null,
  depthMapBase64: string | null,
  locale: string,
): Promise<ConversationMessage[]> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      imageBase64,
      safetyResult,
      depthMapBase64,
      locale,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Chat failed");
  return data.messages as ConversationMessage[];
}

/** Fetch an image URL and return it as a base64 data URL. */
export async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
