"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { SampleImages } from "./SampleImages";
import { ImageUpload } from "./ImageUpload";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { NavigationPanel } from "./NavigationPanel";
import { SceneChat } from "./SceneChat";
import { SpatialPanel } from "./SpatialPanel";
import { Badge } from "@/components/ui/badge";
import { type Sample } from "@/lib/samples";
import { resizeImage } from "@/lib/resize-image";
import {
  type Transport,
  type InferenceResult,
  runPrediction,
  runAnalysis,
  runSpatialAnalysis,
  sendChatMessage,
  urlToBase64,
} from "@/lib/inference-api";
import { type ConversationMessage, type SafetyAlert } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpatialQA {
  query: string;
  response: string;
}

type ActiveMode = "navigation" | "layout";

// ─── Constants ────────────────────────────────────────────────────────────────

const SPEED_MAX: Record<Transport, number> = { car: 130, bike: 50, walk: 15 };
const SPEED_DEFAULT: Record<Transport, number> = { car: 50, bike: 15, walk: 5 };

// ─── Component ────────────────────────────────────────────────────────────────

export function InferencePanel() {
  const t = useTranslations("inferencePanel");
  const locale = useLocale();

  // ── Depth inference ───────────────────────────────────────────────────────
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const [result, setResult] = useState<InferenceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [completedElapsed, setCompletedElapsed] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // ── Depth map base64 (fetched from result.colorized URL) ──────────────────
  const [depthMapBase64, setDepthMapBase64] = useState<string | null>(null);
  const [depthMapLoading, setDepthMapLoading] = useState(false);

  // ── Mode selector ─────────────────────────────────────────────────────────
  const [activeMode, setActiveMode] = useState<ActiveMode>("navigation");

  // ── Navigation mode ───────────────────────────────────────────────────────
  const [transport, setTransport] = useState<Transport>("car");
  const [speedKmh, setSpeedKmh] = useState<number>(SPEED_DEFAULT.car);
  const [safetyAlert, setSafetyAlert] = useState<SafetyAlert | null>(null);
  const [safetyError, setSafetyError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // ── Layout mode ───────────────────────────────────────────────────────────
  const [spatialQuery, setSpatialQuery] = useState("");
  const [spatialHistory, setSpatialHistory] = useState<SpatialQA[]>([]);
  const [spatialLoading, setSpatialLoading] = useState(false);

  // ── Chat ──────────────────────────────────────────────────────────────────
  const [chatMessages, setChatMessages] = useState<ConversationMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // ── Depth inference timer ─────────────────────────────────────────────────
  useEffect(() => {
    if (loading) {
      setElapsed(0);
      intervalRef.current = setInterval(() => {
        setElapsed((Date.now() - startTimeRef.current) / 1000);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loading]);

  // ── Fetch depth map as base64 when result arrives ─────────────────────────
  useEffect(() => {
    if (!result?.colorized) {
      setDepthMapBase64(null);
      return;
    }
    setDepthMapLoading(true);
    urlToBase64(result.colorized)
      .then(setDepthMapBase64)
      .catch(() => setDepthMapBase64(null))
      .finally(() => setDepthMapLoading(false));
  }, [result]);

  // ── Auto-init chat when result is ready ───────────────────────────────────
  useEffect(() => {
    if (!result) return;
    setChatMessages([]);
    setChatLoading(true);
    sendChatMessage([], result.original, null, depthMapBase64, locale)
      .then((msgs) => setChatMessages(msgs))
      .catch(() => setChatMessages([]))
      .finally(() => setChatLoading(false));
  }, [result]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleImage = useCallback(
    async (base64: string) => {
      setSelectedSample(null);
      setCompletedElapsed(null);
      setSafetyAlert(null);
      setSafetyError(null);
      setChatMessages([]);
      setChatInput("");
      setSpatialHistory([]);
      setSpatialQuery("");
      setDepthMapBase64(null);
      startTimeRef.current = Date.now();
      setLoading(true);
      setError(null);
      try {
        const resized = await resizeImage(base64);
        const r = await runPrediction(resized);
        setResult(r);
        setCompletedElapsed((Date.now() - startTimeRef.current) / 1000);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(t("errorPrefix", { message: msg }));
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  const handleSample = useCallback(
    async (sample: Sample) => {
      setSelectedSample(sample.id);
      const res = await fetch(sample.src);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = () => handleImage(reader.result as string);
      reader.readAsDataURL(blob);
    },
    [handleImage],
  );

  const handleTransportChange = useCallback((mode: Transport) => {
    setTransport(mode);
    setSpeedKmh(SPEED_DEFAULT[mode]);
    setSafetyAlert(null);
    setSafetyError(null);
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setSpeedKmh(speed);
    setSafetyAlert(null);
    setSafetyError(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!result) return;
    setAnalyzing(true);
    setSafetyAlert(null);
    setSafetyError(null);
    try {
      const alert = await runAnalysis(
        result.original,
        depthMapBase64,
        transport,
        speedKmh,
        locale,
      );
      setSafetyAlert(alert);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setSafetyError(t("analyzeError", { message: msg }));
    } finally {
      setAnalyzing(false);
    }
  }, [result, depthMapBase64, transport, speedKmh, t]);

  const handleSpatialSubmit = useCallback(
    async (queryOverride?: string) => {
      const q = (queryOverride ?? spatialQuery).trim();
      if (!q || !result || spatialLoading) return;
      setSpatialQuery("");
      setSpatialLoading(true);
      try {
        const response = await runSpatialAnalysis(
          result.original,
          depthMapBase64,
          q,
          locale,
        );
        setSpatialHistory((prev) => [...prev, { query: q, response }]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setSpatialHistory((prev) => [
          ...prev,
          { query: q, response: `Error: ${msg}` },
        ]);
      } finally {
        setSpatialLoading(false);
      }
    },
    [spatialQuery, result, depthMapBase64, spatialLoading],
  );

  const handleChatSend = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || !result || chatLoading) return;
    setChatInput("");
    setChatLoading(true);
    const nextMessages: ConversationMessage[] = [
      ...chatMessages,
      { role: "user", content: text },
    ];
    try {
      const updated = await sendChatMessage(
        nextMessages,
        result.original,
        safetyAlert,
        depthMapBase64,
        locale,
      );
      setChatMessages(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setChatMessages([
        ...chatMessages,
        { role: "user", content: text },
        { role: "assistant", content: `Error: ${msg}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatMessages, result, safetyAlert, chatLoading]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const CHIPS = [
    t("spatialChip1"),
    t("spatialChip2"),
    t("spatialChip3"),
    t("spatialChip4"),
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{t("badge1")}</Badge>
        <Badge variant="outline">{t("badge2")}</Badge>
        {completedElapsed !== null && (
          <Badge variant="secondary">
            {t("inferenceTime", { time: completedElapsed.toFixed(1) })}
          </Badge>
        )}
      </div>

      <SampleImages selected={selectedSample} onSelect={handleSample} />
      <ImageUpload onImage={handleImage} />

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>On mobile?</span>
        <Link
          href={`/${locale}/camera`}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          Use Camera
        </Link>
      </div>

      {/* Depth inference loading */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          {t("running")}
          <span className="font-mono">{elapsed.toFixed(1)}s</span>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* ── Results ─────────────────────────────────────────────────────── */}
      {result && !loading && (
        <div className="space-y-4">
          <p className="text-sm font-medium">{t("result")}</p>

          <BeforeAfterSlider
            original={result.original}
            colorized={result.colorized}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2 text-xs text-muted-foreground">
                {t("grayscaleLabel")}
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.grayscale}
                alt={t("grayscaleAlt")}
                className="w-full rounded-lg border border-border"
              />
            </div>
            <div>
              <p className="mb-2 text-xs text-muted-foreground">
                {t("colorizedLabel")}
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.colorized}
                alt={t("colorizedAlt")}
                className="w-full rounded-lg border border-border"
              />
            </div>
          </div>

          {/* Depth map loading indicator */}
          {depthMapLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              {t("depthMapLoading")}
            </div>
          )}

          {/* ── Mode selector ────────────────────────────────────────── */}
          <div className="flex gap-2">
            {(["navigation", "layout"] as ActiveMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setActiveMode(mode)}
                className={[
                  "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                  activeMode === mode
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-accent",
                ].join(" ")}
              >
                {t(mode === "navigation" ? "modeNavigation" : "modeLayout")}
              </button>
            ))}
          </div>

          {/* ── Navigation Panel ─────────────────────────────────────── */}
          {activeMode === "navigation" && (
            <NavigationPanel
              transport={transport}
              speedKmh={speedKmh}
              speedMax={SPEED_MAX[transport]}
              analyzing={analyzing}
              safetyAlert={safetyAlert}
              safetyError={safetyError}
              depthMapLoading={depthMapLoading}
              onTransportChange={handleTransportChange}
              onSpeedChange={handleSpeedChange}
              onAnalyze={handleAnalyze}
            />
          )}

          {/* ── Layout / Spatial Panel ───────────────────────────────── */}
          {activeMode === "layout" && (
            <SpatialPanel
              spatialQuery={spatialQuery}
              spatialHistory={spatialHistory}
              spatialLoading={spatialLoading}
              depthMapLoading={depthMapLoading}
              chips={CHIPS}
              onQueryChange={setSpatialQuery}
              onSubmit={handleSpatialSubmit}
            />
          )}

          {/* ── Scene Chat ───────────────────────────────────────────── */}
          <SceneChat
            messages={chatMessages}
            chatInput={chatInput}
            chatLoading={chatLoading}
            onInputChange={setChatInput}
            onSend={handleChatSend}
          />
        </div>
      )}
    </div>
  );
}
