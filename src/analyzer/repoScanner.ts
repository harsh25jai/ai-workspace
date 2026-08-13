import fs from 'fs-extra';
import path from 'path';
import { WorkspacePlugin } from '../plugins/plugin';
import { expressPlugin } from '../plugins/expressPlugin';
import { reactPlugin } from '../plugins/reactPlugin';
import { nodePlugin } from '../plugins/nodePlugin';
import { nestjsPlugin } from '../plugins/nestjsPlugin';
import { ScannerResult } from './types';
import { readPackageManifest, collectWorkspaceDeps } from './detectors/packageManifest';
import { detectFrameworks } from './detectors/frameworks';
import { detectLayout, detectWorkspacePackages } from './detectors/layout';
import { detectEntrypoints } from './detectors/entrypoints';
import { detectModules } from './detectors/modules';
import { detectStructuralPatterns } from './detectors/patterns';

export type { ScannerResult, WorkspacePackage, RepoLayout, BootstrapInfo } from './types';

function loadIgnorePatterns(rootDir: string): Set<string> {
  const ignorePatterns = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.ctxstack', '.ai']);
  const aiIgnorePath = path.join(rootDir, '.aiignore');
  if (fs.existsSync(aiIgnorePath)) {
    const ignoreContent = fs.readFileSync(aiIgnorePath, 'utf8');
    ignoreContent.split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .forEach((line) => ignorePatterns.add(line));
  }
  return ignorePatterns;
}

import { listExistingSourceRoots } from './detectors/sourceRoots';

function detectLanguagesFromTree(rootDir: string, ignorePatterns: Set<string>, existing: string[]): string[] {
  const languages = [...existing];
  const exts = new Map<string, string>([
    ['.ts', 'typescript'],
    ['.tsx', 'typescript'],
    ['.js', 'javascript'],
    ['.jsx', 'javascript'],
    ['.py', 'python'],
    ['.cs', 'csharp'],
  ]);

  for (const rootName of listExistingSourceRoots(rootDir)) {
    const rootPath = path.join(rootDir, rootName);
    if (!fs.existsSync(rootPath)) continue;
    for (const entry of fs.readdirSync(rootPath, { withFileTypes: true })) {
      if (!entry.isFile() || ignorePatterns.has(entry.name)) continue;
      const lang = exts.get(path.extname(entry.name));
      if (lang && !languages.includes(lang)) languages.push(lang);
    }
  }
  return languages;
}

function resolveAnalysisDepth(
  entrypoints: string[],
  bootstrap: ScannerResult['bootstrap'],
  layout: ScannerResult['layout']
): 'full' | 'partial' {
  const rootAppEntry = entrypoints.some((ep) =>
    /^(src|apps\/[^/]+|app)\/(main|index|app|server|page)\.(ts|js|tsx|jsx|mjs|cjs)$/.test(ep) ||
    /^app\/(page|layout)\.(tsx|jsx|js)$/.test(ep)
  );
  if (rootAppEntry || (bootstrap?.main && !bootstrap.main.includes('node_modules'))) return 'full';
  if (layout?.type === 'monorepo') return 'partial';
  if (entrypoints.length > 0) return 'full';
  return 'partial';
}

function enrichBootstrap(
  bootstrap: NonNullable<ScannerResult['bootstrap']>,
  layout: ScannerResult['layout'],
  entrypoints: string[]
): ScannerResult['bootstrap'] {
  const hints = [...(bootstrap.hints || [])];
  if (entrypoints.length === 0 && layout?.type === 'monorepo') {
    hints.push('No single app entrypoint; inspect packages/ for package-level mains');
  }
  if (hints.length === 0) return bootstrap;
  return { ...bootstrap, hints };
}

export async function scanRepository(rootDir: string): Promise<ScannerResult> {
  const ignorePatterns = loadIgnorePatterns(rootDir);
  const manifest = readPackageManifest(rootDir);

  let allDeps = manifest?.allDeps || {};
  if (manifest?.workspaces) {
    allDeps = { ...allDeps, ...collectWorkspaceDeps(rootDir, manifest.workspaces) };
  }

  const { frameworks, httpAdapters } = detectFrameworks(allDeps);
  const layout = detectLayout(rootDir, manifest);
  const packages = manifest?.workspaces
    ? detectWorkspacePackages(rootDir, manifest.workspaces)
    : undefined;

  const { entrypoints, bootstrap: rawBootstrap } = detectEntrypoints(rootDir, manifest, ignorePatterns);
  const modules = detectModules(rootDir, ignorePatterns);

  let languages = manifest?.languages || [];
  languages = detectLanguagesFromTree(rootDir, ignorePatterns, languages);
  const hasSourceRoot = listExistingSourceRoots(rootDir).length > 0;
  if (languages.length === 0 && (manifest || hasSourceRoot)) {
    languages.push('javascript');
  }

  const result: ScannerResult = {
    version: 1,
    languages,
    frameworks,
    entrypoints,
    modules,
    patterns: detectStructuralPatterns({ modules, frameworks }),
    layout,
    packages: packages && packages.length > 0 ? packages : undefined,
    httpAdapters: httpAdapters.length > 0 ? httpAdapters : undefined,
    bootstrap: Object.keys(rawBootstrap).length > 0 ? rawBootstrap : undefined,
    analysisDepth: resolveAnalysisDepth(entrypoints, rawBootstrap, layout),
  };

  result.bootstrap = enrichBootstrap(result.bootstrap || {}, layout, entrypoints);

  const plugins: WorkspacePlugin[] = [nestjsPlugin, expressPlugin, reactPlugin, nodePlugin];
  for (const plugin of plugins) {
    const pResult = plugin.detect(result);
    pResult.skills.forEach((s) => !result.patterns.includes(s) && result.patterns.push(s));
    pResult.frameworks.forEach((f) => !result.frameworks.includes(f) && result.frameworks.push(f));
    pResult.patterns.forEach((p) => !result.patterns.includes(p) && result.patterns.push(p));
  }

  if (result.bootstrap && Object.keys(result.bootstrap).length === 0) {
    delete result.bootstrap;
  }

  return result;
}
