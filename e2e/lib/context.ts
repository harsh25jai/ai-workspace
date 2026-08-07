import fs from 'fs-extra';
import path from 'path';

export interface E2EContext {
  /** Directory containing the tester (repo root in dev, releases/ when bundled). */
  testerRoot: string;
  fixturesRoot: string;
  baselinesRoot: string;
  reportsRoot: string;
  bundled: boolean;
}

const BUNDLED_NAMES = new Set([
  'ai-workspace-e2e-tester.js',
  'index.js',
]);

export function isBundledTester(entryFile: string = __filename): boolean {
  return BUNDLED_NAMES.has(path.basename(entryFile));
}

/**
 * Resolve E2E paths for dev (ts-node) or bundled (releases/ai-workspace-e2e-tester.js).
 */
export function resolveE2EContext(options: {
  entryFile?: string;
  fixturesRoot?: string;
  outputDir?: string;
} = {}): E2EContext {
  const entryFile = options.entryFile ?? __filename;
  const bundled = isBundledTester(entryFile);
  const entryDir = path.dirname(entryFile);

  let testerRoot: string;
  let fixturesRoot: string;
  let baselinesRoot: string;
  let reportsRoot: string;

  if (bundled) {
    testerRoot = entryDir;
    const siblingFixtures = path.join(testerRoot, 'e2e-fixtures');
    fixturesRoot = options.fixturesRoot ?? (
      fs.existsSync(siblingFixtures) ? siblingFixtures : path.join(testerRoot, 'e2e-fixtures')
    );
    baselinesRoot = path.join(fixturesRoot, 'baselines');
    reportsRoot = options.outputDir ?? path.join(testerRoot, 'e2e-reports');
  } else {
    // e2e/lib/context.ts → repo root is two levels up from e2e/
    const e2eDir = path.resolve(entryDir, '..');
    testerRoot = path.resolve(e2eDir, '..');
    fixturesRoot = options.fixturesRoot ?? path.join(e2eDir, 'fixtures');
    baselinesRoot = path.join(fixturesRoot, 'baselines');
    reportsRoot = options.outputDir ?? path.join(e2eDir, 'reports');
  }

  return { testerRoot, fixturesRoot, baselinesRoot, reportsRoot, bundled };
}

export function resolveAiWorkspaceBundle(
  ctx: E2EContext,
  explicitPath?: string
): string {
  if (explicitPath) {
    return path.resolve(explicitPath);
  }
  const sibling = path.join(ctx.testerRoot, 'ai-workspace.js');
  if (fs.existsSync(sibling)) {
    return sibling;
  }
  const repoRelease = path.join(ctx.testerRoot, 'releases', 'ai-workspace.js');
  if (fs.existsSync(repoRelease)) {
    return repoRelease;
  }
  throw new Error(
    'ai-workspace bundle not found. Pass --ai-workspace <path> or place ai-workspace.js next to the tester.'
  );
}
