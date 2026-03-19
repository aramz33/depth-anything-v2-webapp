"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { SampleImages } from "./SampleImages";
import { ImageUpload } from "./ImageUpload";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { Badge } from "@/components/ui/badge";
import { type Sample } from "@/lib/samples";
import { resizeImage } from "@/lib/resize-image";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Result {
  original: string;
  colorized: string;
  grayscale: string;
  inferenceMs: number;
}

interface SafetyAlert {
  level: "safe" | "warning" | "danger";
  alert: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface SpatialQA {
  query: string;
  response: string;
}

type Transport = "car" | "bike" | "walk";
type ActiveMode = "navigation" | "layout";

// ─── Constants ────────────────────────────────────────────────────────────────

const SPEED_MAX: Record<Transport, number> = { car: 130, bike: 50, walk: 15 };
const SPEED_DEFAULT: Record<Transport, number> = { car: 50, bike: 15, walk: 5 };

const ALERT_STYLES: Record<
  SafetyAlert["level"],
  { wrapper: string; dot: string }
> = {
  danger: {
    wrapper: "border-red-500/40 bg-red-950/40 text-red-200",
    dot: "bg-red-500",
  },
  warning: {
    wrapper: "border-orange-500/40 bg-orange-950/40 text-orange-200",
    dot: "bg-orange-400",
  },
  safe: {
    wrapper: "border-green-500/40 bg-green-950/40 text-green-200",
    dot: "bg-green-500",
  },
};

// ─── API helpers ──────────────────────────────────────────────────────────────

async function runPrediction(
  imageBase64: string,
): Promise<Result & { original: string }> {
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
  return { ...(data as Omit<Result, "original">), original: imageBase64 };
}

async function runAnalysis(
  imageBase64: string,
  depthMapBase64: string | null,
  transport: Transport,
  speedKmh: number,
  locale: string,
): Promise<SafetyAlert> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, depthMapBase64, transport, speedKmh, locale }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Analysis failed");
  return data as SafetyAlert;
}

async function runSpatialAnalysis(
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

async function sendChatMessage(
  messages: ChatMessage[],
  imageBase64: string,
  safetyResult: SafetyAlert | null,
): Promise<ChatMessage[]> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, imageBase64, safetyResult }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Chat failed");
  return data.messages as ChatMessage[];
}

