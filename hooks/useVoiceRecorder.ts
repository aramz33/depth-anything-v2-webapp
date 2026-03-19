import { useCallback, useRef, useState } from "react";

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
}

const MAX_RECORDING_MS = 30_000;

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolveRef = useRef<((blob: Blob | null) => void) | null>(null);

  const startRecording = useCallback(async () => {
    if (isRecording) return;

    chunksRef.current = [];

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      return;
    }

    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob =
        chunksRef.current.length > 0
          ? new Blob(chunksRef.current, { type: recorder.mimeType })
          : null;
      resolveRef.current?.(blob);
      resolveRef.current = null;
      setIsRecording(false);
    };

    recorder.start();
    setIsRecording(true);

    // Hard timeout — auto-stop after 30s
    timeoutRef.current = setTimeout(() => {
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
      }
    }, MAX_RECORDING_MS);
  }, [isRecording]);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!recorderRef.current || recorderRef.current.state !== "recording") {
        resolve(null);
        return;
      }

      resolveRef.current = resolve;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      recorderRef.current.stop();
    });
  }, []);

  return { isRecording, startRecording, stopRecording };
}
