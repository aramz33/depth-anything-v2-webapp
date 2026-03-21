"use client";
import { useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { type ConversationMessage } from "@/lib/types";

interface SceneChatProps {
  messages: ConversationMessage[];
  chatInput: string;
  chatLoading: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export function SceneChat({
  messages,
  chatInput,
  chatLoading,
  onInputChange,
  onSend,
}: SceneChatProps) {
  const t = useTranslations("inferencePanel");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <p className="text-sm font-semibold">{t("chatTitle")}</p>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto p-4 max-h-[300px]">
        {chatLoading && messages.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            <span>{t("analyzing")}</span>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={[
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start",
            ].join(" ")}
          >
            <div
              className={[
                "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm",
              ].join(" ")}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {chatLoading && messages.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-sm px-3.5 py-2">
              <div className="flex gap-1 items-center h-4">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      <div className="flex gap-2 border-t border-border px-3 py-2.5">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={chatLoading}
          placeholder={t("chatPlaceholder")}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />
        <button
          onClick={onSend}
          disabled={!chatInput.trim() || chatLoading}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity disabled:opacity-40"
        >
          {chatLoading && (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          )}
          {chatLoading ? t("chatSending") : t("chatSend")}
        </button>
      </div>
    </div>
  );
}
