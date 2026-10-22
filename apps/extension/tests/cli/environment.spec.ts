import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  buildStampFileName,
  collectBuildInputFiles,
  hashFileList,
  listFilesRecursively,
  readBuildStamp,
  resolveBundledWorkspacePackages,
  writeBuildStamp,
} from './environment';

function makeTempDir() {
  return mkdtempSync(path.join(tmpdir(), 'verify-cli-'));
}

function writeFile(filePath: string, content: string) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
}

function writePackage(packageDir: string, name: string, dependencies: Record<string, string>) {
  writeFile(path.join(packageDir, 'package.json'), JSON.stringify({ name, dependencies }));
}

describe('hashFileList', () => {
  test('ignores the order the files are listed in', () => {
    const files = [
      { path: 'b.ts', hash: '2' },
      { path: 'a.ts', hash: '1' },
    ];
    expect(hashFileList(files)).toBe(hashFileList([...files].reverse()));
  });

  test('changes when a file hash or path changes', () => {
    const base = hashFileList([{ path: 'a.ts', hash: '1' }]);
    expect(hashFileList([{ path: 'a.ts', hash: '2' }])).not.toBe(base);
    expect(hashFileList([{ path: 'c.ts', hash: '1' }])).not.toBe(base);
  });
});

describe('listFilesRecursively', () => {
  test('lists nested files in sorted order and tolerates a missing directory', () => {
    const dir = makeTempDir();
    writeFile(path.join(dir, 'z.ts'), '');
    writeFile(path.join(dir, 'nested', 'a.ts'), '');
    expect(listFilesRecursively(dir)).toEqual([
      path.join(dir, 'nested', 'a.ts'),
      path.join(dir, 'z.ts'),
    ]);
    expect(listFilesRecursively(path.join(dir, 'missing'))).toEqual([]);
  });
});

describe('collectBuildInputFiles', () => {
  test('collects sources, root inputs, the lockfile and every package dist', () => {
    const repoRoot = makeTempDir();
    const extensionRoot = path.join(repoRoot, 'apps', 'extension');
    const uiDir = path.join(repoRoot, 'packages', 'ui');
    writeFile(path.join(extensionRoot, 'src', 'app', 'index.tsx'), '');
    writeFile(path.join(extensionRoot, 'tooling', 'build-metadata.ts'), '');
    writeFile(path.join(extensionRoot, 'index.html'), '');
    writeFile(path.join(extensionRoot, 'bundle-analysis.html'), '');
    writeFile(path.join(extensionRoot, 'package.json'), '{}');
    writeFile(path.join(extensionRoot, 'vite.config.ts'), '');
    writeFile(path.join(repoRoot, 'pnpm-lock.yaml'), '');
    writeFile(path.join(uiDir, 'dist-web', 'index.js'), '');
    writeFile(path.join(uiDir, 'src', 'index.ts'), '');
    expect(collectBuildInputFiles(extensionRoot, repoRoot, [uiDir])).toEqual([
      path.join(extensionRoot, 'index.html'),
      path.join(extensionRoot, 'vite.config.ts'),
      path.join(extensionRoot, 'package.json'),
      path.join(extensionRoot, 'src', 'app', 'index.tsx'),
      path.join(extensionRoot, 'tooling', 'build-metadata.ts'),
      path.join(repoRoot, 'pnpm-lock.yaml'),
      path.join(uiDir, 'dist-web', 'index.js'),
    ]);
  });
});

describe('resolveBundledWorkspacePackages', () => {
  test('follows workspace dependencies transitively and skips unknown packages', () => {
    const repoRoot = makeTempDir();
    const extensionRoot = path.join(repoRoot, 'apps', 'extension');
    const uiDir = path.join(repoRoot, 'packages', 'ui');
    const utilsDir = path.join(repoRoot, 'packages', 'utils');
    writePackage(extensionRoot, '@leather.io/extension', {
      '@leather.io/ui': 'workspace:*',
      react: '19.1.0',
    });
    writePackage(uiDir, '@leather.io/ui', {
      '@leather.io/utils': 'workspace:*',
      '@leather.io/unlisted': 'workspace:*',
    });
    writePackage(utilsDir, '@leather.io/utils', {});
    const workspacePackages = new Map([
      ['@leather.io/ui', uiDir],
      ['@leather.io/utils', utilsDir],
    ]);
    expect(resolveBundledWorkspacePackages(extensionRoot, workspacePackages)).toEqual([
      uiDir,
      utilsDir,
    ]);
  });
});

describe('readBuildStamp', () => {
  test('round-trips a written stamp', () => {
    const distDir = path.join(makeTempDir(), 'dist');
    const stamp = {
      hash: 'abc',
      builtAt: '2026-10-22T10:00:00.000Z',
      commit: 'def',
      mode: 'testing' as const,
    };
    writeBuildStamp(distDir, stamp);
    expect(readBuildStamp(distDir)).toEqual(stamp);
  });

  test('treats a missing or malformed stamp as absent', () => {
    const distDir = makeTempDir();
    expect(readBuildStamp(distDir)).toBeUndefined();
    writeFile(path.join(distDir, buildStampFileName), '{"hash": 1}');
    expect(readBuildStamp(distDir)).toBeUndefined();
  });
});
