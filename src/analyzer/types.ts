export interface WorkspacePackage {
  name: string;
  path: string;
  role?: string;
}

export interface RepoLayout {
  type: 'single-package' | 'monorepo';
  packageManager?: string;
  workspaces?: string[];
  sourceRoots?: string[];
}

export interface BootstrapInfo {
  main?: string;
  startScripts?: string[];
  hints?: string[];
}

export interface ScannerResult {
  languages: string[];
  frameworks: string[];
  entrypoints: string[];
  modules: string[];
  patterns: string[];
  version?: 1;
  layout?: RepoLayout;
  packages?: WorkspacePackage[];
  httpAdapters?: string[];
  bootstrap?: BootstrapInfo;
  analysisDepth?: 'full' | 'partial';
  structure?: unknown;
}

export interface PackageManifestInfo {
  languages: string[];
  allDeps: Record<string, string>;
  scripts: Record<string, string>;
  main?: string;
  bin?: string | Record<string, string>;
  workspaces?: string[];
}
