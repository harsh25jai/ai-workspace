import fs from 'fs-extra';
import path from 'path';
import { WorkspacePlugin } from '../plugins/plugin';
import { expressPlugin } from '../plugins/expressPlugin';
import { reactPlugin } from '../plugins/reactPlugin';
import { nodePlugin } from '../plugins/nodePlugin';

export interface ScannerResult {
  languages: string[];
  frameworks: string[];
  entrypoints: string[];
  modules: string[];
  patterns: string[];
  structure?: any;
}

const COMMON_FRAMEWORKS = [
  'express', 'react', 'vue', 'next', 'nuxt', 'nestjs', 'svelte', 'angular', 'koa', 'fastify'
];

export async function scanRepository(rootDir: string): Promise<ScannerResult> {
  const result: ScannerResult = {
    languages: [],
    frameworks: [],
    entrypoints: [],
    modules: [],
    patterns: []
  };

  // 0. Load .aiignore
  const ignorePatterns = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.ai']);
  const aiIgnorePath = path.join(rootDir, '.aiignore');
  if (fs.existsSync(aiIgnorePath)) {
    const ignoreContent = await fs.readFile(aiIgnorePath, 'utf8');
    ignoreContent.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#')).forEach(line => ignorePatterns.add(line));
  }

  // 1. Detect Frameworks via package.json
  const pkgPath = path.join(rootDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = await fs.readJSON(pkgPath);
      const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      
      for (const fw of COMMON_FRAMEWORKS) {
        if (allDeps[fw] || allDeps[`@${fw}/core`]) {
          result.frameworks.push(fw);
        }
      }

      if (allDeps['typescript']) result.languages.push('typescript');
      else result.languages.push('javascript'); // fallback assumption if JS project

    } catch (e) {
      console.warn('Failed to parse package.json');
    }
  }

  // 2. Scan src/ directory for modules and entrypoints
  const srcDir = path.join(rootDir, 'src');
  if (fs.existsSync(srcDir)) {
    const entries = await fs.readdir(srcDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (ignorePatterns.has(entry.name)) continue;

      if (entry.isDirectory()) {
        result.modules.push(entry.name);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        const name = path.basename(entry.name, ext);
        
        // entrypoints
        if (['index', 'main', 'app', 'server'].includes(name)) {
          result.entrypoints.push(`src/${entry.name}`);
        }
        
        // loose language detection if no package.json
        if (ext === '.ts' && !result.languages.includes('typescript')) result.languages.push('typescript');
        if (ext === '.js' && !result.languages.includes('javascript') && !result.languages.includes('typescript')) result.languages.push('javascript');
        if (ext === '.py' && !result.languages.includes('python')) result.languages.push('python');
        if (ext === '.cs' && !result.languages.includes('csharp')) result.languages.push('csharp');
      }
    }
  }

  // 3. Detect Patterns
  const hasControllers = result.modules.includes('controllers');
  const hasServices = result.modules.includes('services');
  const hasModels = result.modules.includes('models');
  const hasComponents = result.modules.includes('components');
  
  if (hasControllers && hasServices) {
    result.patterns.push('controller-service');
  }
  if (hasModels && hasControllers) {
    result.patterns.push('mvc');
  }
  if (hasComponents) {
    result.patterns.push('component-based-ui');
  }

  // 4. Run Plugins
  const plugins: WorkspacePlugin[] = [expressPlugin, reactPlugin, nodePlugin];
  
  for (const plugin of plugins) {
    const pResult = plugin.detect(result);
    // Merge plugin results safely avoiding duplicates
    pResult.skills.forEach(s => !result.patterns.includes(s) && result.patterns.push(s)); // mapping plugin skills largely as patterns in the context
    pResult.frameworks.forEach(f => !result.frameworks.includes(f) && result.frameworks.push(f));
    pResult.patterns.forEach(p => !result.patterns.includes(p) && result.patterns.push(p));
  }

  return result;
}
