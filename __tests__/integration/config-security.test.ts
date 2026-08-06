import fs from 'fs-extra';
import path from 'path';
import { runCliOrThrow } from '../helpers/cli';
import { createTempProject, cleanupTempProject } from '../helpers/project';

/**
 * Regression BC1-02: API keys must not be persisted in config.json.
 */
describe('config security', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempProject(__dirname, '.tmp-config-sec-', {
      dependencies: {},
    });
  });

  afterEach(() => {
    cleanupTempProject(tmpDir);
  });

  it('does not persist API keys in config.json after init (REG-03)', () => {
    runCliOrThrow(['init'], tmpDir, {
      OPENAI_API_KEY: 'sk-test-should-not-persist',
      ANTHROPIC_API_KEY: 'sk-ant-test-should-not-persist',
    });

    const config = fs.readJSONSync(path.join(tmpDir, '.ai', 'config.json'));
    const raw = fs.readFileSync(path.join(tmpDir, '.ai', 'config.json'), 'utf8');

    expect(config.openaiKey).toBeUndefined();
    expect(config.anthropicKey).toBeUndefined();
    expect(raw).not.toContain('sk-test-should-not-persist');
    expect(raw).not.toContain('sk-ant-test-should-not-persist');
  });

  it('config.json contains provider field', () => {
    runCliOrThrow(['init'], tmpDir);
    const config = fs.readJSONSync(path.join(tmpDir, '.ai', 'config.json'));
    expect(config).toHaveProperty('provider');
  });
});
