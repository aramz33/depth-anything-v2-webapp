"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { resizeImage } from "@/lib/resize-image";

type Status = "idle" | "streaming" | "loading" | "done" | "error";

interface Result {
  colorized: string;
  inferenceMs: number;
}

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStatus("streaming");
    } catch {
      setError("Camera access denied. Please allow camera permissions.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [startCamera]);

  const capture = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    setStatus("loading");
    setResult(null);
    setError(null);

    try {
      const raw = canvas.toDataURL("image/jpeg", 0.88);
      const imageBase64 = await resizeImage(raw);

      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Prediction failed");

      setResult({ colorized: data.colorized, inferenceMs: data.inferenceMs });
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setStatus("streaming");
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-black text-white">
      {/* Camera preview */}
      <div className="relative flex-1">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
          style={{ display: status === "done" ? "none" : "block" }}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Depth result overlay */}
        {status === "done" && result && (
          <img
            src={result.colorized}
            alt="Depth map"
            className="h-full w-full object-cover"
          />
        )}

        {/* Loading overlay */}
        {status === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <div className="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
            <p className="text-sm text-white/80">Running inference…</p>
          </div>
        )}

        {/* Error message */}
        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 px-6 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={startCamera}
              className="rounded-full bg-white px-6 py-2 text-sm font-medium text-black"
            >
              Retry
            </button>
          </div>
        )}

        {/* Inference time badge */}
        {status === "done" && result && (
          <div className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs text-white/80">
            {(result.inferenceMs / 1000).toFixed(1)}s
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-center gap-6 bg-black px-6 py-8">
        {status === "done" ? (
          <>
            <button
              onClick={reset}
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-medium"
            >
              Retake
            </button>
            <button
              onClick={capture}
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
            >
              Retake &amp; infer
            </button>
          </>
        ) : (
          <button
            onClick={capture}
            disabled={status !== "streaming"}
            className="h-16 w-16 rounded-full bg-white disabled:opacity-40"
            aria-label="Capture"
          />
        )}
      </div>
    </div>
  );
}