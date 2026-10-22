import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { keys } from 'remeda';
import { z } from 'zod';

export const buildStampFileName = '.lt-verify.json';
export const buildLogFileName = 'build.log';
export const testBuildMode = 'testing';

const extensionPackageName = '@leather.io/extension';
const workspacePackageScope = '@leather.io/';
const devServerPort = 8080;
const devServerCommandMarker = 'vite --mode development';
const distDirPattern = /^dist(-[a-z]+)?$/;
const hashedRootFiles = ['manifest.config.ts', 'vite.config.ts', 'package.json', '.env'];
const hashedDirectories = ['src', 'tooling'];
const htmlExtension = '.html';
const excludedHtmlFiles = new Set(['bundle-analysis.html']);
const lockfileName = 'pnpm-lock.yaml';
const unknownCommit = 'unknown';
const launchDarklyKeyName = 'LAUNCH_DARKLY_KEY';
const envFileName = '.env';
const launchDarklyKeyLinePattern = /^\s*LAUNCH_DARKLY_KEY\s*=\s*\S+/;
const buildOutputBufferBytes = 64 * 1024 * 1024;

const buildStampSchema = z.object({
  hash: z.string(),
  builtAt: z.string(),
  commit: z.string(),
  mode: z.literal(testBuildMode),
});

export type BuildStamp = z.infer<typeof buildStampSchema>;

export interface HashedFile {
  path: string;
  hash: string;
}

export interface DevServerProcess {
  pid: number;
  reason: string;
}

export interface BuildResult {
  ok: boolean;
  exitCode: number | null;
}

const workspacePackagesSchema = z.array(z.object({ name: z.string(), path: z.string() }));

const packageManifestSchema = z.object({
  dependencies: z.record(z.string(), z.string()).optional(),
});

function parseJsonFile(filePath: string): unknown {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return undefined;
  }
}

export function hashFileList(files: readonly HashedFile[]): string {
  const hashesByPath = new Map(files.map(file => [file.path, file.hash]));
  const digest = createHash('sha256');
  for (const filePath of [...hashesByPath.keys()].sort()) {
    digest.update(`${filePath}\0${hashesByPath.get(filePath)}\n`);
  }
  return digest.digest('hex');
}

export function listFilesRecursively(dir: string): string[] {
  const files: string[] = [];
  function walk(current: string) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) walk(entryPath);
      else if (entry.isFile()) files.push(entryPath);
    }
  }
  if (existsSync(dir)) walk(dir);
  return files.sort();
}

