import Groq from "groq-sdk";

export const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

let _client: Groq | null = null;

export function getGroqClient(): Groq {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY environment variable is not set");
  }
  if (!_client) {
    _client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _client;
}
