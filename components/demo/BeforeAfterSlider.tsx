"use client"
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider"

interface Props {
  original: string
  colorized: string
}

export function BeforeAfterSlider({ original, colorized }: Props) {
  return (
    <div className="max-h-[60vh] overflow-hidden rounded-lg border border-border">
      <ReactCompareSlider
        itemOne={
          <ReactCompareSliderImage src={original} alt="Original image" />
        }
        itemTwo={
          <ReactCompareSliderImage src={colorized} alt="Depth map" />
        }
        style={{ width: "100%", height: "400px" }}
      />
      <div className="flex justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
        <span>← Original</span>
        <span>Depth map →</span>
      </div>
    </div>
  )
}
