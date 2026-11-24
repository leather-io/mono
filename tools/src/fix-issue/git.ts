import { createHash } from 'node:crypto';
import { lstatSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { runCommand, runOrThrow } from './exec.js';

interface ChangedPath {
  readonly path: string;
  readonly present: boolean;
}

const allowedPrefixes = ['apps/', 'packages/', 'tools/'];
const allowedFiles = ['pnpm-lock.yaml'];

export const allowedPathsDescription =
  'apps/, packages/, tools/ and pnpm-lock.yaml (.github/ is never allowed)';

function isAllowedPath(file: string): boolean {
  return allowedFiles.includes(file) || allowedPrefixes.some(prefix => file.startsWith(prefix));
}

export function refusedPaths(files: readonly string[]): string[] {
  return files.filter(file => !isAllowedPath(file));
}

function splitNul(output: string): string[] {
  return output.split('\0').filter(entry => entry !== '');
}

function exists(file: string): boolean {
  try {
    lstatSync(file);
    return true;
  } catch {
    return false;
  }
}

export function repoRoot(cwd: string): string {
  return runOrThrow('git', ['rev-parse', '--show-toplevel'], { cwd }).trim();
}

export function headSha(root: string): string {
  return runOrThrow('git', ['rev-parse', 'HEAD'], { cwd: root }).trim();
}

export function changedPaths(root: string): ChangedPath[] {
  const status = runOrThrow(
    'git',
    ['status', '--porcelain=v1', '-z', '--untracked-files=all', '--no-renames'],
    { cwd: root }
  );
  return splitNul(status).flatMap((entry): ChangedPath[] => {
    const file = entry.slice(3);
    if (exists(path.join(root, file))) return [{ path: file, present: true }];
    const tracked = runCommand('git', ['cat-file', '-e', `HEAD:${file}`], { cwd: root });
    return tracked.status === 0 ? [{ path: file, present: false }] : [];
  });
}

function sha1(content: string | Buffer): string {
  return createHash('sha1').update(content).digest('hex');
}

export function gitBlobSha(content: Buffer): string {
  return sha1(Buffer.concat([Buffer.from(`blob ${content.length}\0`), content]));
}

export function treeSnapshot(root: string): string {
  const status = runOrThrow('git', ['status', '--porcelain=v1', '--untracked-files=all'], {
    cwd: root,
  });
  const diff = runOrThrow('git', ['diff', '--binary', 'HEAD'], { cwd: root });
  const untracked = splitNul(
    runOrThrow('git', ['ls-files', '--others', '--exclude-standard', '-z'], { cwd: root })
  ).map(file => `${file} ${sha1(readFileSync(path.join(root, file)))}`);
  return [status, sha1(diff), ...untracked].join('\n');
}

interface IndexChange {
  readonly path: string;
  readonly mode: string | null;
  readonly sha: string | null;
  readonly previousMode: string;
}

const absentSha = /^0+$/;

export function indexChanges(root: string, base: string): IndexChange[] {
  runOrThrow('git', ['add', '-A'], { cwd: root });
  const fields = splitNul(
    runOrThrow('git', ['diff', '--cached', '--raw', '--no-abbrev', '--no-renames', '-z', base], {
      cwd: root,
    })
  );
  const changes: IndexChange[] = [];
  for (let index = 0; index + 1 < fields.length; index += 2) {
    const [previousMode = '', mode = '', , sha = ''] = (fields[index] ?? '').slice(1).split(' ');
    const file = fields[index + 1] ?? '';
    const deleted = absentSha.test(mode);
    changes.push({
      path: file,
      mode: deleted ? null : mode,
      sha: deleted ? null : sha,
      previousMode,
    });
  }
  return changes;
}

interface TreeEntry {
  readonly mode: string;
  readonly sha: string;
}

export function treeEntry(root: string, commit: string, file: string): TreeEntry | null {
  const line = runCommand('git', ['ls-tree', commit, '--', file], { cwd: root }).stdout.trim();
  const [mode, , sha] = line.split('\t')[0]?.split(' ') ?? [];
  return mode && sha ? { mode, sha } : null;
}
