"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Loader2, Volume2 } from "lucide-react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useTTS } from "@/hooks/useTTS";
import { useAudioPing } from "@/hooks/useAudioPing";
import { ShutterFlash } from "./ShutterFlash";
import { resizeImage } from "@/lib/resize-image";
import { urlToBase64 } from "@/lib/parse-base64";

// ─── Types ────────────────────────────────────────────────────────────────────

type VoiceStatus =
  | "idle"
  | "recording"
  | "transcribing"
  | "analyzing"
  | "capturing"
  | "speaking";

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

interface SceneCache {
  imageBase64: string;
  depthMapBase64: string;
  capturedAt: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_MESSAGES = 20;

const STRINGS: Record<string, Record<string, string>> = {
  analyzing: {
    fr: "Attendez, j'analyse l'environnement...",
    en: "Please wait, analyzing the scene...",
  },
  transcribeError: {
    fr: "Je n'ai pas compris, pouvez-vous répéter ?",
    en: "I didn't catch that, could you repeat?",
  },
  cameraError: {
    fr: "Je ne peux pas accéder à la caméra.",
    en: "I can't access the camera.",
  },
  serviceError: {
    fr: "Service momentanément indisponible.",
    en: "Service temporarily unavailable.",
  },
};

function t(key: string, locale: string): string {
  return STRINGS[key]?.[locale] ?? STRINGS[key]?.["fr"] ?? key;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface VoiceConversationProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  locale: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VoiceConversation({
  videoRef,
  canvasRef,
  locale,
}: VoiceConversationProps) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const sceneCacheRef = useRef<SceneCache | null>(null);
  const [shutterActive, setShutterActive] = useState(false);
  const [cacheAge, setCacheAge] = useState<number | null>(null);
  const [micDisabled, setMicDisabled] = useState(false);

  const { isRecording, startRecording, stopRecording } = useVoiceRecorder();
  const tts = useTTS(locale);
  const { pingStart, pingStop } = useAudioPing();
  const warmUpRef = useRef(false);

  // ─── Mount-time camera permission check ─────────────────────────────────────

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    navigator.permissions
      .query({ name: "camera" as PermissionName })
      .then((result) => {
        if (result.state === "denied") {
          setMicDisabled(true);
          tts.speak(t("cameraError", locale));
        }
        result.onchange = () => {
          setMicDisabled(result.state === "denied");
        };
      })
      .catch(() => {
        // permissions API not supported — fail silently, error surfaces on first capture
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Scene capture ──────────────────────────────────────────────────────────

  const captureScene = useCallback(async (): Promise<SceneCache> => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) throw new Error("camera_unavailable");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    const raw = canvas.toDataURL("image/jpeg", 0.88);
    const imageBase64 = await resizeImage(raw);

    const res = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64 }),
    });
    const data = (await res.json()) as { colorized?: string; error?: string };
    if (!res.ok) throw new Error(data?.error ?? "predict_failed");

    const depthMapBase64 = await urlToBase64(data.colorized!);
    const cache: SceneCache = {
      imageBase64,
      depthMapBase64,
      capturedAt: Date.now(),
    };

    sceneCacheRef.current = cache;
    setCacheAge(cache.capturedAt);
    return cache;
  }, [videoRef, canvasRef]);

  // ─── Vision chat call ───────────────────────────────────────────────────────

  const callVisionChat = useCallback(
    async (
      msgs: ConversationMessage[],
      cache: SceneCache,
      allowCapture: boolean,
    ) => {
      const res = await fetch("/api/vision-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: msgs.slice(-MAX_MESSAGES),
          imageBase64: cache.imageBase64,
          depthMapBase64: cache.depthMapBase64,
          locale,
          allowCapture,
        }),
      });
      const data = (await res.json()) as {
        response?: string;
        needsCapture?: boolean;
        error?: string;
      };
      if (!res.ok) throw new Error(data?.error ?? "vision_chat_failed");
      return {
        response: data.response ?? "",
        needsCapture: data.needsCapture ?? false,
      };
    },
    [locale],
  );

  // ─── Main message handler ───────────────────────────────────────────────────

  const handleMessage = useCallback(
    async (audioBlob: Blob) => {
      // 1. Transcribe
      setStatus("transcribing");
      let transcript: string;
      try {
        const form = new FormData();
        form.append("audio", audioBlob);
        form.append("locale", locale);
        const res = await fetch("/api/transcribe", {
          method: "POST",
          body: form,
        });
        const data = (await res.json()) as { text?: string; error?: string };
        if (!res.ok || !data.text) throw new Error("transcribe_failed");
        transcript = data.text;
      } catch {
        setStatus("speaking");
        await tts.speak(t("transcribeError", locale));
        setStatus("idle");
        return;
      }

      // 2. Ensure scene cache exists
      let cache = sceneCacheRef.current;
      if (!cache) {
        setStatus("capturing");
        try {
          cache = await captureScene();
        } catch {
          setStatus("speaking");
          await tts.speak(t("cameraError", locale));
          setStatus("idle");
          return;
        }
      }

      const updatedMessages: ConversationMessage[] = [
        ...messages,
        { role: "user", content: transcript },
      ];
      setMessages(updatedMessages);

      // 3. First LLM call
      setStatus("analyzing");
      let firstResult: { response: string; needsCapture: boolean };
      try {
        firstResult = await callVisionChat(updatedMessages, cache, true);
      } catch {
        setStatus("speaking");
        await tts.speak(t("serviceError", locale));
        setStatus("idle");
        return;
      }

      // 4. Re-capture if needed (max once)
      let finalResponse = firstResult.response;

      if (firstResult.needsCapture) {
        // Fire TTS + shutter simultaneously
        setStatus("capturing");
        setShutterActive(true);
        if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
        tts.speak(t("analyzing", locale)); // fire-and-forget

        try {
          cache = await captureScene();
        } catch {
          setShutterActive(false);
          await tts.speak(t("cameraError", locale));
          setStatus("idle");
          return;
        }
        setTimeout(() => setShutterActive(false), 1500);

        // Second LLM call — no re-capture allowed
        setStatus("analyzing");
        try {
          const secondResult = await callVisionChat(
            updatedMessages,
            cache,
            false,
          );
          finalResponse = secondResult.response;
        } catch {
          setStatus("speaking");
          await tts.speak(t("serviceError", locale));
          setStatus("idle");
          return;
        }
      }

      // 5. Respond
      const assistantMessage: ConversationMessage = {
        role: "assistant",
        content: finalResponse,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      setStatus("speaking");
      await tts.speak(finalResponse);
      setStatus("idle");
    },
    [messages, locale, captureScene, callVisionChat, tts],
  );

  // ─── Mic button handler ─────────────────────────────────────────────────────

  const handleMicClick = useCallback(async () => {
    // Warm up speech synthesis on first user gesture.
    // iOS/WebKit requires speak() to be called within a direct user gesture
    // to unlock synthesis for subsequent async calls. cancel() alone is not enough.
    if (!warmUpRef.current) {
      warmUpRef.current = true;
      const warmUp = new SpeechSynthesisUtterance(" ");
      warmUp.volume = 0;
      window.speechSynthesis.speak(warmUp);
    }

    // Interrupt TTS if speaking
    if (status === "speaking") {
      tts.cancel();
      setStatus("idle");
      return;
    }

    // Stop recording and process audio
    if (status === "recording") {
      pingStop();
      setStatus("transcribing");
      const blob = await stopRecording();
      if (blob) await handleMessage(blob);
      else setStatus("idle");
      return;
    }

    if (status !== "idle") return;

    const started = await startRecording();
    if (started) {
      pingStart();
      setStatus("recording");
    }
  }, [
    status,
    startRecording,
    stopRecording,
    handleMessage,
    tts,
    pingStart,
    pingStop,
  ]);

  // ─── Cache age display ──────────────────────────────────────────────────────

  const cacheAgeSeconds =
    cacheAge !== null ? Math.floor((Date.now() - cacheAge) / 1000) : null;

  // ─── Render ──────────────────────────────────────────────────────────────────

  const isBusy =
    status === "transcribing" ||
    status === "analyzing" ||
    status === "capturing";

  const cacheLabel =
    locale === "en"
      ? `Seen ${cacheAgeSeconds}s ago`
      : `Vue il y a ${cacheAgeSeconds}s`;

  return (
    <>
      <ShutterFlash active={shutterActive} />

      <div className="flex flex-col items-center gap-2">
        {/* Cache age indicator */}
        {cacheAgeSeconds !== null && (
          <p className="text-xs text-white/50">{cacheLabel}</p>
        )}

        {/* Mic button */}
        <button
          onClick={handleMicClick}
          disabled={isBusy || micDisabled}
          title={micDisabled ? t("cameraError", locale) : undefined}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          className={[
            "flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all",
            status === "recording"
              ? "animate-pulse border-red-500 bg-red-500/20"
              : status === "speaking"
                ? "border-blue-400 bg-blue-400/20"
                : isBusy
                  ? "border-white/20 bg-white/10 opacity-50"
                  : "border-white/40 bg-white/10 hover:bg-white/20",
          ].join(" ")}
        >
          {isBusy ? (
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          ) : status === "speaking" ? (
            <Volume2 className="h-6 w-6 text-blue-400" />
          ) : (
            <Mic
              className={[
                "h-6 w-6",
                status === "recording" ? "text-red-400" : "text-white",
              ].join(" ")}
            />
          )}
        </button>
      </div>
    </>
  );
}
