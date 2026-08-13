import { ScannerResult } from '../types';

type PatternContext = Pick<
  ScannerResult,
  'modules' | 'frameworks' | 'layout' | 'packages' | 'httpAdapters'
> & { conventions?: string[] };

const HTTP_FRAMEWORKS = new Set(['express', 'fastify', 'koa']);

export function detectStructuralPatterns(ctx: PatternContext): string[] {
  const patterns: string[] = [];
  const { modules, frameworks, layout, packages, httpAdapters, conventions = [] } = ctx;

  if (modules.includes('controllers') && modules.includes('services')) {
    patterns.push('controller-service');
  }
  if (modules.includes('models') && modules.includes('controllers')) {
    patterns.push('mvc');
  }
  if (modules.includes('components')) {
    patterns.push('component-based-ui');
  }
  if (modules.includes('controllers') && modules.includes('routes')) {
    patterns.push('layered-routing');
  }

  if (layout?.type === 'monorepo') {
    patterns.push('workspace-monorepo');
  }

  const adapterPkgs = (packages || []).filter((p) => p.role === 'adapter');
  const corePkgs = (packages || []).filter((p) => p.role === 'framework' || p.role === 'library');
  if (adapterPkgs.length > 0 && corePkgs.length > 0) {
    patterns.push('adapter-composition');
  }

  if (httpAdapters && httpAdapters.length > 0 && frameworks.length > 0) {
    patterns.push('pluggable-http-adapter');
  }

  if (frameworks.some((f) => HTTP_FRAMEWORKS.has(f))) {
    patterns.push('rest-api-pattern');
  }

  if (
    conventions.includes('decorated-modules') ||
    conventions.includes('provider-registration') ||
    modules.includes('providers')
  ) {
    patterns.push('dependency-injection');
  }

  return patterns;
}
