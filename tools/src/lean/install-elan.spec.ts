import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { installElan } from './install-elan.js';

const archive = new TextEncoder().encode('fake elan archive');
const archiveSha256 = createHash('sha256').update(archive).digest('hex');
const fileName = 'elan-test-target.tar.gz';
const release = {
  version: '9.9.9',
  assets: new Map([['linux-x64', { fileName, sha256: archiveSha256 }]]),
};
const expectedUrl = `https://github.com/leanprover/elan/releases/download/v9.9.9/${fileName}`;

interface RecordedCommand {
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
}

describe(installElan.name, () => {
  let dir: string;
  let tempDir: string;
  let homeDir: string;
  let githubPathFile: string;
  let commands: RecordedCommand[];
  let downloads: string[];
  let failingCommand: string | undefined;

  function run(command: string, args: readonly string[], { cwd }: { cwd: string }) {
    commands.push({ command, args, cwd });
    return path.basename(command) === failingCommand
      ? { status: 1, stdout: '', stderr: 'boom\n' }
      : { status: 0, stdout: '', stderr: '' };
  }

  function download(url: string) {
    downloads.push(url);
    return Promise.resolve(archive);
  }

  function options() {
    return {
      platform: 'linux',
      arch: 'x64',
      tempDir,
      homeDir,
      githubPathFile,
      download,
      run,
    };
  }

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'install-elan-'));
    tempDir = path.join(dir, 'temp');
    homeDir = path.join(dir, 'home');
    githubPathFile = path.join(dir, 'github-path');
    writeFileSync(githubPathFile, '/earlier/bin\n');
    commands = [];
    downloads = [];
    failingCommand = undefined;
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  test('downloads the pinned release asset for the platform', async () => {
    await installElan(options(), release);
    expect(downloads).toEqual([expectedUrl]);
  });

  test('saves the archive, extracts it, then runs the installer without a default toolchain', async () => {
    await installElan(options(), release);
    const archivePath = path.join(tempDir, fileName);
    expect(readFileSync(archivePath)).toEqual(Buffer.from(archive));
    expect(commands).toEqual([
      { command: 'tar', args: ['-xzf', archivePath, '-C', tempDir], cwd: tempDir },
      {
        command: path.join(tempDir, 'elan-init'),
        args: ['-y', '--no-modify-path', '--default-toolchain', 'none'],
        cwd: tempDir,
      },
    ]);
  });

  test('adds the elan bin directory to the workflow path and returns it', async () => {
    const binDir = await installElan(options(), release);
    expect(binDir).toBe(path.join(homeDir, '.elan', 'bin'));
    expect(readFileSync(githubPathFile, 'utf8')).toBe(`/earlier/bin\n${binDir}\n`);
  });

  test('installs outside a workflow run without writing a path file', async () => {
    await expect(installElan({ ...options(), githubPathFile: undefined }, release)).resolves.toBe(
      path.join(homeDir, '.elan', 'bin')
    );
    expect(commands).toHaveLength(2);
  });

  test('refuses an archive whose checksum differs and runs nothing from it', async () => {
    const tampered = {
      version: release.version,
      assets: new Map([['linux-x64', { fileName, sha256: 'a'.repeat(64) }]]),
    };
    await expect(installElan(options(), tampered)).rejects.toThrow(
      `elan archive checksum mismatch for ${expectedUrl}: expected ${'a'.repeat(64)}, got ${archiveSha256}`
    );
    expect(commands).toEqual([]);
    expect(existsSync(path.join(tempDir, fileName))).toBe(false);
    expect(readFileSync(githubPathFile, 'utf8')).toBe('/earlier/bin\n');
  });

  test('refuses a platform with no pinned asset before downloading anything', async () => {
    await expect(
      installElan({ ...options(), platform: 'darwin', arch: 'arm64' }, release)
    ).rejects.toThrow('No pinned elan 9.9.9 release for darwin-arm64.');
    expect(downloads).toEqual([]);
    expect(commands).toEqual([]);
  });

  test('stops before the installer when extraction fails', async () => {
    failingCommand = 'tar';
    await expect(installElan(options(), release)).rejects.toThrow(/^tar -xzf .* failed: boom$/);
    expect(commands).toHaveLength(1);
    expect(readFileSync(githubPathFile, 'utf8')).toBe('/earlier/bin\n');
  });

  test('does not touch the workflow path when the installer fails', async () => {
    failingCommand = 'elan-init';
    await expect(installElan(options(), release)).rejects.toThrow(/elan-init .* failed: boom$/);
    expect(readFileSync(githubPathFile, 'utf8')).toBe('/earlier/bin\n');
  });

  test('pins a linux x64 release by default', async () => {
    await expect(installElan(options())).rejects.toThrow(/checksum mismatch/);
    expect(downloads).toEqual([
      'https://github.com/leanprover/elan/releases/download/v4.4.0/elan-x86_64-unknown-linux-gnu.tar.gz',
    ]);
    expect(commands).toEqual([]);
  });
});