/** Fetch an image URL and return it as a base64 data URL. */
async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InferencePanel() {
  const t = useTranslations("inferencePanel");
  const locale = useLocale();

  // ── Depth inference ───────────────────────────────────────────────────────
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
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
  const spatialBottomRef = useRef<HTMLDivElement>(null);

  // ── Chat ──────────────────────────────────────────────────────────────────
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

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
    sendChatMessage([], result.original, null)
      .then((msgs) => setChatMessages(msgs))
      .catch(() => {})
      .finally(() => setChatLoading(false));
  }, [result]);

  // ── Auto-scroll chat and spatial history ──────────────────────────────────
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  useEffect(() => {
    spatialBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [spatialHistory, spatialLoading]);

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
          { query: q, response: `⚠️ ${msg}` },
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
    const nextMessages: ChatMessage[] = [
      ...chatMessages,
      { role: "user", content: text },
    ];
    try {
      const updated = await sendChatMessage(
        nextMessages,
        result.original,
        safetyAlert,
      );
      setChatMessages(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setChatMessages([
        ...chatMessages,
        { role: "user", content: text },
        { role: "assistant", content: `⚠️ ${msg}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatMessages, result, safetyAlert, chatLoading]);

  const handleChatKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleChatSend();
      }
    },
    [handleChatSend],
  );

  // ── Derived ───────────────────────────────────────────────────────────────
  const alertStyle = safetyAlert ? ALERT_STYLES[safetyAlert.level] : null;
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
                {mode === "navigation" ? "🚗" : "🏠"}{" "}
                {t(mode === "navigation" ? "modeNavigation" : "modeLayout")}
              </button>
            ))}
          </div>

          {/* ── Navigation Panel ─────────────────────────────────────── */}
          {activeMode === "navigation" && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-4">
              <p className="text-sm font-semibold">{t("safetyTitle")}</p>

              {/* Transport selector */}
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">
                  {t("transportLabel")}
                </p>
                <div className="flex gap-2">
                  {(["car", "bike", "walk"] as Transport[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleTransportChange(mode)}
                      className={[
                        "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                        transport === mode
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:bg-accent",
                      ].join(" ")}
                    >
                      {mode === "car" && "🚗"}
                      {mode === "bike" && "🚲"}
                      {mode === "walk" && "🚶"}
                      {t(
                        mode === "car"
                          ? "transportCar"
                          : mode === "bike"
                            ? "transportBike"
                            : "transportWalk",
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speed slider */}
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">
                  {t("speedLabel", { speed: speedKmh })}
                </p>
                <input
                  type="range"
                  min={0}
                  max={SPEED_MAX[transport]}
                  value={speedKmh}
                  onChange={(e) => {
                    setSpeedKmh(Number(e.target.value));
                    setSafetyAlert(null);
                    setSafetyError(null);
                  }}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>{SPEED_MAX[transport]} km/h</span>
                </div>
              </div>

              {/* Analyze button */}
              <button
                onClick={handleAnalyze}
                disabled={analyzing || depthMapLoading}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
              >
                {analyzing && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                )}
                {analyzing ? t("analyzing") : t("analyzeButton")}
              </button>

              {safetyError && (
                <p className="text-sm text-destructive">{safetyError}</p>
              )}
              {safetyAlert && alertStyle && (
                <div
                  className={[
                    "flex items-start gap-3 rounded-lg border p-3 text-sm",
                    alertStyle.wrapper,
                  ].join(" ")}
                >
                  <span
                    className={[
                      "mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full",
                      alertStyle.dot,
                    ].join(" ")}
                  />
                  <span>{safetyAlert.alert}</span>
                </div>
              )}
            </div>
          )}

          {/* ── Layout / Spatial Panel ───────────────────────────────── */}
          {activeMode === "layout" && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-4">
              <p className="text-sm font-semibold">{t("spatialTitle")}</p>

              {/* Suggestion chips */}
              <div className="flex flex-wrap gap-2">
                {CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSpatialSubmit(chip)}
                    disabled={spatialLoading}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-40"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Query input + button */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={spatialQuery}
                  onChange={(e) => setSpatialQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSpatialSubmit();
                    }
                  }}
                  disabled={spatialLoading}
                  placeholder={t("spatialQueryPlaceholder")}
                  className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary disabled:opacity-50"
                />
                <button
                  onClick={() => handleSpatialSubmit()}
                  disabled={!spatialQuery.trim() || spatialLoading || depthMapLoading}
                  className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-40"
                >
                  {spatialLoading && (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  )}
                  {spatialLoading ? t("spatialAnalyzing") : t("spatialAnalyze")}
                </button>
              </div>

              {/* Scrollable Q&A history */}
              {spatialHistory.length > 0 && (
                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
                  {spatialHistory.map((qa, i) => (
                    <div key={i} className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">
                        Q : {qa.query}
                      </p>
                      <div className="rounded-lg bg-muted px-3 py-2 text-sm leading-relaxed">
                        {qa.response}
                      </div>
                    </div>
                  ))}
                  {spatialLoading && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                      {t("spatialAnalyzing")}
                    </div>
                  )}
                  <div ref={spatialBottomRef} />
                </div>
              )}
            </div>
          )}

          {/* ── Scene Chat ───────────────────────────────────────────── */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold">{t("chatTitle")}</p>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto p-4 max-h-[300px]">
              {chatLoading && chatMessages.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                  <span>Claude analyse la scène…</span>
                </div>
              )}

              {chatMessages.map((msg, i) => (
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

              {chatLoading && chatMessages.length > 0 && (
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
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleChatKeyDown}
                disabled={chatLoading}
                placeholder={t("chatPlaceholder")}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
              />
              <button
                onClick={handleChatSend}
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
        </div>
      )}
    </div>
  );
}
