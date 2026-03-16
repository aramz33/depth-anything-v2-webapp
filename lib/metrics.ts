// Single source of truth for benchmark results.
// Fill in values once evaluation results are available.
// Used by: ResultsSection component and README.

export interface MetricRow {
  dataset: string
  model: string
  absRel: number
  rmse: number
  delta1: number
  delta2: number
  delta3: number
}

export const METRICS: MetricRow[] = [
  // TODO: fill in with actual benchmark results
  // Example:
  // {
  //   dataset: "NYU-Depth V2",
  //   model: "Ours (ViT-Small)",
  //   absRel: 0.08,
  //   rmse: 0.34,
  //   delta1: 0.92,
  //   delta2: 0.97,
  //   delta3: 0.99,
  // },
]

export const METRICS_NOTE =
  "Evaluated on NYU-Depth V2 test set. Lower is better for AbsRel and RMSE. Higher is better for δ thresholds."
