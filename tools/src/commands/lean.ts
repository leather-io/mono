import type { Command } from 'commander';
import { mkdtempSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import path from 'node:path';

import { runCommand } from '../ci/exec.js';
import { installElan } from '../lean/install-elan.js';

async function downloadBytes(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed with status ${response.status}: ${url}`);
  return new Uint8Array(await response.arrayBuffer());
}

async function runInstallElan(): Promise<void> {
  const binDir = await installElan({
    platform: process.platform,
    arch: process.arch,
    tempDir: mkdtempSync(path.join(process.env.RUNNER_TEMP ?? tmpdir(), 'elan-')),
    homeDir: homedir(),
    githubPathFile: process.env.GITHUB_PATH,
    download: downloadBytes,
    run: runCommand,
  });
  console.log(`lean: installed elan into ${binDir}`);
}

export function registerLeanCommands(program: Command): void {
  const lean = program
    .command('lean')
    .description('Lean toolchain for the proofs and oracle in the top-level lean directory');

  lean
    .command('install-elan')
    .description(
      'Download the pinned elan release, verify its checksum, install it and add it to the workflow path'
    )
    .action(runInstallElan);
}
