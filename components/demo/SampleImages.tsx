"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { SAMPLES, type Sample } from "@/lib/samples";
import { cn } from "@/lib/utils";

interface Props {
  selected: string | null;
  onSelect: (sample: Sample) => void;
}

export function SampleImages({ selected, onSelect }: Props) {
  const t = useTranslations("sampleImages");

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {t("label")}
      </p>
      <div className="flex flex-wrap gap-2">
        {SAMPLES.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            title={t(
              s.id as
                | "indoor"
                | "street"
                | "portrait"
                | "landscape"
                | "object"
                | "street1"
                | "street2"
                | "interieur1"
                | "interieur2",
            )}
            className={cn(
              "overflow-hidden rounded-md border-2 transition-all",
              selected === s.id
                ? "border-primary"
                : "border-transparent hover:border-border",
            )}
          >
            <Image
              src={s.src}
              alt={t(
                s.id as
                  | "indoor"
                  | "street"
                  | "portrait"
                  | "landscape"
                  | "object"
                  | "street1"
                  | "street2"
                  | "interieur1"
                  | "interieur2",
              )}
              width={80}
              height={60}
              className="h-[60px] w-[80px] object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
