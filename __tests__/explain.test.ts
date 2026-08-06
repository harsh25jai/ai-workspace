import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

const CLI = path.join(__dirname, '..', 'dist', 'cli', 'index.js');

describe('explain command', () => {
  it('explains a source file', () => {
    const output = execSync(`node "${CLI}" explain src/cli/index.ts`, {
      encoding: 'utf8',
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, AI_AGENT: 'false', CURSOR: 'false' },
    });
    expect(output).toContain('File Explanation');
    expect(output).toContain('src/cli/index.ts');
  });
});