function hashFile(filePath: string): string {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function listDistDirectories(packageDir: string): string[] {
  return readdirSync(packageDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && distDirPattern.test(entry.name))
    .map(entry => path.join(packageDir, entry.name));
}

export function collectBuildInputFiles(
  extensionRoot: string,
  repoRoot: string,
  bundledPackageDirs: readonly string[]
): string[] {
  const rootHtmlFiles = readdirSync(extensionRoot)
    .filter(name => name.endsWith(htmlExtension) && !excludedHtmlFiles.has(name))
    .map(name => path.join(extensionRoot, name));
  const rootFiles = hashedRootFiles
    .map(name => path.join(extensionRoot, name))
    .filter(filePath => existsSync(filePath));
  const directoryFiles = hashedDirectories.flatMap(name =>
    listFilesRecursively(path.join(extensionRoot, name))
  );
  const packageDistFiles = bundledPackageDirs.flatMap(packageDir =>
    listDistDirectories(packageDir).flatMap(distDir => listFilesRecursively(distDir))
  );
  return [
    ...rootHtmlFiles,
    ...rootFiles,
    ...directoryFiles,
    path.join(repoRoot, lockfileName),
    ...packageDistFiles,
  ];
}

export function computeBuildHash(repoRoot: string, files: readonly string[]): string {
  return hashFileList(
    files.map(filePath => ({
      path: path.relative(repoRoot, filePath).split(path.sep).join('/'),
      hash: hashFile(filePath),
    }))
  );
}

export function listWorkspacePackages(repoRoot: string): Map<string, string> {
  const output = execFileSync('pnpm', ['-r', 'list', '--json', '--depth', '-1'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  const packages = workspacePackagesSchema.parse(JSON.parse(output));
  return new Map(packages.map(workspacePackage => [workspacePackage.name, workspacePackage.path]));
}

function readWorkspaceDependencyNames(packageDir: string): string[] {
  const manifest = packageManifestSchema.safeParse(
    parseJsonFile(path.join(packageDir, 'package.json'))
  );
  if (!manifest.success) return [];
  return keys(manifest.data.dependencies ?? {}).filter(name =>
    name.startsWith(workspacePackageScope)
  );
}

export function resolveBundledWorkspacePackages(
  extensionRoot: string,
  workspacePackages: ReadonlyMap<string, string>
): string[] {
  const visited = new Set<string>();
  const queue = readWorkspaceDependencyNames(extensionRoot);
  const packageDirs: string[] = [];
  while (queue.length > 0) {
    const name = queue.shift();
    if (name === undefined || visited.has(name)) continue;
    visited.add(name);
    const packageDir = workspacePackages.get(name);
    if (packageDir === undefined) continue;
    packageDirs.push(packageDir);
    queue.push(...readWorkspaceDependencyNames(packageDir));
  }
  return packageDirs.sort();
}

export function readBuildStamp(distDir: string): BuildStamp | undefined {
  const parsed = buildStampSchema.safeParse(parseJsonFile(path.join(distDir, buildStampFileName)));
  if (!parsed.success) return undefined;
  return parsed.data;
}

export function writeBuildStamp(distDir: string, stamp: BuildStamp): void {
  mkdirSync(distDir, { recursive: true });
  writeFileSync(path.join(distDir, buildStampFileName), `${JSON.stringify(stamp, null, 2)}\n`);
}

export function readHeadCommit(repoRoot: string): string {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).trim();
  } catch {
    return unknownCommit;
  }
}

function runCommand(file: string, args: string[]): string | undefined {
  const result = spawnSync(file, args, { encoding: 'utf8' });
  if (result.error !== undefined || result.status !== 0) return undefined;
  return result.stdout;
}

export function findPortListener(port: number): DevServerProcess | undefined {
  const output = runCommand('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-Fp']);
  const pidLine = output?.split('\n').find(line => line.startsWith('p'));
  if (pidLine === undefined) return undefined;
  const pid = Number.parseInt(pidLine.slice(1), 10);
  if (Number.isNaN(pid)) return undefined;
  return { pid, reason: `listens on TCP ${port}` };
}

export function hasLaunchDarklyKey(extensionRoot: string): boolean {
  const fromEnvironment = process.env[launchDarklyKeyName];
  if (fromEnvironment !== undefined && fromEnvironment.length > 0) return true;
  const envFilePath = path.join(extensionRoot, envFileName);
  if (!existsSync(envFilePath)) return false;
  return readFileSync(envFilePath, 'utf8')
    .split('\n')
    .some(line => launchDarklyKeyLinePattern.test(line));
}

function readProcessCwd(pid: number): string | undefined {
  const output = runCommand('lsof', ['-a', '-p', String(pid), '-d', 'cwd', '-Fn']);
  return output
    ?.split('\n')
    .find(line => line.startsWith('n'))
    ?.slice(1);
}

function findViteDevProcess(worktreeRoot: string): DevServerProcess | undefined {
  const output = runCommand('ps', ['-axo', 'pid=,command=']);
  if (output === undefined) return undefined;
  for (const line of output.split('\n')) {
    if (!line.includes(devServerCommandMarker)) continue;
    const pid = Number.parseInt(line.trim(), 10);
    if (Number.isNaN(pid)) continue;
    const cwd = readProcessCwd(pid);
    if (cwd !== undefined && cwd.startsWith(worktreeRoot)) {
      return { pid, reason: `runs ${devServerCommandMarker} in this worktree` };
    }
  }
  return undefined;
}

export function detectDevServer(worktreeRoot: string): DevServerProcess | undefined {
  return findPortListener(devServerPort) ?? findViteDevProcess(worktreeRoot);
}

export function runTestBuild(extensionRoot: string, logPath: string): BuildResult {
  const result = spawnSync('pnpm', ['--filter', extensionPackageName, 'build:test'], {
    cwd: extensionRoot,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: buildOutputBufferBytes,
  });
  const failure = result.error === undefined ? '' : `\n${result.error.message}\n`;
  writeFileSync(logPath, `${result.stdout}${result.stderr}${failure}`);
  return { ok: result.error === undefined && result.status === 0, exitCode: result.status };
}
