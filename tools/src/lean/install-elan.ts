import { createHash } from 'node:crypto';
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import type { CommandRunner } from '../ci/exec.js';

interface ElanAsset {
  readonly fileName: string;
  readonly sha256: string;
}

interface ElanRelease {
  readonly version: string;
  readonly assets: ReadonlyMap<string, ElanAsset>;
}

const pinnedElanRelease: ElanRelease = {
  version: '4.4.0',
  assets: new Map([
    [
      'linux-x64',
      {
        fileName: 'elan-x86_64-unknown-linux-gnu.tar.gz',
        sha256: '0e8250aa2be86c7af929ade68db617af9edc8b9ccf6eaf5ece228250d0d032e2',
      },
    ],
  ]),
};

const elanInstallerArgs = ['-y', '--no-modify-path', '--default-toolchain', 'none'];

interface InstallElanOptions {
  readonly platform: string;
  readonly arch: string;
  readonly tempDir: string;
  readonly homeDir: string;
  readonly githubPathFile: string | undefined;
  readonly run: CommandRunner;
  download(url: string): Promise<Uint8Array>;
}

function runStep(run: CommandRunner, command: string, args: readonly string[], cwd: string): void {
  const result = run(command, args, { cwd });
  if (result.status !== 0)
    throw new Error(`${command} ${args.join(' ')} failed: ${result.stderr.trim()}`);
}

export async function installElan(
  { platform, arch, tempDir, homeDir, githubPathFile, download, run }: InstallElanOptions,
  release: ElanRelease = pinnedElanRelease
): Promise<string> {
  const target = `${platform}-${arch}`;
  const asset = release.assets.get(target);
  if (!asset)
    throw new Error(
      `No pinned elan ${release.version} release for ${target}. Install elan yourself: https://github.com/leanprover/elan`
    );

  const url = `https://github.com/leanprover/elan/releases/download/v${release.version}/${asset.fileName}`;
  const archive = await download(url);
  const sha256 = createHash('sha256').update(archive).digest('hex');
  if (sha256 !== asset.sha256)
    throw new Error(
      `elan archive checksum mismatch for ${url}: expected ${asset.sha256}, got ${sha256}`
    );

  mkdirSync(tempDir, { recursive: true });
  const archivePath = path.join(tempDir, asset.fileName);
  writeFileSync(archivePath, archive);
  runStep(run, 'tar', ['-xzf', archivePath, '-C', tempDir], tempDir);
  runStep(run, path.join(tempDir, 'elan-init'), elanInstallerArgs, tempDir);

  const binDir = path.join(homeDir, '.elan', 'bin');
  if (githubPathFile) appendFileSync(githubPathFile, `${binDir}\n`);
  return binDir;
}
