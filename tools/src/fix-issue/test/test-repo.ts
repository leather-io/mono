import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { type CommandRunner, runOrThrow } from '../exec.js';
import { type FixIssuePaths, fixIssuePaths } from '../paths.js';
import type { FixStatus } from '../status.js';

export interface TestRepo {
  readonly root: string;
  readonly paths: FixIssuePaths;
  readonly head: string;
  git(args: readonly string[]): string;
  write(file: string, content: string | Buffer, mode?: number): void;
  remove(file: string): void;
  writeStatus(status: unknown): void;
  makeFix(): void;
  cleanup(): void;
}

const identity = ['-c', 'user.name=spec', '-c', 'user.email=spec@example.com'];

export const doneStatus: FixStatus = {
  state: 'done',
  commit: 'fix(extension): keep the fee row visible on narrow popups',
  closes: [12],
  why: ['The fee row wrapped out of view below 360px.'],
  how: ['Let the row wrap its label instead of overflowing.'],
  tested: [
    'pnpm --filter @leather.io/extension test:unit',
    'Not verified: the E2E spec, it needs a built extension.',
  ],
  questions: [],
  screenshots: [],
  handoff: [],
  followUps: [],
  feedback: [],
};

export const blockedStatus: FixStatus = {
  ...doneStatus,
  state: 'blocked',
  how: [],
  tested: [],
  questions: [
    'Should the label truncate or wrap? Options: truncate with a tooltip, wrap onto two lines.',
  ],
};

export const binaryContent = Buffer.from([0, 1, 2, 255, 254, 0, 10]);

export function createTestRepo(): TestRepo {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'fix-issue-spec-')));
  function git(args: readonly string[]): string {
    return runOrThrow('git', [...identity, ...args], { cwd: root }).trim();
  }
  function write(file: string, content: string | Buffer, mode?: number): void {
    const full = path.join(root, file);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, content);
    if (mode !== undefined) chmodSync(full, mode);
  }
  write('.gitignore', 'tmp/\n');
  write('README.md', 'readme\n');
  write('apps/extension/fee-row.tsx', 'export const feeRow = 1;\n');
  write('apps/extension/old.ts', 'export const old = 1;\n');
  write('packages/utils/run.sh', 'echo run\n', 0o755);
  git(['init', '-q', '-b', 'dev']);
  git(['add', '-A']);
  git(['commit', '-q', '-m', 'base']);
  const paths = fixIssuePaths(root);
  mkdirSync(paths.workDir, { recursive: true });
  return {
    root,
    paths,
    head: git(['rev-parse', 'HEAD']),
    git,
    write,
    remove(file) {
      unlinkSync(path.join(root, file));
    },
    writeStatus(status) {
      write('tmp/fix-issue/status.json', `${JSON.stringify(status, null, 2)}\n`);
    },
    makeFix() {
      write('apps/extension/fee-row.tsx', 'export const feeRow = 2;\n');
      write('apps/extension/fee-row.spec.tsx', 'test("wraps", () => {});\n');
      write('packages/utils/icon.bin', binaryContent);
      unlinkSync(path.join(root, 'apps/extension/old.ts'));
    },
    cleanup() {
      rmSync(root, { recursive: true, force: true });
    },
  };
}

interface PullRequestBranch {
  readonly head: string;
  readonly dev: string;
}

export const pullRequestBranch = 'bot/fix-issue-12-777';
export const conflictingFile = 'apps/extension/fee-row.tsx';

export function createPullRequestBranch(
  repo: TestRepo,
  { conflict }: { readonly conflict: boolean }
): PullRequestBranch {
  repo.git(['checkout', '-q', '-b', pullRequestBranch]);
  repo.write(conflictingFile, 'export const feeRow = 2;\n');
  repo.git(['commit', '-q', '-a', '-m', 'fix(extension): keep the fee row visible']);
  const head = repo.git(['rev-parse', 'HEAD']);
  repo.git(['checkout', '-q', 'dev']);
  if (conflict) repo.write(conflictingFile, 'export const feeRow = 3;\n');
  else repo.write('README.md', 'newer readme\n');
  repo.git(['commit', '-q', '-a', '-m', 'dev moves on']);
  return { head, dev: repo.git(['rev-parse', 'HEAD']) };
}

export interface FakePnpm {
  readonly run: CommandRunner;
  readonly calls: string[];
}

export function fakePnpm(
  repo: TestRepo,
  { fail, reformat }: { fail?: string; reformat?: string } = {}
): FakePnpm {
  const calls: string[] = [];
  return {
    calls,
    run(_command, args) {
      const call = args.join(' ');
      calls.push(call);
      if (call === 'format' && reformat) repo.write(reformat, 'reformatted\n');
      return call === fail
        ? { status: 1, stdout: `${call} output\nerror: something broke\n`, stderr: '' }
        : { status: 0, stdout: '', stderr: '' };
    },
  };
}

interface LogSink {
  readonly lines: string[];
  log(line: string): void;
}

export function logSink(): LogSink {
  const lines: string[] = [];
  return {
    lines,
    log(line) {
      lines.push(line);
    },
  };
}

const discarded = logSink();

export function discardLog(line: string): void {
  discarded.log(line);
}
