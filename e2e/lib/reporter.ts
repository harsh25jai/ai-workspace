import fs from 'fs-extra';
import path from 'path';
import {
  CompatibilityRow,
  E2EReport,
  FixtureManifest,
  FixtureManifestEntry,
  FixtureRunResult,
  QualityDimension,
  SuiteQualityReport,
} from './types';
import { DIMENSION_WEIGHTS } from './scoring';

export function writeReport(repoRoot: string, report: E2EReport): string {
  const reportsDir = path.join(repoRoot, 'e2e', 'reports', 'latest');
  fs.ensureDirSync(reportsDir);

  const summaryPath = path.join(reportsDir, 'summary.json');
  const matrixPath = path.join(reportsDir, 'compatibility-matrix.json');
  const fullPath = path.join(reportsDir, 'e2e-report.json');

  fs.writeJSONSync(fullPath, report, { spaces: 2 });
  fs.writeJSONSync(summaryPath, {
    generatedAt: report.generatedAt,
    bundlePath: report.bundlePath,
    nodeVersion: report.nodeVersion,
    totalDurationMs: report.totalDurationMs,
    summary: report.summary,
  }, { spaces: 2 });
  fs.writeJSONSync(matrixPath, {
    generatedAt: report.generatedAt,
    version: process.env.npm_package_version || 'unknown',
    rows: report.compatibilityMatrix,
  }, { spaces: 2 });

  for (const result of report.results) {
    fs.writeJSONSync(path.join(reportsDir, `${result.id}.json`), result, { spaces: 2 });
  }

  const qualityReport = buildSuiteQualityReport(report);
  fs.writeJSONSync(path.join(reportsDir, 'quality-report.json'), qualityReport, { spaces: 2 });

  writeMarkdownSummary(repoRoot, report, qualityReport);
  return reportsDir;
}

function buildSuiteQualityReport(report: E2EReport): SuiteQualityReport {
  const dimensions: QualityDimension[] = [
    'reliability',
    'structure',
    'analysis',
    'consistency',
    'agentReadiness',
  ];

  const dimensionTotals: Record<QualityDimension, { sum: number; count: number }> = {
    reliability: { sum: 0, count: 0 },
    structure: { sum: 0, count: 0 },
    analysis: { sum: 0, count: 0 },
    consistency: { sum: 0, count: 0 },
    agentReadiness: { sum: 0, count: 0 },
  };

  const fixtures = report.results.map((r) => {
    const dimScores: Record<QualityDimension, number> = {
      reliability: 0,
      structure: 0,
      analysis: 0,
      consistency: 0,
      agentReadiness: 0,
    };
    for (const d of r.quality.dimensions) {
      dimScores[d.dimension] = d.score;
      dimensionTotals[d.dimension].sum += d.score;
      dimensionTotals[d.dimension].count += 1;
    }
    return {
      id: r.id,
      name: r.name,
      overallScore: r.quality.overallScore,
      dimensions: dimScores,
    };
  });

  const dimensionAverages = {} as Record<QualityDimension, number>;
  for (const dim of dimensions) {
    const t = dimensionTotals[dim];
    dimensionAverages[dim] = t.count === 0 ? 0 : Math.round(t.sum / t.count);
  }

  const avgOverall =
    fixtures.length === 0
      ? 0
      : Math.round(fixtures.reduce((s, f) => s + f.overallScore, 0) / fixtures.length);

  return {
    generatedAt: report.generatedAt,
    averageOverallScore: avgOverall,
    dimensionAverages,
    fixtures,
  };
}

