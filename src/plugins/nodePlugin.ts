import { WorkspacePlugin, PluginResult } from './plugin';
import { ScannerResult } from '../analyzer/repoScanner';

export const nodePlugin: WorkspacePlugin = {
  name: 'node-detector',
  detect(context: ScannerResult): PluginResult {
    const result: PluginResult = { skills: [], frameworks: [], patterns: [] };
    
    if (context.languages.includes('javascript') || context.languages.includes('typescript')) {
      // Very basic node detection heuristic based on JS/TS languages.
      // In a real scenario we'd check package.json 'engines', 'types/node', etc.
      // Assuming all our JS/TS repos run node for this simple plugin.
       if (!context.frameworks.includes('react') && !context.frameworks.includes('vue')) {
           result.skills.push('node-backend');
       }
    }
    
    return result;
  }
};
