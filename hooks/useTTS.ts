import { useCallback, useRef, useState } from "react";

interface UseTTSReturn {
  isSpeaking: boolean;
  speak: (text: string, lang?: string) => Promise<void>;
  cancel: () => void;
}

// Pick the best available voice for a given BCP-47 language tag.
// Prefers: exact match → same language prefix → first available.
// On iOS, voices are loaded synchronously; on Chrome they may not be ready yet.
function getBestVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const exact = voices.find((v) => v.lang === lang);
  if (exact) return exact;

  const prefix = lang.split("-")[0];
  const samePrefix = voices.filter((v) => v.lang.startsWith(prefix));
  if (!samePrefix.length) return null;

  // Prefer local (on-device) voices — more natural than network-based ones
  const local = samePrefix.find((v) => v.localService);
  return local ?? samePrefix[0];
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
        utterance.rate = 0.92; // Slightly slower for clarity, especially in French
        utterance.pitch = 1.0;

        // Select best available voice for this language
        const voice = getBestVoice(utterance.lang);
        if (voice) utterance.voice = voice;

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
