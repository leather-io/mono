import { spawn } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const extensionRootUrl = new URL('../', import.meta.url);
const extensionRoot = fileURLToPath(extensionRootUrl);
const outputDirectory = fileURLToPath(new URL('dist', extensionRootUrl));
const mode = process.argv[2] ?? 'testing';
const pnpmExecutable = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const state = {
  activeBuild: undefined,
  building: false,
  pending: false,
  snapshot: new Map(),
  timer: undefined,
};
const watchPaths = [
  'src',
  'public',
  'tooling',
  'action-popup.html',
  'content-script.ts',
  'debug.html',
  'index.html',
  'inpage.ts',
  'manifest.config.ts',
  'popup.html',
  'postcss.config.cjs',
  'vite.config.ts',
].map(filePath => fileURLToPath(new URL(filePath, extensionRootUrl)));

function ensureDirectory(directory) {
  if (existsSync(directory) && !lstatSync(directory).isDirectory()) {
    rmSync(directory, { force: true });
  }
  mkdirSync(directory, { recursive: true });
}

function copyBuildOutput(sourceDirectory, targetDirectory) {
  ensureDirectory(targetDirectory);
  readdirSync(sourceDirectory, { withFileTypes: true }).forEach(entry => {
    const sourcePath = path.join(sourceDirectory, entry.name);
    const targetPath = path.join(targetDirectory, entry.name);
    if (entry.isDirectory()) {
      copyBuildOutput(sourcePath, targetPath);
      return;
    }
    if (existsSync(targetPath) && lstatSync(targetPath).isDirectory()) {
      rmSync(targetPath, { force: true, recursive: true });
    }
    const temporaryTargetPath = `${targetPath}.watch-${process.pid}`;
    copyFileSync(sourcePath, temporaryTargetPath);
    renameSync(temporaryTargetPath, targetPath);
  });
}

function removeStaleBuildOutput(sourceDirectory, targetDirectory) {
  const sourceEntries = new Set(readdirSync(sourceDirectory));
  readdirSync(targetDirectory, { withFileTypes: true }).forEach(entry => {
    const sourcePath = path.join(sourceDirectory, entry.name);
    const targetPath = path.join(targetDirectory, entry.name);
    if (!sourceEntries.has(entry.name)) {
      rmSync(targetPath, { force: true, recursive: true });
      return;
    }
    if (entry.isDirectory() && lstatSync(sourcePath).isDirectory()) {
      removeStaleBuildOutput(sourcePath, targetPath);
    }
  });
}

function synchronizeBuildOutput(sourceDirectory) {
  copyBuildOutput(sourceDirectory, outputDirectory);
  removeStaleBuildOutput(sourceDirectory, outputDirectory);
}

function runBuild() {
  state.building = true;
  state.pending = false;
  const buildOutputDirectory = mkdtempSync(path.join(tmpdir(), 'leather-extension-watch-'));
  const activeBuild = spawn(
    pnpmExecutable,
    ['exec', 'vite', 'build', '--mode', mode, '--outDir', buildOutputDirectory],
    {
      cwd: extensionRoot,
      env: {
        ...process.env,
        EXTENSION_WATCH_BUILD: 'true',
      },
      stdio: 'inherit',
    }
  );
  state.activeBuild = activeBuild;
  activeBuild.on('close', exitCode => {
    state.activeBuild = undefined;
    state.building = false;
    try {
      if (exitCode === 0) synchronizeBuildOutput(buildOutputDirectory);
      process.exitCode = exitCode === 0 ? 0 : 1;
    } catch (error) {
      const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
      process.stderr.write(`${message}\n`);
      process.exitCode = 1;
    } finally {
      rmSync(buildOutputDirectory, { force: true, recursive: true });
    }
    if (state.pending) runBuild();
  });
}

function queueBuild() {
  if (state.building) {
    state.pending = true;
    return;
  }
  if (state.timer) clearTimeout(state.timer);
  state.timer = setTimeout(runBuild, 300);
}

function collectFileState(filePath, snapshot) {
  if (!existsSync(filePath)) return;
  const stats = statSync(filePath);
  if (!stats.isDirectory()) {
    snapshot.set(filePath, `${stats.mtimeMs}:${stats.size}`);
    return;
  }
  readdirSync(filePath, { withFileTypes: true }).forEach(entry => {
    collectFileState(path.join(filePath, entry.name), snapshot);
  });
}

function createSnapshot() {
  const snapshot = new Map();
  watchPaths.forEach(filePath => collectFileState(filePath, snapshot));
  return snapshot;
}

function hasSnapshotChanged(previousSnapshot, nextSnapshot) {
  if (previousSnapshot.size !== nextSnapshot.size) return true;
  return [...nextSnapshot].some(
    ([filePath, fileState]) => previousSnapshot.get(filePath) !== fileState
  );
}

state.snapshot = createSnapshot();
const pollingInterval = setInterval(() => {
  const nextSnapshot = createSnapshot();
  if (hasSnapshotChanged(state.snapshot, nextSnapshot)) queueBuild();
  state.snapshot = nextSnapshot;
}, 1000);
process.on('SIGINT', () => {
  state.activeBuild?.kill('SIGINT');
  clearInterval(pollingInterval);
  process.exit();
});
runBuild();
