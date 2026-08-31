import fs from 'fs-extra';
import path from 'path';
import { runCliOrThrow } from '../helpers/cli';
import { createWorkspaceFromFixture, cleanupWorkspaces, ensureWorkspacesRoot } from '../../e2e/lib/workspace';
import { parseRepoContext } from '../../e2e/lib/validators';
import { validateRepoContextQuality } from '../../e2e/lib/validators/repoContext';
import { loadManifest, filterFixtures } from '../../e2e/lib/reporter';

const FIXTURES_ROOT = path.resolve(__dirname, '..', '..', 'e2e', 'fixtures');
const WORKSPACES_ROOT = path.join(FIXTURES_ROOT, '..', '.workspaces');

describe('repo-context E2E (analyze only)', () => {
  beforeAll(() => {
    fs.ensureDirSync(WORKSPACES_ROOT);
  });

  afterAll(() => {
    if (fs.existsSync(WORKSPACES_ROOT)) fs.removeSync(WORKSPACES_ROOT);
  });

  it('nestjs monorepo fixture produces quality repo-context.json', () => {
    const manifest = loadManifest(FIXTURES_ROOT);
    const fixture = filterFixtures(manifest, ['nestjs'])[0];
    expect(fixture).toBeDefined();

    const workspaceDir = createWorkspaceFromFixture(
      path.join(FIXTURES_ROOT, 'nestjs'),
      WORKSPACES_ROOT,
      'nestjs-repo-context'
    );

    runCliOrThrow(['init'], workspaceDir);
    runCliOrThrow(['analyze'], workspaceDir);

    const context = parseRepoContext(workspaceDir) as import('../../e2e/lib/validators/repoContext').ExtendedRepoContext;
    const quality = validateRepoContextQuality(context, fixture!);

    expect(quality.errors.map((e) => e.message)).toEqual([]);
    expect(context?.frameworks).toContain('nestjs');
    expect(context?.frameworks).not.toContain('express');
    expect(context?.analysisDepth).toBe('partial');
    expect(context?.packages?.map((p) => p.name)).toEqual(
      expect.arrayContaining(['@nestjs/core', '@nestjs/common'])
    );
  });
});
