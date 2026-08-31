import { WorkspacePlugin, PluginResult } from './plugin';
import { ScannerResult } from '../analyzer/repoScanner';

export const expressPlugin: WorkspacePlugin = {
  name: 'express-detector',
  detect(context: ScannerResult): PluginResult {
    const result: PluginResult = { skills: [], frameworks: [], patterns: [] };
    
    // Express could be detected via package.json framework dependencies
    if (context.frameworks.includes('express') && !context.frameworks.includes('nestjs')) {
      if (context.modules.includes('controllers') && context.modules.includes('routes')) {
        result.patterns.push('layered-routing');
      }
    }
    
    return result;
  }
};
