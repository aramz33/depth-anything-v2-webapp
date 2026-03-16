"use client"
import Image from "next/image"
import { SAMPLES, type Sample } from "@/lib/samples"
import { cn } from "@/lib/utils"

interface Props {
  selected: string | null
  onSelect: (sample: Sample) => void
}

export function SampleImages({ selected, onSelect }: Props) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Sample images
      </p>
      <div className="flex flex-wrap gap-2">
        {SAMPLES.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className={cn(
              "overflow-hidden rounded-md border-2 transition-all",
              selected === s.id
                ? "border-primary"
                : "border-transparent hover:border-border"
            )}
          >
            <Image
              src={s.src}
              alt={s.label}
              width={80}
              height={60}
              className="h-[60px] w-[80px] object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
