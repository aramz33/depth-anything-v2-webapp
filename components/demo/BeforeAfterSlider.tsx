"use client"
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider"
import { useTranslations } from "next-intl"

interface Props {
  original: string
  colorized: string
}

export function BeforeAfterSlider({ original, colorized }: Props) {
  const t = useTranslations("inferencePanel")

  return (
    <div className="max-h-[60vh] overflow-hidden rounded-lg border border-border">
      <ReactCompareSlider
        itemOne={
          <ReactCompareSliderImage src={original} alt={t("originalAlt")} />
        }
        itemTwo={
          <ReactCompareSliderImage src={colorized} alt={t("depthAlt")} />
        }
        style={{ width: "100%", height: "400px" }}
      />
      <div className="flex justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
        <span>{t("sliderLeft")}</span>
        <span>{t("sliderRight")}</span>
      </div>
    </div>
  )
}
