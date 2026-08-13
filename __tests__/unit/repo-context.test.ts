import fs from 'fs-extra';
import path from 'path';
import { scanRepository } from '../../src/analyzer/repoScanner';
import { generateRepoContext } from '../../src/generators/repoContextGenerator';
import { createTempProject, cleanupTempProject } from '../helpers/project';

const NEST_MONOREPO_FIXTURE = path.join(__dirname, '..', '..', 'e2e', 'fixtures', 'nestjs');

describe('repo-context.json generation', () => {
  let tmpDir: string;

  afterEach(() => {
    if (tmpDir) cleanupTempProject(tmpDir);
  });

  it('detects NestJS framework monorepo without express/fastify as primary frameworks', async () => {
    tmpDir = fs.mkdtempSync(path.join(__dirname, '.tmp-nest-mono-'));
    fs.copySync(NEST_MONOREPO_FIXTURE, tmpDir);

    const result = await scanRepository(tmpDir);

    expect(result.frameworks).toContain('nestjs');
    expect(result.frameworks).not.toContain('express');
    expect(result.frameworks).not.toContain('fastify');
    expect(result.httpAdapters).toEqual(expect.arrayContaining(['express', 'fastify']));
    expect(result.layout?.type).toBe('monorepo');
    expect(result.packages?.length).toBeGreaterThanOrEqual(2);
    expect(result.packages?.map((p) => p.name)).toEqual(
      expect.arrayContaining(['@nestjs/core', '@nestjs/common'])
    );
    expect(result.analysisDepth).toBe('partial');
    expect(result.patterns).toEqual(
      expect.arrayContaining(['workspace-monorepo', 'adapter-composition', 'pluggable-http-adapter'])
    );
    expect(result.patterns).not.toContain('rest-api-pattern');
  });

  it('writes extended schema to repo-context.json', async () => {
    tmpDir = fs.mkdtempSync(path.join(__dirname, '.tmp-nest-write-'));
    fs.copySync(NEST_MONOREPO_FIXTURE, tmpDir);

    const scanned = await scanRepository(tmpDir);
    await generateRepoContext(tmpDir, scanned);
    const written = fs.readJSONSync(path.join(tmpDir, '.ctxstack', 'context', 'repo-context.json'));

    expect(written.version).toBe(1);
    expect(written.frameworks).toContain('nestjs');
    expect(written.layout.type).toBe('monorepo');
    expect(written.analysisDepth).toBe('partial');
    expect(Array.isArray(written.packages)).toBe(true);
  });

  it('detects Express API entrypoint and framework', async () => {
    tmpDir = createTempProject(__dirname, '.tmp-express-ctx-', {
      dependencies: { express: '^4', typescript: '^5' },
      modules: ['controllers', 'services'],
      entryFile: 'src/index.ts',
    });

    const result = await scanRepository(tmpDir);

    expect(result.frameworks).toContain('express');
    expect(result.entrypoints).toContain('src/index.ts');
    expect(result.modules).toEqual(expect.arrayContaining(['controllers', 'services']));
    expect(result.patterns).toContain('controller-service');
    expect(result.analysisDepth).toBe('full');
  });

  it('detects NestJS starter app with main.ts and app module', async () => {
    tmpDir = fs.mkdtempSync(path.join(__dirname, '.tmp-nest-starter-'));
    fs.writeJSONSync(path.join(tmpDir, 'package.json'), {
      name: 'nest-starter',
      dependencies: { '@nestjs/core': '^10', '@nestjs/platform-express': '^10', typescript: '^5' },
      scripts: { start: 'nest start' },
    });
    fs.ensureDirSync(path.join(tmpDir, 'src', 'app'));
    fs.writeFileSync(path.join(tmpDir, 'src', 'main.ts'), 'bootstrap();\n');
    fs.writeFileSync(path.join(tmpDir, 'src', 'app', 'app.module.ts'), '@Module({})\n');

    const result = await scanRepository(tmpDir);

    expect(result.frameworks).toEqual(['nestjs']);
    expect(result.frameworks).not.toContain('express');
    expect(result.httpAdapters).toContain('express');
    expect(result.entrypoints).toContain('src/main.ts');
    expect(result.modules).toContain('app');
    expect(result.analysisDepth).toBe('full');
    expect(result.bootstrap?.startScripts).toContain('start');
    expect(result.patterns).toContain('dependency-injection');
  });

  it('detects Next.js app router entrypoint via app/page.tsx', async () => {
    tmpDir = fs.mkdtempSync(path.join(__dirname, '.tmp-next-ctx-'));
    fs.writeJSONSync(path.join(tmpDir, 'package.json'), {
      name: 'next-app',
      dependencies: { next: '^14', react: '^18' },
    });
    fs.ensureDirSync(path.join(tmpDir, 'app'));
    fs.writeFileSync(path.join(tmpDir, 'app', 'page.tsx'), 'export default function Page() { return null; }\n');

    const result = await scanRepository(tmpDir);

    expect(result.frameworks).toContain('next');
    expect(result.entrypoints).toContain('app/page.tsx');
    expect(result.modules).toContain('app');
    expect(result.analysisDepth).toBe('full');
  });

  it('standalone Express app keeps express as primary framework', async () => {
    tmpDir = createTempProject(__dirname, '.tmp-express-only-', {
      dependencies: { express: '^4' },
      entryFile: 'src/index.ts',
    });
    const result = await scanRepository(tmpDir);
    expect(result.frameworks).toContain('express');
    expect(result.frameworks).not.toContain('nestjs');
    expect(result.httpAdapters || []).not.toContain('express');
  });

  it('demotes express to httpAdapters when @nestjs/core is present', async () => {
    tmpDir = fs.mkdtempSync(path.join(__dirname, '.tmp-adapter-'));
    fs.writeJSONSync(path.join(tmpDir, 'package.json'), {
      name: 'nest-with-express',
      dependencies: { '@nestjs/core': '^10', express: '^4' },
    });
    fs.ensureDirSync(path.join(tmpDir, 'src'));

    const result = await scanRepository(tmpDir);

    expect(result.frameworks).toContain('nestjs');
    expect(result.frameworks).not.toContain('express');
    expect(result.httpAdapters).toContain('express');
  });
});
