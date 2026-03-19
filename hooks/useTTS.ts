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

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          resolve();
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      });
    },
    [lang],
  );

  return { isSpeaking, speak, cancel };
}
