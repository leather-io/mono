import type { Command } from 'commander';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { runCommand } from '../ci/exec.js';
import { kernelMutants } from '../kernel/kernel-mutants.js';
import { runMutationGate } from '../kernel/mutation-gate.js';
import { getMonorepoRoot } from '../utils/paths.js';

function runKernelMutationGate(): void {
  const root = getMonorepoRoot();
  const kernelDir = path.join(root, 'packages', 'utils');

  const { caught, survived, stale } = runMutationGate({
    mutants: kernelMutants,
    readFile(file) {
      return readFileSync(path.join(kernelDir, file), 'utf8');
    },
    writeFile(file, content) {
      writeFileSync(path.join(kernelDir, file), content);
    },
    testsPass(spec) {
      const result = runCommand('pnpm', ['--filter', '@leather.io/utils', 'test:unit', spec], {
        cwd: root,
      });
      return result.status === 0;
    },
    log(line) {
      console.log(line);
    },
  });

  console.log(`kernel: ${caught.length} of ${kernelMutants.length} deliberate breakages caught`);
  if (stale.length > 0)
    console.error(
      `kernel: ${stale.length} could not be applied because the code they target changed. Update tools/src/kernel/kernel-mutants.ts: ${stale.join(', ')}`
    );
  if (survived.length > 0)
    console.error(
      `kernel: the tests did not notice ${survived.length} deliberate breakages: ${survived.join(', ')}`
    );
  if (stale.length > 0 || survived.length > 0) process.exitCode = 1;
}

export function registerKernelCommands(program: Command): void {
  const kernel = program
    .command('kernel')
    .description('Checks for the building blocks in packages/utils/src/kernel');

  kernel
    .command('mutation-gate')
    .description(
      'Break the TypeScript kernel on purpose in each listed way and fail unless its tests notice every one'
    )
    .action(runKernelMutationGate);
}
