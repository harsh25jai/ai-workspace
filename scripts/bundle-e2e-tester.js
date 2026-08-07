#!/usr/bin/env node
/**
 * Build standalone ctxstack-e2e-tester.js bundle + ship fixtures alongside it.
 */
const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const releasesDir = path.join(repoRoot, 'releases');
const e2eEntry = path.join(repoRoot, 'e2e', 'dist', 'cli.js');
const fixturesSrc = path.join(repoRoot, 'e2e', 'fixtures');
const fixturesDest = path.join(releasesDir, 'e2e-fixtures');

if (!fs.existsSync(e2eEntry)) {
  console.error(`E2E build output missing: ${e2eEntry}. Run tsc -p e2e/tsconfig.json first.`);
  process.exit(1);
}

fs.removeSync(fixturesDest);
fs.copySync(fixturesSrc, fixturesDest, { filter: (src) => !src.includes('.workspaces') });

const tmpOut = path.join(releasesDir, '.e2e-tester-build');
fs.removeSync(tmpOut);

execSync(`npx ncc build "${e2eEntry}" -o "${tmpOut}" -m`, {
  cwd: repoRoot,
  stdio: 'inherit',
});

fs.copySync(path.join(tmpOut, 'index.js'), path.join(releasesDir, 'ctxstack-e2e-tester.js'));
fs.removeSync(tmpOut);

console.log('Built releases/ctxstack-e2e-tester.js');
console.log('Copied fixtures to releases/e2e-fixtures/');
