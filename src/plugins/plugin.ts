import { ScannerResult } from '../analyzer/repoScanner';

export interface PluginResult {
  skills: string[];
  frameworks: string[];
  patterns: string[];
}

export interface WorkspacePlugin {
  name: string;
  detect(context: ScannerResult): PluginResult;
}
