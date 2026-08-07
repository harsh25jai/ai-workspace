#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { resolveE2EContext, resolveAiWorkspaceBundle } from './lib/context';
import { runFixtureSuite } from './lib/fixtureSuite';
import { resolveAndValidateBundle } from './lib/runner';
import {
  buildCompatibilityMatrix,
  printConsoleSummary,
  writeReport,
} from './lib/reporter';
import {
  runAndValidateRepo,
  validateRepoArtifacts,
} from './lib/validateRepo';
import { E2EReport, FixtureManifestEntry, FixtureRunResult } from './lib/types';

const program = new Command();

program
  .name('ai-workspace-e2e-tester')
  .description('Validate AI Workspace artifacts and run release-quality E2E checks')
  .version('0.1.0-beta.1');

program
  .command('fixtures')
  .description('Run the built-in fixture matrix (CI release validation)')
  .option('--only <ids>', 'Comma-separated fixture ids')
  .option('--ai-workspace <path>', 'Path to ai-workspace.js bundle')
  .option('--fixtures-root <path>', 'Path to fixtures directory')
  .option('--output <dir>', 'Reports output directory')
  .option('--keep-workspaces', 'Keep temp workspaces after run')
  .option('--update-baselines', 'Update content baseline fingerprints')
  .action(async (opts: {
    only?: string;
    aiWorkspace?: string;
    fixturesRoot?: string;
    output?: string;
    keepWorkspaces?: boolean;
    updateBaselines?: boolean;
  }) => {
    const ctx = resolveE2EContext({
      entryFile: __filename,
      fixturesRoot: opts.fixturesRoot,
      outputDir: opts.output,
    });
    const bundlePath = resolveAndValidateBundle(ctx, opts.aiWorkspace);
    const onlyIds = opts.only?.split(',').filter(Boolean);
    const { exitCode } = await runFixtureSuite({
      ctx,
      bundlePath,
      onlyIds,
      keepWorkspaces: opts.keepWorkspaces,
      updateBaselines: opts.updateBaselines,
    });
    process.exit(exitCode);
  });

program
  .command('validate <repo>')
  .description('Validate AI workspace artifacts in an external repository')
  .option('--output <dir>', 'Write validation report to this directory')
  .option('--config <path>', 'JSON file with optional expectation overrides')
  .action((repo: string, opts: { output?: string; config?: string }) => {
    const ctx = resolveE2EContext({ entryFile: __filename, outputDir: opts.output });
    const expectations = opts.config ? fs.readJSONSync(path.resolve(opts.config)) : undefined;
    const result = validateRepoArtifacts({
      repoPath: repo,
      ctx,
      expectations,
    });
    printSingleResult(result);
    const report = singleRepoReport(ctx.testerRoot, result);
    const reportsDir = writeReport(ctx, report);
    console.log(`Report written to: ${reportsDir}`);
    process.exit(result.pass ? 0 : 1);
  });

program
  .command('run <repo>')
  .description('Run ai-workspace against a repository, then validate artifacts')
  .requiredOption('--ai-workspace <path>', 'Path to ai-workspace.js bundle')
  .option('--explain <file>', 'Source file for explain command')
  .option('--output <dir>', 'Write validation report to this directory')
  .option('--config <path>', 'JSON file with optional expectation overrides')
  .action(async (
    repo: string,
    opts: { aiWorkspace: string; explain?: string; output?: string; config?: string }
  ) => {
    const ctx = resolveE2EContext({ entryFile: __filename, outputDir: opts.output });
    const bundlePath = path.resolve(opts.aiWorkspace);
    const expectations: Partial<FixtureManifestEntry> = opts.config
      ? (fs.readJSONSync(path.resolve(opts.config)) as Partial<FixtureManifestEntry>)
      : {};
    if (opts.explain) {
      expectations.explainFile = opts.explain;
    }
    const result = await runAndValidateRepo({
      repoPath: repo,
      ctx,
      aiWorkspaceBundle: bundlePath,
      expectations,
      runExplain: opts.explain ?? null,
    });
    printSingleResult(result);
    const report = singleRepoReport(bundlePath, result);
    const reportsDir = writeReport(ctx, report);
    console.log(`Report written to: ${reportsDir}`);
    process.exit(result.pass ? 0 : 1);
  });

function singleRepoReport(bundlePath: string, result: FixtureRunResult): E2EReport {
  return {
    generatedAt: new Date().toISOString(),
    bundlePath,
    nodeVersion: process.version,
    totalDurationMs: result.durationMs,
    summary: {
      total: 1,
      passed: result.pass && result.actualVerdict === 'PASS' ? 1 : 0,
      partial: result.pass && result.actualVerdict === 'PARTIAL' ? 1 : 0,
      failed: result.pass ? 0 : 1,
    },
    results: [result],
    compatibilityMatrix: buildCompatibilityMatrix([result]),
  };
}

function printSingleResult(result: FixtureRunResult): void {
  const icon = result.pass ? (result.actualVerdict === 'PARTIAL' ? '⚠' : '✔') : '✘';
  console.log(`${icon} ${result.name}: ${result.actualVerdict} (quality ${result.quality.overallScore}/100)`);
  if (result.errors.length > 0) {
    console.log('Errors:');
    for (const err of result.errors) {
      console.log(`  - ${err}`);
    }
  }
  if (result.warnings.length > 0) {
    console.log(`Warnings: ${result.warnings.length} (see report for details)`);
  }
}

// Default: fixtures suite when invoked with no subcommand (backward compatible)
if (process.argv.length <= 2) {
  process.argv.push('fixtures');
}

program.parse();
