import { WorkspacePlugin, PluginResult } from './plugin';
import { ScannerResult } from '../analyzer/types';

export const nestjsPlugin: WorkspacePlugin = {
  name: 'nestjs-detector',
  detect(context: ScannerResult): PluginResult {
    const result: PluginResult = { skills: [], frameworks: [], patterns: [] };

    if (!context.frameworks.includes('nestjs')) return result;

    if (context.layout?.type === 'monorepo') {
      result.patterns.push('nestjs-monorepo');
    } else {
      result.patterns.push('nestjs-modules');
    }
    result.patterns.push('dependency-injection');

    return result;
  },
};
