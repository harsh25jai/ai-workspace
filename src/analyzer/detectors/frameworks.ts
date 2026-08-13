import { PackageManifestInfo } from '../types';

const COMMON_FRAMEWORKS = [
  'express', 'react', 'vue', 'next', 'nuxt', 'nestjs', 'svelte', 'angular', 'koa', 'fastify',
];

const HTTP_ADAPTERS = new Set(['express', 'fastify', 'koa']);

/** Primary framework → HTTP adapters owned by that stack (demoted from frameworks[]). */
const FRAMEWORK_ADAPTERS: Record<string, string[]> = {
  nestjs: ['express', 'fastify', 'koa'],
  angular: ['express'],
};

const SCOPED_PRIMARY: Array<{ prefix: string; framework: string; corePackage: string }> = [
  { prefix: '@nestjs/', framework: 'nestjs', corePackage: '@nestjs/core' },
  { prefix: '@angular/', framework: 'angular', corePackage: '@angular/core' },
  { prefix: '@remix-run/', framework: 'remix', corePackage: '@remix-run/node' },
  { prefix: '@sveltejs/', framework: 'svelte', corePackage: '@sveltejs/kit' },
];

export interface FrameworkDetection {
  frameworks: string[];
  httpAdapters: string[];
}

function demoteAdapters(
  frameworks: string[],
  httpAdapters: string[],
  allDeps: Record<string, string>
): { frameworks: string[]; httpAdapters: string[] } {
  const primary = frameworks.find((f) => FRAMEWORK_ADAPTERS[f]);
  if (!primary) return { frameworks, httpAdapters };

  const owned = new Set(FRAMEWORK_ADAPTERS[primary]);
  const nextFrameworks = frameworks.filter((f) => !owned.has(f));
  const nextAdapters = [...httpAdapters];

  for (const adapter of owned) {
    const inDeps = Boolean(allDeps[adapter]) || allDeps[`@${adapter}/core`];
    if (inDeps && !nextAdapters.includes(adapter)) nextAdapters.push(adapter);
  }
  if (allDeps['@nestjs/platform-express'] && !nextAdapters.includes('express')) {
    nextAdapters.push('express');
  }
  if (allDeps['@nestjs/platform-fastify'] && !nextAdapters.includes('fastify')) {
    nextAdapters.push('fastify');
  }

  return { frameworks: nextFrameworks, httpAdapters: nextAdapters };
}

export function detectFrameworks(allDeps: Record<string, string>): FrameworkDetection {
  const frameworks: string[] = [];
  const httpAdapters: string[] = [];

  for (const { prefix, framework, corePackage } of SCOPED_PRIMARY) {
    if (allDeps[corePackage] || Object.keys(allDeps).some((k) => k.startsWith(prefix))) {
      if (!frameworks.includes(framework)) frameworks.push(framework);
    }
  }

  for (const fw of COMMON_FRAMEWORKS) {
    if (SCOPED_PRIMARY.some((s) => s.framework === fw)) continue;
    const hasDep = Boolean(allDeps[fw] || allDeps[`@${fw}/core`]);
    if (hasDep && !frameworks.includes(fw)) frameworks.push(fw);
  }

  return demoteAdapters(frameworks, httpAdapters, allDeps);
}

export function mergeDepsFromManifests(manifests: (PackageManifestInfo | null)[]): Record<string, string> {
  const merged: Record<string, string> = {};
  for (const m of manifests) {
    if (m) Object.assign(merged, m.allDeps);
  }
  return merged;
}
