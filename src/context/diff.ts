import { ScannerResult } from '../analyzer/repoScanner';

export interface ContextDiff {
  addedModules: string[];
  removedModules: string[];
  addedFrameworks: string[];
  removedFrameworks: string[];
  structureChanged: boolean;
}

export function diffContexts(previousContext: ScannerResult, newContext: ScannerResult): ContextDiff {
  const addedModules = newContext.modules.filter(m => !previousContext.modules.includes(m));
  const removedModules = previousContext.modules.filter(m => !newContext.modules.includes(m));
  
  const addedFrameworks = newContext.frameworks.filter(f => !previousContext.frameworks.includes(f));
  const removedFrameworks = previousContext.frameworks.filter(f => !newContext.frameworks.includes(f));
  
  const structureChanged = addedModules.length > 0 || removedModules.length > 0 || 
                           addedFrameworks.length > 0 || removedFrameworks.length > 0;

  return {
    addedModules,
    removedModules,
    addedFrameworks,
    removedFrameworks,
    structureChanged
  };
}
