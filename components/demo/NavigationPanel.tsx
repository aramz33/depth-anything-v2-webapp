"use client";
import { useTranslations } from "next-intl";
import { type Transport, type SafetyAlert } from "@/lib/inference-api";

const ALERT_STYLES: Record<
  SafetyAlert["level"],
  { wrapper: string; dot: string }
> = {
  danger: {
    wrapper: "border-red-500/40 bg-red-950/40 text-red-200",
    dot: "bg-red-500",
  },
  warning: {
    wrapper: "border-orange-500/40 bg-orange-950/40 text-orange-200",
    dot: "bg-orange-400",
  },
  safe: {
    wrapper: "border-green-500/40 bg-green-950/40 text-green-200",
    dot: "bg-green-500",
  },
};

interface NavigationPanelProps {
  transport: Transport;
  speedKmh: number;
  speedMax: number;
  analyzing: boolean;
  safetyAlert: SafetyAlert | null;
  safetyError: string | null;
  depthMapLoading: boolean;
  onTransportChange: (mode: Transport) => void;
  onSpeedChange: (speed: number) => void;
  onAnalyze: () => void;
}

export function NavigationPanel({
  transport,
  speedKmh,
  speedMax,
  analyzing,
  safetyAlert,
  safetyError,
  depthMapLoading,
  onTransportChange,
  onSpeedChange,
  onAnalyze,
}: NavigationPanelProps) {
  const t = useTranslations("inferencePanel");
  const alertStyle = safetyAlert ? ALERT_STYLES[safetyAlert.level] : null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <p className="text-sm font-semibold">{t("safetyTitle")}</p>

      {/* Transport selector */}
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">{t("transportLabel")}</p>
        <div className="flex gap-2">
          {(["car", "bike", "walk"] as Transport[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onTransportChange(mode)}
              className={[
                "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                transport === mode
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-accent",
              ].join(" ")}
            >
              {t(
                mode === "car"
                  ? "transportCar"
                  : mode === "bike"
                    ? "transportBike"
                    : "transportWalk",
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Speed slider */}
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">
          {t("speedLabel", { speed: speedKmh })}
        </p>
        <input
          type="range"
          min={0}
          max={speedMax}
          value={speedKmh}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>{speedMax} km/h</span>
        </div>
      </div>

      {/* Analyze button */}
      <button
        onClick={onAnalyze}
        disabled={analyzing || depthMapLoading}
        className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
      >
        {analyzing && (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
        )}
        {analyzing ? t("analyzing") : t("analyzeButton")}
      </button>

      {safetyError && (
        <p className="text-sm text-destructive">{safetyError}</p>
      )}
      {safetyAlert && alertStyle && (
        <div
          className={[
            "flex items-start gap-3 rounded-lg border p-3 text-sm",
            alertStyle.wrapper,
          ].join(" ")}
        >
          <span
            className={[
              "mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full",
              alertStyle.dot,
            ].join(" ")}
          />
          <span>{safetyAlert.alert}</span>
        </div>
      )}
    </div>
  );
}
