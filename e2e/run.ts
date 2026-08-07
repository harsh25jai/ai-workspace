import path from 'path';
import { resolveAndValidateBundle, runFixtureE2E } from './lib/runner';
import {
  buildCompatibilityMatrix,
  filterFixtures,
  loadManifest,
  printConsoleSummary,
  writeReport,
} from './lib/reporter';
import { cleanupWorkspaces, ensureWorkspacesRoot } from './lib/workspace';
import { E2EReport } from './lib/types';

async function main(): Promise<void> {
  const repoRoot = path.resolve(__dirname, '..');
  const onlyArg = process.argv.find(a => a.startsWith('--only='));
  const onlyIds = onlyArg ? onlyArg.replace('--only=', '').split(',').filter(Boolean) : undefined;
  const keepWorkspaces = process.argv.includes('--keep-workspaces');
  const updateBaselines = process.argv.includes('--update-baselines');

  const bundlePath = resolveAndValidateBundle(repoRoot);
  const manifest = loadManifest(repoRoot);
  const fixtures = filterFixtures(manifest, onlyIds);
  const workspacesRoot = ensureWorkspacesRoot(repoRoot);

  console.log(`E2E Release Validation`);
  console.log(`Bundle: ${bundlePath}`);
  console.log(`Fixtures: ${fixtures.map(f => f.id).join(', ')}`);
  console.log('');

  const start = Date.now();
  const results = [];

  for (const fixture of fixtures) {
    process.stdout.write(`→ ${fixture.name} (${fixture.id})... `);
    const result = await runFixtureE2E(repoRoot, bundlePath, fixture, workspacesRoot, {
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

  const failed = results.filter(r => !r.pass);
  const partial = results.filter(r => r.pass && r.actualVerdict === 'PARTIAL');
  const passed = results.filter(r => r.pass && r.actualVerdict === 'PASS');

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

  const reportsDir = writeReport(repoRoot, report);
  printConsoleSummary(report);
  console.log(`Reports written to: ${reportsDir}`);

  if (!keepWorkspaces) {
    cleanupWorkspaces(repoRoot);
  }

  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('E2E runner fatal error:', err);
  process.exit(1);
});
