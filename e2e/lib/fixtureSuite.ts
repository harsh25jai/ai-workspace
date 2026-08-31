import path from 'path';
import { E2EContext } from './context';
import { assertBundleExists } from './bundleCli';
import { runFixtureE2E } from './runner';
import {
  buildCompatibilityMatrix,
  filterFixtures,
  loadManifest,
  printConsoleSummary,
  writeReport,
} from './reporter';
import { cleanupWorkspaces, ensureWorkspacesRoot } from './workspace';
import { E2EReport } from './types';

export interface FixtureSuiteOptions {
  ctx: E2EContext;
  bundlePath: string;
  onlyIds?: string[];
  keepWorkspaces?: boolean;
  updateBaselines?: boolean;
}

export interface FixtureSuiteResult {
  report: E2EReport;
  reportsDir: string;
  exitCode: number;
}

export async function runFixtureSuite(options: FixtureSuiteOptions): Promise<FixtureSuiteResult> {
  const { ctx, bundlePath, onlyIds, keepWorkspaces = false, updateBaselines = false } = options;

  assertBundleExists(bundlePath);
  const manifest = loadManifest(ctx.fixturesRoot);
  const fixtures = filterFixtures(manifest, onlyIds);
  const workspacesRoot = ensureWorkspacesRoot(ctx);

  console.log('E2E Release Validation');
  console.log(`Bundle: ${bundlePath}`);
  console.log(`Fixtures: ${fixtures.map((f) => f.id).join(', ')}`);
  console.log('');

  const start = Date.now();
  const results = [];

  for (const fixture of fixtures) {
    process.stdout.write(`→ ${fixture.name} (${fixture.id})... `);
    const result = await runFixtureE2E(ctx, bundlePath, fixture, workspacesRoot, {
      updateBaselines,
    });
    results.push(result);
    const icon = result.pass ? (result.actualVerdict === 'PARTIAL' ? '⚠' : '✔') : '✘';
    console.log(`${icon} ${result.actualVerdict} (${(result.durationMs / 1000).toFixed(1)}s)`);
    if (!result.pass) {
      for (const err of result.errors.slice(0, 3)) {
        console.log(`    ${err}`);
      }
    }
  }

  const failed = results.filter((r) => !r.pass);
  const partial = results.filter((r) => r.pass && r.actualVerdict === 'PARTIAL');
  const passed = results.filter((r) => r.pass && r.actualVerdict === 'PASS');

  const report: E2EReport = {
    generatedAt: new Date().toISOString(),
    bundlePath,
    nodeVersion: process.version,
    totalDurationMs: Date.now() - start,
    summary: {
      total: results.length,
      passed: passed.length,
      partial: partial.length,
      failed: failed.length,
    },
    results,
    compatibilityMatrix: buildCompatibilityMatrix(results),
  };

  const reportsDir = writeReport(ctx, report);
  printConsoleSummary(report);
  console.log(`Reports written to: ${reportsDir}`);

  if (!keepWorkspaces) {
    cleanupWorkspaces(ctx);
  }

  return {
    report,
    reportsDir,
    exitCode: failed.length > 0 ? 1 : 0,
  };
}
