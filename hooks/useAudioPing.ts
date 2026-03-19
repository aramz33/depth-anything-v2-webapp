import { useCallback, useRef } from "react";

interface UseAudioPingReturn {
  pingStart: () => void;
  pingStop: () => void;
}

export function useAudioPing(): UseAudioPingReturn {
  const ctxRef = useRef<AudioContext | null>(null);

  function getCtx(): AudioContext {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    return ctxRef.current;
  }

  function playBeep(startHz: number, endHz: number, durationMs: number): void {
    if (typeof window === "undefined") return;
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(startHz, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(endHz, ctx.currentTime + durationMs / 1000);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  }

  const pingStart = useCallback(() => playBeep(440, 660, 120), []);
  const pingStop = useCallback(() => playBeep(660, 440, 80), []);

  return { pingStart, pingStop };
}
