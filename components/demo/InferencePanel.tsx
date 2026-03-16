"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { SampleImages } from "./SampleImages";
import { ImageUpload } from "./ImageUpload";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { Badge } from "@/components/ui/badge";
import { type Sample } from "@/lib/samples";

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
  return { original: imageBase64, ...(data as Result) };
}

export function InferencePanel() {
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (loading) {
      setElapsed(0);
      intervalRef.current = setInterval(() => {
        setElapsed((t) => Math.round((t + 0.1) * 10) / 10);
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

  const handleImage = useCallback(async (base64: string) => {
    setSelectedSample(null);
    setLoading(true);
    setError(null);
    try {
      const r = await runPrediction(base64);
      setResult(r);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(`Inference failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

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
        <Badge variant="outline">ViT-Small · 25M params</Badge>
        <Badge variant="outline">Hosted on HF Spaces</Badge>
        {result && (
          <Badge variant="secondary">
            Inference: {(result.inferenceMs / 1000).toFixed(1)}s
          </Badge>
        )}
      </div>

      <SampleImages selected={selectedSample} onSelect={handleSample} />
      <ImageUpload onImage={handleImage} />

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Running inference…
          <span className="font-mono">{elapsed.toFixed(1)}s</span>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {result && !loading && (
        <div className="space-y-4">
          <p className="text-sm font-medium">Result — drag the slider</p>
          <BeforeAfterSlider
            original={result.original}
            colorized={result.colorized}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2 text-xs text-muted-foreground">
                Grayscale depth
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.grayscale}
                alt="Grayscale depth map"
                className="w-full rounded-lg border border-border"
              />
            </div>
            <div>
              <p className="mb-2 text-xs text-muted-foreground">
                Colorized depth
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.colorized}
                alt="Colorized depth map"
                className="w-full rounded-lg border border-border"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
