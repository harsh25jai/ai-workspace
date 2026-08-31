import {
  DimensionScore,
  QualityDimension,
  QualityReport,
  ValidationIssue,
} from './types';

export const DIMENSION_WEIGHTS: Record<QualityDimension, number> = {
  reliability: 0.25,
  structure: 0.20,
  analysis: 0.20,
  consistency: 0.20,
  agentReadiness: 0.15,
};

export function scoreFromChecks(
  dimension: QualityDimension,
  passedChecks: number,
  totalChecks: number,
  warnings: ValidationIssue[] = []
): DimensionScore {
  const score = totalChecks === 0 ? 100 : Math.round((passedChecks / totalChecks) * 100);
  return {
    dimension,
    score,
    maxScore: 100,
    passedChecks,
    totalChecks,
    warnings,
  };
}

export function computeOverallScore(dimensions: DimensionScore[]): number {
  if (dimensions.length === 0) return 0;
  let weighted = 0;
  let totalWeight = 0;
  for (const dim of dimensions) {
    const weight = DIMENSION_WEIGHTS[dim.dimension];
    weighted += dim.score * weight;
    totalWeight += weight;
  }
  return totalWeight === 0 ? 0 : Math.round(weighted / totalWeight);
}

export function buildQualityReport(dimensions: DimensionScore[]): QualityReport {
  return {
    overallScore: computeOverallScore(dimensions),
    dimensions,
  };
}

export function emptyQualityReport(): QualityReport {
  const dimensions: QualityDimension[] = [
    'reliability',
    'structure',
    'analysis',
    'consistency',
    'agentReadiness',
  ];
  return buildQualityReport(
    dimensions.map((d) => scoreFromChecks(d, 0, 0, []))
  );
}
