import { NextRequest, NextResponse } from "next/server";
import { getGroqClient } from "@/lib/groq-client";

export async function POST(req: NextRequest) {
  let audioFile: File;
  let locale: string;

  try {
    const form = await req.formData();
    const audio = form.get("audio");
    locale = (form.get("locale") as string | null) ?? "fr";

    if (!(audio instanceof Blob)) {
      return NextResponse.json({ error: "audio is required" }, { status: 400 });
    }

    audioFile = new File([audio], "recording.webm", { type: audio.type });
  } catch {
    return NextResponse.json(
      { error: "Failed to parse request" },
      { status: 400 },
    );
  }

  const language = locale === "en" ? "en" : "fr";

  try {
    const transcription = await getGroqClient().audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3-turbo",
      language,
    });

    return NextResponse.json({ text: transcription.text });
  } catch (err) {
    return NextResponse.json(
      { error: `Transcription error: ${String(err)}` },
      { status: 502 },
    );
  }
}
