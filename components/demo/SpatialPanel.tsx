"use client";
import { useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

interface SpatialQA {
  query: string;
  response: string;
}

interface SpatialPanelProps {
  spatialQuery: string;
  spatialHistory: SpatialQA[];
  spatialLoading: boolean;
  depthMapLoading: boolean;
  chips: string[];
  onQueryChange: (value: string) => void;
  onSubmit: (queryOverride?: string) => void;
}

export function SpatialPanel({
  spatialQuery,
  spatialHistory,
  spatialLoading,
  depthMapLoading,
  chips,
  onQueryChange,
  onSubmit,
}: SpatialPanelProps) {
  const t = useTranslations("inferencePanel");
  const spatialBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    spatialBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [spatialHistory, spatialLoading]);

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <p className="text-sm font-semibold">{t("spatialTitle")}</p>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip}
            onClick={() => onSubmit(chip)}
            disabled={spatialLoading}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-40"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Query input + button */}
      <div className="flex gap-2">
        <input
          type="text"
          value={spatialQuery}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
          disabled={spatialLoading}
          placeholder={t("spatialQueryPlaceholder")}
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary disabled:opacity-50"
        />
        <button
          onClick={() => onSubmit()}
          disabled={!spatialQuery.trim() || spatialLoading || depthMapLoading}
          className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-40"
        >
          {spatialLoading && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          )}
          {spatialLoading ? t("spatialAnalyzing") : t("spatialAnalyze")}
        </button>
      </div>

      {/* Scrollable Q&A history */}
      {spatialHistory.length > 0 && (
        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
          {spatialHistory.map((qa, i) => (
            <div key={i} className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Q : {qa.query}
              </p>
              <div className="rounded-lg bg-muted px-3 py-2 text-sm leading-relaxed">
                {qa.response}
              </div>
            </div>
          ))}
          {spatialLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              {t("spatialAnalyzing")}
            </div>
          )}
          <div ref={spatialBottomRef} />
        </div>
      )}
    </div>
  );
}
