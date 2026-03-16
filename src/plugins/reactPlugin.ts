import { WorkspacePlugin, PluginResult } from './plugin';
import { ScannerResult } from '../analyzer/repoScanner';

export const reactPlugin: WorkspacePlugin = {
  name: 'react-detector',
  detect(context: ScannerResult): PluginResult {
    const result: PluginResult = { skills: [], frameworks: [], patterns: [] };
    
    if (context.frameworks.includes('react')) {
      result.skills.push('component-based-ui');
      
      if (context.modules.includes('hooks') || context.modules.includes('components')) {
        result.patterns.push('react-components');
      }
    }
    
    return result;
  }
};
