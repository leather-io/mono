import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import {
  changedPaths,
  gitBlobSha,
  headSha,
  indexChanges,
  refusedPaths,
  repoRoot,
  treeEntry,
  treeSnapshot,
} from './git.js';
import { type TestRepo, binaryContent, createTestRepo } from './test/test-repo.js';

describe('refusedPaths', () => {
  test('allows apps, packages, tools and the lockfile and refuses everything else', () => {
    expect(
      refusedPaths([
        'apps/extension/a.ts',
        'packages/utils/b.ts',
        'tools/src/c.ts',
        'pnpm-lock.yaml',
        '.github/workflows/x.yml',
        'knip.json',
        'appsfake/a.ts',
        'packages/utils/pnpm-lock.yaml',
      ])
    ).toEqual(['.github/workflows/x.yml', 'knip.json', 'appsfake/a.ts']);
  });
});

describe('git helpers', () => {
  let repo: TestRepo;
  beforeEach(() => {
    repo = createTestRepo();
  });
  afterEach(() => repo.cleanup());

  test('find the repository root from a subdirectory and the HEAD commit', () => {
    expect(repoRoot(path.join(repo.root, 'apps/extension'))).toBe(repo.root);
    expect(headSha(repo.root)).toBe(repo.head);
  });

  test('list changed, added and deleted paths but not ignored ones', () => {
    repo.makeFix();
    repo.write('tmp/fix-issue/notes.md', 'ignored\n');
    expect(changedPaths(repo.root).sort((a, b) => a.path.localeCompare(b.path))).toEqual([
      { path: 'apps/extension/fee-row.spec.tsx', present: true },
      { path: 'apps/extension/fee-row.tsx', present: true },
      { path: 'apps/extension/old.ts', present: false },
      { path: 'packages/utils/icon.bin', present: true },
    ]);
  });

  test('hash content the way git hashes a blob', () => {
    repo.write('packages/utils/icon.bin', binaryContent);
    expect(gitBlobSha(binaryContent)).toBe(repo.git(['hash-object', 'packages/utils/icon.bin']));
  });

  test('change the tree snapshot on an edit and on a new file, and only then', () => {
    const clean = treeSnapshot(repo.root);
    expect(treeSnapshot(repo.root)).toBe(clean);
    repo.write('apps/extension/fee-row.tsx', 'export const feeRow = 3;\n');
    const edited = treeSnapshot(repo.root);
    expect(edited).not.toBe(clean);
    repo.write('apps/extension/new.ts', 'export const added = 1;\n');
    const added = treeSnapshot(repo.root);
    expect(added).not.toBe(edited);
    repo.write('apps/extension/new.ts', 'export const added = 2;\n');
    expect(treeSnapshot(repo.root)).not.toBe(added);
  });

  test('list what the staged tree changes against a commit, with modes and blobs', () => {
    repo.makeFix();
    repo.write('packages/utils/run.sh', 'echo changed\n', 0o755);
    expect(indexChanges(repo.root, repo.head)).toEqual([
      {
        path: 'apps/extension/fee-row.spec.tsx',
        mode: '100644',
        sha: gitBlobSha(Buffer.from('test("wraps", () => {});\n')),
        previousMode: '000000',
      },
      {
        path: 'apps/extension/fee-row.tsx',
        mode: '100644',
        sha: gitBlobSha(Buffer.from('export const feeRow = 2;\n')),
        previousMode: '100644',
      },
      { path: 'apps/extension/old.ts', mode: null, sha: null, previousMode: '100644' },
      {
        path: 'packages/utils/icon.bin',
        mode: '100644',
        sha: gitBlobSha(binaryContent),
        previousMode: '000000',
      },
      {
        path: 'packages/utils/run.sh',
        mode: '100755',
        sha: gitBlobSha(Buffer.from('echo changed\n')),
        previousMode: '100755',
      },
    ]);
    expect(indexChanges(repo.root, 'HEAD')).toHaveLength(5);
  });

  test('read the mode and blob a commit has at a path', () => {
    expect(treeEntry(repo.root, repo.head, 'packages/utils/run.sh')).toEqual({
      mode: '100755',
      sha: gitBlobSha(Buffer.from('echo run\n')),
    });
    expect(treeEntry(repo.root, repo.head, 'apps/extension/missing.ts')).toBeNull();
  });
});
