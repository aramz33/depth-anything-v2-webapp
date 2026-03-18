"use client"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { useTranslations } from "next-intl"

interface Props {
  onImage: (base64: string) => void
}

const ACCEPTED = { "image/jpeg": [], "image/png": [], "image/webp": [] }
const MAX_SIZE = 5 * 1024 * 1024

export function ImageUpload({ onImage }: Props) {
  const t = useTranslations("imageUpload")

  const onDrop = useCallback(
    (files: File[]) => {
      const file = files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => onImage(reader.result as string)
      reader.readAsDataURL(file)
    },
    [onImage]
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({ onDrop, accept: ACCEPTED, maxSize: MAX_SIZE, maxFiles: 1 })

  const error = fileRejections[0]?.errors[0]?.message

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {t("label")}
      </p>
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-sm text-muted-foreground">
          {isDragActive ? t("dropActive") : t("dropIdle")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{t("hint")}</p>
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}
