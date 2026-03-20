import { useCallback, useRef, useState } from "react";

interface UseTTSReturn {
  isSpeaking: boolean;
  speak: (text: string, lang?: string) => Promise<void>;
  cancel: () => void;
}

export function useTTS(locale: string): UseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const lang = locale === "en" ? "en-US" : "fr-FR";

  const cancel = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, overrideLang?: string): Promise<void> => {
      return new Promise((resolve) => {
        if (typeof window === "undefined") {
          resolve();
          return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = overrideLang ?? lang;
        utteranceRef.current = utterance;

        let keepAlive: ReturnType<typeof setInterval> | null = null;

        utterance.onstart = () => {
          setIsSpeaking(true);
          // Chrome bug: synthesis silently pauses after ~15s in background
          keepAlive = setInterval(() => {
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
          }, 5000);
        };
        utterance.onend = () => {
          if (keepAlive) clearInterval(keepAlive);
          setIsSpeaking(false);
          resolve();
        };
        utterance.onerror = () => {
          if (keepAlive) clearInterval(keepAlive);
          setIsSpeaking(false);
          resolve();
        };

        // Chrome bug: cancel() followed immediately by speak() in the same
        // synchronous block silently drops the utterance. A short delay lets
        // the browser fully process the cancel before queuing the new one.
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 50);
      });
    },
    [lang],
  );

  return { isSpeaking, speak, cancel };
}
