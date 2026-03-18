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

interface Result {
  original: string;
  colorized: string;
  grayscale: string;
  inferenceMs: number;
}

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

export function InferencePanel() {
  const t = useTranslations("inferencePanel");
  const locale = useLocale();
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [completedElapsed, setCompletedElapsed] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

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

  const handleImage = useCallback(
    async (base64: string) => {
      setSelectedSample(null);
      setCompletedElapsed(null);
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

  return (
    <div className="space-y-6">
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
          📷 Use Camera
        </Link>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          {t("running")}
          <span className="font-mono">{elapsed.toFixed(1)}s</span>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

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
        </div>
      )}
    </div>
  );
}
