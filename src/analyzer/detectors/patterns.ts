import { ScannerResult } from '../types';

export function detectStructuralPatterns(result: Pick<ScannerResult, 'modules' | 'frameworks'>): string[] {
  const patterns: string[] = [];
  const { modules } = result;

  if (modules.includes('controllers') && modules.includes('services')) {
    patterns.push('controller-service');
  }
  if (modules.includes('models') && modules.includes('controllers')) {
    patterns.push('mvc');
  }
  if (modules.includes('components')) {
    patterns.push('component-based-ui');
  }

  return patterns;
}
