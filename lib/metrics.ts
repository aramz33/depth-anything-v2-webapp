// Single source of truth for benchmark results.
// Used by: ResultsSection component.
// Fill in KITTI/Ours row when evaluation run completes.

export interface MetricRow {
  dataset: string;
  model: string;
  absRel: number | null;
  rmse: number | null;
  log10: number | null;
  delta1: number | null;
  delta2: number | null;
  delta3: number | null;
}

export const METRICS: MetricRow[] = [
  {
    dataset: "NYU-Depth V2",
    model: "DAv2-Small (official)",
    absRel: 0.053,
    rmse: 0.232,
    log10: null,
    delta1: 0.992,
    delta2: null,
    delta3: null,
  },
  {
    dataset: "NYU-Depth V2",
    model: "Ours (ViT-Small)",
    absRel: 0.236,
    rmse: 0.778,
    log10: 0.094,
    delta1: 0.643,
    delta2: 0.881,
    delta3: 0.957,
  },
  {
    dataset: "KITTI",
    model: "DAv2-Small (official)",
    absRel: 0.076,
    rmse: 2.846,
    log10: null,
    delta1: 0.946,
    delta2: null,
    delta3: null,
  },
  {
    dataset: "KITTI",
    model: "Ours (ViT-Small)",
    absRel: null,
    rmse: null,
    log10: null,
    delta1: null,
    delta2: null,
    delta3: null,
  },
];

export const METRICS_NOTE =
  "NYU-Depth V2 (654 test images) and KITTI (652 test images). " +
  "Predictions scale-shift aligned to GT via closed-form least-squares before metric computation. " +
  "Teacher training stopped at epoch 20/30 due to compute budget; student distillation partially completed. " +
  "KITTI evaluation pending. Gap vs official DAv2-Small on NYU is expected for a partial reproduction.";
