export type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SafetyAlert {
  level: "safe" | "warning" | "danger";
  alert: string;
}