function writeMarkdownSummary(
  repoRoot: string,
  report: E2EReport,
  qualityReport: SuiteQualityReport
): void {
  const lines: string[] = [
    '# E2E Release Validation Report',
    '',
    `**Generated:** ${report.generatedAt}`,
    `**Bundle:** \`${report.bundlePath}\``,
    `**Node:** ${report.nodeVersion}`,
    `**Duration:** ${(report.totalDurationMs / 1000).toFixed(1)}s`,
    '',
    '## Summary',
    '',
    `| Metric | Count |`,
    `|--------|-------|`,
    `| Total  | ${report.summary.total} |`,
    `| Passed | ${report.summary.passed} |`,
    `| Partial | ${report.summary.partial} |`,
    `| Failed | ${report.summary.failed} |`,
    '',
    '## Compatibility Matrix',
    '',
    '| Repository | Stack | Frameworks | Status | Quality | Duration |',
    '|------------|-------|------------|--------|---------|----------|',
  ];

  for (const row of report.compatibilityMatrix) {
    lines.push(
      `| ${row.repository} | ${row.stack} | ${row.frameworkDetected || '—'} | **${row.status}** | ${row.overallQualityScore} | ${(row.durationMs / 1000).toFixed(1)}s |`
    );
  }

  lines.push('', '## Quality Dashboard', '');
  lines.push(`**Suite average:** ${qualityReport.averageOverallScore}/100`, '');
  lines.push('| Dimension | Average Score | Weight |');
  lines.push('|-----------|---------------|--------|');
  for (const dim of Object.keys(DIMENSION_WEIGHTS) as QualityDimension[]) {
    lines.push(
      `| ${dim} | ${qualityReport.dimensionAverages[dim]} | ${Math.round(DIMENSION_WEIGHTS[dim] * 100)}% |`
    );
  }

  lines.push('', '| Fixture | Overall | Reliability | Structure | Analysis | Consistency | Agent Ready |');
  lines.push('|---------|---------|-------------|-----------|----------|-------------|-------------|');
  for (const f of qualityReport.fixtures) {
    lines.push(
      `| ${f.name} | ${f.overallScore} | ${f.dimensions.reliability} | ${f.dimensions.structure} | ${f.dimensions.analysis} | ${f.dimensions.consistency} | ${f.dimensions.agentReadiness} |`
    );
  }

  lines.push('', '## Failures', '');
  const failures = report.results.filter(r => !r.pass);
  if (failures.length === 0) {
    lines.push('_None — all critical validations passed._');
  } else {
    for (const f of failures) {
      lines.push(`### ${f.name} (${f.id})`);
      for (const err of f.errors) {
        lines.push(`- ${err}`);
      }
      lines.push('');
    }
  }

  const mdPath = path.join(repoRoot, 'e2e', 'reports', 'latest', 'SUMMARY.md');
  fs.writeFileSync(mdPath, lines.join('\n'));
}

export function printConsoleSummary(report: E2EReport): void {
  console.log('\n══════════════════════════════════════════════════');
  console.log('  E2E Release Validation Summary');
  console.log('══════════════════════════════════════════════════');
  console.log(`  Bundle:   ${report.bundlePath}`);
  console.log(`  Duration: ${(report.totalDurationMs / 1000).toFixed(1)}s`);
  console.log(`  Results:  ${report.summary.passed} passed, ${report.summary.partial} partial, ${report.summary.failed} failed / ${report.summary.total} total`);
  console.log('──────────────────────────────────────────────────');

  for (const row of report.compatibilityMatrix) {
    const icon = row.status === 'PASS' ? '✔' : row.status === 'PARTIAL' ? '⚠' : '✘';
    console.log(
      `  ${icon} ${row.repository.padEnd(20)} ${row.status.padEnd(8)} Q:${String(row.overallQualityScore).padStart(3)} ${(row.durationMs / 1000).toFixed(1)}s`
    );
  }

  const lowest = [...report.results]
    .sort((a, b) => a.quality.overallScore - b.quality.overallScore)
    .slice(0, 3);
  if (lowest.length > 0) {
    console.log('──────────────────────────────────────────────────');
    console.log('  Lowest quality scores (informational):');
    for (const r of lowest) {
      console.log(`    ${r.name}: ${r.quality.overallScore}/100`);
    }
  }

  console.log('══════════════════════════════════════════════════\n');
}

export function buildCompatibilityMatrix(results: FixtureRunResult[]): CompatibilityRow[] {
  return results.map((r) => ({
    repository: r.name,
    stack: r.stack,
    frameworkDetected: r.frameworksDetected.join(', ') || 'none',
    commandsExecuted: r.commands.map(c => c.command.split(' ').slice(2).join(' ') || c.command),
    artifactsGenerated: r.artifacts.filter(a => a.exists && a.valid).map(a => a.path),
    warnings: r.warnings,
    status: r.actualVerdict,
    durationMs: r.durationMs,
    overallQualityScore: r.quality.overallScore,
  }));
}

export function loadManifest(repoRoot: string): FixtureManifest {
  const manifestPath = path.join(repoRoot, 'e2e', 'fixtures', 'manifest.json');
  return fs.readJSONSync(manifestPath) as FixtureManifest;
}

export function filterFixtures(
  manifest: FixtureManifest,
  onlyIds?: string[]
): FixtureManifestEntry[] {
  if (!onlyIds || onlyIds.length === 0) return manifest.fixtures;
  return manifest.fixtures.filter(f => onlyIds.includes(f.id));
}
