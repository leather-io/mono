import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { type CommandRunner, runAndEcho, runCommand } from '../ci/exec.js';
import { allowedPathsDescription, changedPaths, refusedPaths, treeSnapshot } from './git.js';
import { readStatus } from './status.js';

interface VerifyOptions {
  readonly root: string;
  readonly statusFile: string;
  readonly reportFile?: string;
  readonly run?: CommandRunner;
  log?(line: string): void;
}

type VerifyResult =
  | { readonly passed: true; readonly skipped?: boolean; readonly message: string }
  | { readonly passed: false; readonly message: string; readonly details: string };

const formatCommand: readonly string[] = ['format'];
const gateCommands: readonly (readonly string[])[] = [
  ['syncpack:lint'],
  ['lint:filenames'],
  ['lint'],
  ['typecheck'],
  ['knip'],
  ['--filter', '@leather.io/extension', 'lint:unused-exports'],
  ['turbo', 'run', 'build', '--filter={./packages/*}[HEAD]'],
  ['lint:deps'],
  ['turbo', 'run', 'test:unit', '--filter=...[HEAD]'],
];
const reportTailLines = 150;

function tail(text: string): string {
  return text.trimEnd().split('\n').slice(-reportTailLines).join('\n');
}

function formatVerifyReport(result: {
  readonly message: string;
  readonly details: string;
}): string {
  const details = result.details.trim();
  return details
    ? `FAILED: ${result.message}\n\n\`\`\`\n${tail(details)}\n\`\`\`\n`
    : `FAILED: ${result.message}\n`;
}

const cleanInstallCommand: readonly string[] = ['install', '--frozen-lockfile', '--prefer-offline'];

function changesDependencies(paths: readonly string[]): boolean {
  return paths.some(file => file === 'pnpm-lock.yaml' || path.basename(file) === 'package.json');
}

function removeInstalledDependencies(root: string): void {
  const manifests = runCommand('git', ['ls-files', '--', 'package.json', '*/package.json'], {
    cwd: root,
  }).stdout;
  const dirs = new Set(['.', ...manifests.split('\n').filter(Boolean).map(path.dirname)]);
  for (const dir of dirs) {
    rmSync(path.join(root, dir, 'node_modules'), { recursive: true, force: true });
  }
}

function removeTypeScriptBuildInfo(root: string): void {
  const buildInfo = runCommand(
    'git',
    ['ls-files', '--others', '--ignored', '--exclude-standard', '--', '*.tsbuildinfo'],
    { cwd: root }
  ).stdout;
  for (const file of buildInfo.split('\n').filter(Boolean)) {
    rmSync(path.join(root, file), { force: true });
  }
}

function cleanInstall(root: string, run: CommandRunner): VerifyResult | null {
  removeInstalledDependencies(root);
  removeTypeScriptBuildInfo(root);
  const install = run('pnpm', cleanInstallCommand, { cwd: root });
  if (install.status === 0) return null;
  return {
    passed: false,
    message: `\`pnpm ${cleanInstallCommand.join(' ')}\` failed after removing node_modules`,
    details: install.stdout + install.stderr,
  };
}

function checkGate(root: string, run: CommandRunner, dependenciesChanged: boolean): VerifyResult {
  if (dependenciesChanged) {
    const failed = cleanInstall(root, run);
    if (failed) return failed;
  }
  const before = treeSnapshot(root);
  const format = run('pnpm', formatCommand, { cwd: root });
  if (format.status !== 0) {
    return {
      passed: false,
      message: '`pnpm format` failed',
      details: format.stdout + format.stderr,
    };
  }
  if (treeSnapshot(root) !== before) {
    const status = runCommand('git', ['status', '--short'], { cwd: root }).stdout;
    return {
      passed: false,
      message: 'pnpm format changed files the fixer left unformatted',
      details: status,
    };
  }
  for (const args of gateCommands) {
    const result = run('pnpm', args, { cwd: root });
    if (result.status !== 0) {
      return {
        passed: false,
        message: `\`pnpm ${args.join(' ')}\` failed`,
        details: result.stdout + result.stderr,
      };
    }
  }
  return { passed: true, message: 'the verification gate passed' };
}

export function verifyFix({
  root,
  statusFile,
  reportFile,
  run = runAndEcho,
  log = console.log,
}: VerifyOptions): VerifyResult {
  const result = evaluate(root, statusFile, run);
  if (reportFile && !result.passed) {
    mkdirSync(path.dirname(reportFile), { recursive: true });
    writeFileSync(reportFile, formatVerifyReport(result));
  }
  log(`verify-fix: ${result.message}`);
  return result;
}

function evaluate(root: string, statusFile: string, run: CommandRunner): VerifyResult {
  const status = readStatus(statusFile);
  if (!status.ok) {
    return {
      passed: false,
      message: `${path.relative(root, statusFile)} is not a valid fixer status`,
      details: status.problems.join('\n'),
    };
  }
  const changes = changedPaths(root);
  const refused = refusedPaths(changes.map(change => change.path));
  if (refused.length > 0) {
    return {
      passed: false,
      message: 'the fixer changed files it may not touch',
      details: `Only ${allowedPathsDescription} may change:\n${refused.join('\n')}`,
    };
  }
  if (
    changes.length === 0 &&
    (status.status.state === 'blocked' || status.status.handoff.length > 0)
  ) {
    return {
      passed: true,
      skipped: true,
      message: 'the fixer changed nothing it may change; skipping the verification gate',
    };
  }
  if (changes.length === 0) {
    return { passed: false, message: 'state is done but nothing changed', details: '' };
  }
  const gate = checkGate(root, run, changesDependencies(changes.map(change => change.path)));
  return gate.passed
    ? { passed: true, message: `${changes.length} changed files pass the verification gate` }
    : gate;
}
