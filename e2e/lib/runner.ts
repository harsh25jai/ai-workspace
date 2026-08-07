import fs from 'fs-extra';
import path from 'path';
import { assertBundleExists, runBundleCli, runBundleCliOrThrow } from './bundleCli';
import { E2EContext, resolveCtxstackBundle } from './context';
import {
  deriveVerdict,
  parseRepoContext,
  validateAllArtifacts,
  validateDetection,
} from './validators';
import { validateProductQuality } from './validators/index';
import { emptyQualityReport } from './scoring';
import { countSourceFiles, createWorkspaceFromFixture } from './workspace';
import {
  CommandResult,
  FixtureManifestEntry,
  FixtureRunResult,
} from './types';

function collectErrors(
  commands: CommandResult[],
  artifacts: ReturnType<typeof validateAllArtifacts>,
  detectionIssues: ReturnType<typeof validateDetection>
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const cmd of commands) {
    if (cmd.exitCode !== 0) {
      errors.push(`Command failed (exit ${cmd.exitCode}): ${cmd.command}`);
      if (cmd.stderr) errors.push(cmd.stderr.trim());
    }
  }

  for (const artifact of artifacts) {
    for (const issue of artifact.issues) {
      const msg = `[${artifact.path}] ${issue.message}`;
      if (issue.severity === 'error') errors.push(msg);
      else warnings.push(msg);
    }
  }

  for (const issue of detectionIssues) {
    const msg = `[detection] ${issue.message}`;
    if (issue.severity === 'error') errors.push(msg);
    else warnings.push(msg);
  }

  return { errors, warnings };
}

async function runFullWorkflow(
  bundlePath: string,
  workspaceDir: string,
  fixture: FixtureManifestEntry
): Promise<CommandResult[]> {
  const commands: CommandResult[] = [];

  commands.push(runBundleCliOrThrow(bundlePath, ['init'], workspaceDir));
  commands.push(runBundleCliOrThrow(bundlePath, ['analyze'], workspaceDir));
  commands.push(runBundleCliOrThrow(bundlePath, ['generate'], workspaceDir));
  commands.push(runBundleCliOrThrow(bundlePath, ['status'], workspaceDir));

  if (fixture.explainFile) {
    commands.push(runBundleCliOrThrow(bundlePath, ['explain', fixture.explainFile], workspaceDir));
  }

  return commands;
}

async function runSyncWorkflow(
  bundlePath: string,
  workspaceDir: string,
  commands: CommandResult[]
): Promise<void> {
  const syncModuleDir = path.join(workspaceDir, 'src', 'e2e-sync-module');
  fs.ensureDirSync(syncModuleDir);
  fs.writeFileSync(path.join(syncModuleDir, 'index.ts'), 'export const synced = true;\n');

  const syncResult = runBundleCli(bundlePath, ['sync'], workspaceDir);
  commands.push(syncResult);

  if (syncResult.exitCode !== 0) {
    throw new Error(`sync failed: ${syncResult.stderr}`);
  }

  const context = parseRepoContext(workspaceDir);
  if (!context?.modules.includes('e2e-sync-module')) {
    throw new Error('sync did not detect new module e2e-sync-module');
  }
}

async function runRegenerateWorkflow(
  bundlePath: string,
  workspaceDir: string,
  commands: CommandResult[]
): Promise<void> {
  const projectPath = path.join(workspaceDir, '.ctxstack', 'project.md');
  fs.writeFileSync(projectPath, '# corrupted by e2e test\n');

  const regenResult = runBundleCli(bundlePath, ['regenerate'], workspaceDir);
  commands.push(regenResult);

  if (regenResult.exitCode !== 0) {
    throw new Error(`regenerate failed: ${regenResult.stderr}`);
  }

  const content = fs.readFileSync(projectPath, 'utf8');
  if (content.includes('corrupted by e2e test')) {
    throw new Error('regenerate did not restore project.md');
  }
  if (!content.includes('Tech Stack')) {
    throw new Error('regenerate output missing expected sections');
  }
}

export async function runFixtureE2E(
  ctx: E2EContext,
  bundlePath: string,
  fixture: FixtureManifestEntry,
  workspacesRoot: string,
  options: { updateBaselines?: boolean } = {}
): Promise<FixtureRunResult> {
  const fixtureDir = path.join(ctx.fixturesRoot, fixture.id);
  const workspaceDir = createWorkspaceFromFixture(fixtureDir, workspacesRoot, fixture.id);
  const start = Date.now();
  const commands: CommandResult[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    if (!fs.existsSync(fixtureDir)) {
      throw new Error(`Fixture directory not found: ${fixtureDir}`);
    }

    commands.push(...await runFullWorkflow(bundlePath, workspaceDir, fixture));

    if (fixture.workflows.includes('sync')) {
      await runSyncWorkflow(bundlePath, workspaceDir, commands);
    }
    if (fixture.workflows.includes('regenerate')) {
      await runRegenerateWorkflow(bundlePath, workspaceDir, commands);
    }

    // Export last — regenerate/sync may overwrite .cursorrules via generateRules
    commands.push(runBundleCliOrThrow(bundlePath, ['export'], workspaceDir));

    const artifacts = validateAllArtifacts(workspaceDir);
    const context = parseRepoContext(workspaceDir);
    const detectionIssues = validateDetection(context, fixture);
    const collected = collectErrors(commands, artifacts, detectionIssues);
    errors.push(...collected.errors);
    warnings.push(...collected.warnings);

    const explainStdout = commands.find((c) => c.command.includes('explain'))?.stdout;
    const productQuality = validateProductQuality({
      workspaceDir,
      repoRoot: ctx.testerRoot,
      baselinesRoot: ctx.baselinesRoot,
      fixture,
      context,
      commands,
      artifacts,
      explainStdout,
      updateBaselines: options.updateBaselines,
    });

    for (const qw of productQuality.qualityWarnings) {
      warnings.push(`[quality:${qw.code}] ${qw.message}`);
    }

    const actualVerdict = deriveVerdict(fixture, errors, detectionIssues);
    const pass = actualVerdict !== 'FAIL';

    if (productQuality.quality.overallScore < 50 && fixture.verdict === 'PASS' && pass) {
      warnings.push(
        `[quality:LOW_SCORE] Overall quality score ${productQuality.quality.overallScore}/100 below advisory threshold`
      );
    }

    return {
      id: fixture.id,
      name: fixture.name,
      stack: fixture.stack,
      expectedVerdict: fixture.verdict,
      actualVerdict,
      pass,
      durationMs: Date.now() - start,
      commands,
      artifacts,
      frameworksDetected: context?.frameworks || [],
      modulesDetected: context?.modules || [],
      patternsDetected: context?.patterns || [],
      warnings,
      errors,
      filesScanned: countSourceFiles(workspaceDir),
      quality: productQuality.quality,
      explainValidation: productQuality.explainValidation,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(message);
    return {
      id: fixture.id,
      name: fixture.name,
      stack: fixture.stack,
      expectedVerdict: fixture.verdict,
      actualVerdict: 'FAIL',
      pass: false,
      durationMs: Date.now() - start,
      commands,
      artifacts: [],
      frameworksDetected: [],
      modulesDetected: [],
      patternsDetected: [],
      warnings,
      errors,
      filesScanned: countSourceFiles(workspaceDir),
      quality: emptyQualityReport(),
    };
  }
}

export function resolveAndValidateBundle(ctx: E2EContext, explicitPath?: string): string {
  const bundlePath = resolveCtxstackBundle(ctx, explicitPath);
  assertBundleExists(bundlePath);
  return bundlePath;
}
