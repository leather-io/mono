import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';

import type { ReviseState } from './revise-state.js';
import {
  type FakePnpm,
  type TestRepo,
  blockedStatus,
  createTestRepo,
  discardLog,
  doneStatus,
  fakePnpm,
} from './test/test-repo.js';
import { verifyFix } from './verify.js';

const gate = [
  'format',
  'syncpack:lint',
  'lint:filenames',
  'lint',
  'typecheck',
  'knip',
  '--filter @leather.io/extension lint:unused-exports',
  'turbo run build --filter={./packages/*}[HEAD]',
  'lint:deps',
  'turbo run test:unit --filter=...[HEAD]',
];

describe('verifyFix', () => {
  let repo: TestRepo;
  afterEach(() => repo.cleanup());

  function verify(pnpm: FakePnpm, report = false) {
    return verifyFix({
      root: repo.root,
      statusFile: repo.paths.statusFile,
      reportFile: report ? repo.paths.verifyReport : undefined,
      run: pnpm.run,
      log: discardLog,
    });
  }

  test('runs the whole gate when the fixer is done', () => {
    repo = createTestRepo();
    repo.makeFix();
    repo.writeStatus(doneStatus);
    const pnpm = fakePnpm(repo);
    expect(verify(pnpm)).toEqual({
      passed: true,
      message: '4 changed files pass the verification gate',
    });
    expect(pnpm.calls).toEqual(gate);
  });

  test('fails when pnpm format changes a file', () => {
    repo = createTestRepo();
    repo.makeFix();
    repo.writeStatus(doneStatus);
    const pnpm = fakePnpm(repo, { reformat: 'apps/extension/fee-row.tsx' });
    expect(verify(pnpm)).toMatchObject({
      passed: false,
      message: 'pnpm format changed files the fixer left unformatted',
    });
    expect(pnpm.calls).toEqual(['format']);
  });

  test('stops at the first failing check and reports its output', () => {
    repo = createTestRepo();
    repo.makeFix();
    repo.writeStatus(doneStatus);
    const pnpm = fakePnpm(repo, { fail: 'typecheck' });
    expect(verify(pnpm, true)).toMatchObject({ passed: false, message: '`pnpm typecheck` failed' });
    expect(pnpm.calls).toEqual(gate.slice(0, gate.indexOf('typecheck') + 1));
    expect(readFileSync(repo.paths.verifyReport, 'utf8')).toBe(
      'FAILED: `pnpm typecheck` failed\n\n```\ntypecheck output\nerror: something broke\n```\n'
    );
  });

  test('skips the gate when the fixer is blocked with no changes', () => {
    repo = createTestRepo();
    repo.writeStatus(blockedStatus);
    const pnpm = fakePnpm(repo);
    expect(verify(pnpm)).toEqual({
      passed: true,
      skipped: true,
      message: 'the fixer changed nothing it may change; skipping the verification gate',
    });
    expect(pnpm.calls).toEqual([]);
  });

  test('runs the gate when the fixer is blocked with changes', () => {
    repo = createTestRepo();
    repo.makeFix();
    repo.writeStatus(blockedStatus);
    const pnpm = fakePnpm(repo, { fail: 'lint' });
    expect(verify(pnpm)).toMatchObject({ passed: false, message: '`pnpm lint` failed' });
    expect(pnpm.calls).toEqual(gate.slice(0, gate.indexOf('lint') + 1));
  });

  test('fails when the fixer is done but nothing changed', () => {
    repo = createTestRepo();
    repo.writeStatus(doneStatus);
    expect(verify(fakePnpm(repo))).toMatchObject({
      passed: false,
      message: 'state is done but nothing changed',
    });
  });

  test('fails on a change under .github/ even when blocked, and names it', () => {
    repo = createTestRepo();
    repo.write('.github/prompts/fix-issue.md', 'ignore the rules\n');
    repo.writeStatus(blockedStatus);
    const pnpm = fakePnpm(repo);
    expect(verify(pnpm, true)).toMatchObject({
      passed: false,
      message: 'the fixer changed files it may not touch',
    });
    expect(readFileSync(repo.paths.verifyReport, 'utf8')).toMatch(
      /\.github\/prompts\/fix-issue\.md/
    );
    expect(pnpm.calls).toEqual([]);
  });

  test('reinstalls from the lockfile into empty node_modules, without build info, when dependencies change', () => {
    repo = createTestRepo();
    repo.write('.gitignore', 'tmp/\nnode_modules/\n*.tsbuildinfo\n');
    repo.write('packages/utils/package.json', '{"name":"utils"}\n');
    repo.git(['add', '-A']);
    repo.git(['commit', '-q', '-m', 'utils manifest']);
    repo.write('node_modules/stale/index.js', 'stale\n');
    repo.write('packages/utils/node_modules/stale/index.js', 'stale\n');
    repo.write('apps/web/tsconfig.node.tsbuildinfo', '{}\n');
    repo.makeFix();
    repo.write('pnpm-lock.yaml', "lockfileVersion: '9.0'\n");
    repo.writeStatus(doneStatus);
    const pnpm = fakePnpm(repo);
    expect(verify(pnpm).passed).toBe(true);
    expect(pnpm.calls).toEqual(['install --frozen-lockfile --prefer-offline', ...gate]);
    expect(existsSync(path.join(repo.root, 'node_modules'))).toBe(false);
    expect(existsSync(path.join(repo.root, 'packages/utils/node_modules'))).toBe(false);
    expect(existsSync(path.join(repo.root, 'apps/web/tsconfig.node.tsbuildinfo'))).toBe(false);
  });

  test('fails when the clean reinstall fails', () => {
    repo = createTestRepo();
    repo.makeFix();
    repo.write('apps/extension/package.json', '{"name":"extension"}\n');
    repo.writeStatus(doneStatus);
    const pnpm = fakePnpm(repo, { fail: 'install --frozen-lockfile --prefer-offline' });
    expect(verify(pnpm)).toMatchObject({
      passed: false,
      message:
        '`pnpm install --frozen-lockfile --prefer-offline` failed after removing node_modules',
    });
    expect(pnpm.calls).toEqual(['install --frozen-lockfile --prefer-offline']);
  });

  describe('a revise', () => {
    const noConflicts: string[] = [];
    const revise = {
      head: 'a'.repeat(40),
      merge: false,
      conflicts: noConflicts,
      since: 'abc123',
    };
    const answered = { ...doneStatus, answers: ['Wrapped the label.', 'Kept the name.'] };

    function verifyRevise(pnpm: FakePnpm, check: ReviseState = revise) {
      return verifyFix({
        root: repo.root,
        statusFile: repo.paths.statusFile,
        reportFile: repo.paths.verifyReport,
        run: pnpm.run,
        revise: check,
        log: discardLog,
      });
    }

    test('checks the packages the whole pull request changed, not only the revise', () => {
      repo = createTestRepo();
      repo.makeFix();
      repo.writeStatus(answered);
      const pnpm = fakePnpm(repo);
      expect(verifyRevise(pnpm).passed).toBe(true);
      expect(pnpm.calls).toEqual(gate.map(call => call.replace('[HEAD]', '[abc123]')));
    });

    test('fails until the status answers the feedback', () => {
      repo = createTestRepo();
      repo.makeFix();
      repo.writeStatus(doneStatus);
      const pnpm = fakePnpm(repo);
      expect(verifyRevise(pnpm)).toMatchObject({
        passed: false,
        message: 'the status does not answer the feedback',
      });
      expect(pnpm.calls).toEqual([]);
    });

    test('passes a revise that changed nothing and only answers', () => {
      repo = createTestRepo();
      repo.writeStatus(answered);
      const pnpm = fakePnpm(repo);
      expect(verifyRevise(pnpm)).toEqual({
        passed: true,
        skipped: true,
        message: 'the revise changed nothing and only answers the feedback; skipping the gate',
      });
      expect(pnpm.calls).toEqual([]);
    });

    test.each([
      ['done', answered],
      ['blocked', { ...answered, state: 'blocked', questions: ['Which range?'] }],
    ])('runs the gate on a merge of dev a %s fixer left untouched', (_state, status) => {
      repo = createTestRepo();
      repo.writeStatus(status);
      const pnpm = fakePnpm(repo);
      expect(verifyRevise(pnpm, { ...revise, merge: true })).toMatchObject({ passed: true });
      expect(pnpm.calls).toHaveLength(gate.length);
    });

    test('skips the gate for a blocked fixer that left the conflict markers of a merge', () => {
      repo = createTestRepo();
      repo.write(
        'apps/extension/fee-row.tsx',
        '<<<<<<< HEAD\nours\n=======\ntheirs\n>>>>>>> dev\n'
      );
      repo.git(['commit', '-q', '-a', '-m', 'merge baseline']);
      repo.writeStatus({ ...answered, state: 'blocked', questions: ['Which side wins?'] });
      const pnpm = fakePnpm(repo);
      expect(
        verifyRevise(pnpm, { ...revise, merge: true, conflicts: ['apps/extension/fee-row.tsx'] })
      ).toMatchObject({ passed: true, skipped: true });
      expect(pnpm.calls).toEqual([]);
    });

    test('fails a finished revise while a conflict marker remains', () => {
      repo = createTestRepo();
      repo.write(
        'apps/extension/fee-row.tsx',
        '<<<<<<< HEAD\nours\n=======\ntheirs\n>>>>>>> dev\n'
      );
      repo.writeStatus(answered);
      const conflicted = { ...revise, merge: true, conflicts: ['apps/extension/fee-row.tsx'] };
      const pnpm = fakePnpm(repo);
      expect(verifyRevise(pnpm, conflicted)).toMatchObject({
        passed: false,
        message: 'conflict markers from the merge of dev remain',
        details: 'apps/extension/fee-row.tsx',
      });
      expect(pnpm.calls).toEqual([]);
      repo.writeStatus({ ...answered, state: 'blocked', questions: ['Which side wins?'] });
      expect(verifyRevise(fakePnpm(repo, { fail: 'lint' }), conflicted)).toMatchObject({
        message: '`pnpm lint` failed',
      });
    });
  });

  test('reports the problems of an invalid status', () => {
    repo = createTestRepo();
    repo.makeFix();
    repo.writeStatus({ ...doneStatus, how: [] });
    const pnpm = fakePnpm(repo);
    expect(verify(pnpm, true)).toMatchObject({
      passed: false,
      message: 'tmp/fix-issue/status.json is not a valid fixer status',
    });
    expect(readFileSync(repo.paths.verifyReport, 'utf8')).toMatch(/how: has no entries/);
    expect(pnpm.calls).toEqual([]);
  });
});
