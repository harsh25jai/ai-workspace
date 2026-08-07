import { resolveE2EContext } from './lib/context';
import { runFixtureSuite } from './lib/fixtureSuite';
import { resolveAndValidateBundle } from './lib/runner';

async function main(): Promise<void> {
  const onlyArg = process.argv.find((a) => a.startsWith('--only='));
  const onlyIds = onlyArg ? onlyArg.replace('--only=', '').split(',').filter(Boolean) : undefined;
  const keepWorkspaces = process.argv.includes('--keep-workspaces');
  const updateBaselines = process.argv.includes('--update-baselines');

  const ctx = resolveE2EContext({ entryFile: __filename });
  const bundlePath = resolveAndValidateBundle(ctx);
  const { exitCode } = await runFixtureSuite({
    ctx,
    bundlePath,
    onlyIds,
    keepWorkspaces,
    updateBaselines,
  });
  process.exit(exitCode);
}

main().catch((err) => {
  console.error('E2E runner fatal error:', err);
  process.exit(1);
});
