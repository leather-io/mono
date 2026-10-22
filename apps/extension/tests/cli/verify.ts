import type { Page } from '@playwright/test';
import {
  type LaunchedExtension,
  disableAnimations,
  getInitialPage,
  launchExtensionContext,
} from '@tests/fixtures/launch-extension';
import { Command } from 'commander';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { consoleErrorAllowlist } from './console-allowlist';
import {
  buildLogFileName,
  collectBuildInputFiles,
  computeBuildHash,
  detectDevServer,
  listWorkspacePackages,
  readBuildStamp,
  readHeadCommit,
  resolveBundledWorkspacePackages,
  runTestBuild,
  testBuildMode,
  writeBuildStamp,
} from './environment';
import { captureAriaSnapshot } from './evidence/aria-evidence';
import {
  type ConsoleRecorder,
  createConsoleRecorder,
  findBlockingErrors,
  listPageErrors,
  summarizeConsole,
} from './evidence/console-evidence';
import { captureScreenshot } from './evidence/screenshot-evidence';
import { captureState } from './evidence/state-evidence';
import { openRoute, waitForReady } from './readiness';
import { establishSession } from './session';
import {
  type ArtifactName,
  type BuildSummary,
  type VerifySummary,
  decideVerdict,
  usageExitCode,
  verdictExitCodes,
  writeSummary,
} from './summary';
import { VerifyEnvironmentError, VerifyUsageError } from './verify-errors';
import {
  type VerifyPlan,
  consoleLevels,
  defaultConsoleLevel,
  defaultNetworkId,
  defaultRoute,
  defaultSessionMode,
  defaultShotMode,
  defaultStateSlices,
  defaultTimeoutMs,
  parseVerifyOptions,
  sessionModes,
  verifyOutputDirName,
} from './verify-options';

const extensionRoot = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const repoRoot = path.resolve(extensionRoot, '../..');
const distDir = path.join(extensionRoot, 'dist');

const screenshotFileName = 'screenshot.png';
const ariaFileName = 'aria.txt';
const consoleFileName = 'console.jsonl';
const stateFileName = 'state.json';
const shortHashLength = 8;
const argumentSeparator = '--';

interface RunState {
  plan: VerifyPlan;
  startedAt: number;
  recorder: ConsoleRecorder;
  artifacts: Partial<Record<ArtifactName, string>>;
  build: BuildSummary | null;
  readyMet: boolean;
  afterMs: number | null;
  state: Record<string, unknown>;
  error?: string;
}

function report(line: string) {
  process.stderr.write(`${line}\n`);
}

function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return `unexpected error ${JSON.stringify(error)}`;
}

function shortHash(hash: string) {
  return hash.slice(0, shortHashLength);
}

function collectRepeatable(value: string, previous: string[]) {
  return [...previous, value];
}

function buildProgram() {
  return new Command('verify')
    .description(
      'Launch the built extension, establish a session, open a route and capture evidence'
    )
    .requiredOption(
      '--ready <target>',
      'data-testid or SomeSelectors.Member that marks the screen as ready'
    )
    .option(
      '--route <path>',
      `hash route to open once the session exists (default: ${defaultRoute})`
    )
    .option(
      '--param <name=value>',
      'substitute :name in the route (repeatable)',
      collectRepeatable,
      []
    )
    .option('--session <mode>', `${sessionModes.join(' | ')} (default: ${defaultSessionMode})`)
    .option(
      '--network <id>',
      `current network id in the seeded state (default: ${defaultNetworkId})`
    )
    .option('--shot <mode>', `viewport | full | testid:<id> | none (default: ${defaultShotMode})`)
    .option(
      '--console <level>',
      `minimum console level recorded, errors always are: ${consoleLevels.join(' | ')} (default: ${defaultConsoleLevel})`
    )
    .option(
      '--allow-console-errors',
      'downgrade console and page errors from a failure to a warning'
    )
    .option(
      '--state <slices>',
      `persisted slices to capture, comma-separated or all (default: ${defaultStateSlices})`
    )
    .option('--out <dir>', `output directory (default: ${verifyOutputDirName}/<timestamp>-<route>)`)
    .option('--no-build', 'skip the dist stamp check; refused when no stamp exists')
    .option('--timeout <ms>', `readiness wait in milliseconds (default: ${defaultTimeoutMs})`)
    .showHelpAfterError();
}

function prepareDist(run: RunState) {
  const { plan } = run;
  if (!plan.build) {
    const stamp = readBuildStamp(distDir);
    if (stamp === undefined) {
      throw new VerifyEnvironmentError(
        `no build stamp in ${distDir}; run again without --no-build`
      );
    }
    run.build = { hash: stamp.hash, builtAt: stamp.builtAt, commit: stamp.commit, rebuilt: false };
    report(`build: stamp check skipped (--no-build), reusing stamp ${shortHash(stamp.hash)}`);
    return;
  }
  const bundledPackageDirs = resolveBundledWorkspacePackages(
    extensionRoot,
    listWorkspacePackages(repoRoot)
  );
  const inputFiles = collectBuildInputFiles(extensionRoot, repoRoot, bundledPackageDirs);
  const hash = computeBuildHash(repoRoot, inputFiles);
  const stamp = readBuildStamp(distDir);
  if (stamp !== undefined && stamp.hash === hash) {
    run.build = { hash: stamp.hash, builtAt: stamp.builtAt, commit: stamp.commit, rebuilt: false };
    report(`build: reused stamp ${shortHash(hash)}`);
    return;
  }
  const reason = stamp === undefined ? 'no stamp in dist' : 'build inputs changed';
  const logPath = path.join(plan.outDir, buildLogFileName);
  report(
    `build: ${reason}, running pnpm --filter @leather.io/extension build:test (log: ${logPath})`
  );
  const result = runTestBuild(extensionRoot, logPath);
  run.artifacts.buildLog = buildLogFileName;
  if (!result.ok) {
    throw new VerifyEnvironmentError(
      `build failed with exit code ${result.exitCode}; see ${logPath}`
    );
  }
  const builtAt = new Date().toISOString();
  const commit = readHeadCommit(repoRoot);
  writeBuildStamp(distDir, { hash, builtAt, commit, mode: testBuildMode });
  run.build = { hash, builtAt, commit, rebuilt: true };
  report(`build: rebuilt, stamp ${shortHash(hash)}`);
}

async function launchExtension(): Promise<LaunchedExtension> {
  try {
    return await launchExtensionContext(distDir);
  } catch (error) {
    throw new VerifyEnvironmentError(
      `could not launch Chromium with the extension: ${describeError(error)}`
    );
  }
}

async function attempt(label: string, action: () => Promise<void>) {
  try {
    await action();
  } catch (error) {
    report(`warning: ${label} evidence not captured: ${describeError(error)}`);
  }
}

async function captureEvidence(page: Page, run: RunState) {
  const { plan, artifacts } = run;
  await attempt('screenshot', async () => {
    const screenshotPath = path.join(plan.outDir, screenshotFileName);
    if (await captureScreenshot(page, plan.shot, screenshotPath)) {
      artifacts.screenshot = screenshotFileName;
    }
  });
  await attempt('aria', async () => {
    await captureAriaSnapshot(page, path.join(plan.outDir, ariaFileName));
    artifacts.aria = ariaFileName;
  });
  await attempt('state', async () => {
    const state = await captureState(page, plan.stateSlices);
    writeFileSync(path.join(plan.outDir, stateFileName), `${JSON.stringify(state, null, 2)}\n`);
    artifacts.state = stateFileName;
    run.state = state.slices;
  });
}

async function establishSessionSafely(page: Page, extensionId: string, run: RunState) {
  const { plan } = run;
  try {
    await establishSession(plan.session, { page, extensionId, networkId: plan.network });
  } catch (error) {
    run.error = `session ${plan.session} not established: ${describeError(error)}`;
    report(`session: ${plan.session} not established`);
    return false;
  }
  report(`session: ${plan.session}`);
  return true;
}

async function drive({ context, extensionId }: LaunchedExtension, run: RunState) {
  const { plan, recorder } = run;
  context.setDefaultTimeout(plan.timeoutMs);
  recorder.attachToContext(context);
  const page = await getInitialPage(context);
  recorder.attachToPage(page);
  await disableAnimations(page);
  const sessionEstablished = await establishSessionSafely(page, extensionId, run);
  if (sessionEstablished) {
    await openRoute(page, extensionId, plan.route);
    const readiness = await waitForReady(page, plan.ready.testId, plan.timeoutMs);
    run.readyMet = readiness.met;
    run.afterMs = readiness.afterMs;
    if (readiness.met) report(`ready: ${plan.ready.testId} after ${readiness.afterMs} ms`);
    else report(`ready: ${plan.ready.testId} not reached within ${plan.timeoutMs} ms`);
  }
  await captureEvidence(page, run);
}

function finish(run: RunState, envFailed: boolean): number {
  const { plan, recorder } = run;
  const entries = recorder.entries();
  recorder.writeTo(path.join(plan.outDir, consoleFileName));
  run.artifacts.console = consoleFileName;
  const blocking = findBlockingErrors(entries, consoleErrorAllowlist);
  const blockingErrorCount = blocking.consoleErrors.length + blocking.pageErrors.length;
  if (blockingErrorCount > 0 && plan.allowConsoleErrors) {
    report(
      `warning: ${blockingErrorCount} console or page errors downgraded by --allow-console-errors`
    );
  }
  const verdict = decideVerdict({
    envFailed,
    readyMet: run.readyMet,
    blockingErrorCount,
    allowConsoleErrors: plan.allowConsoleErrors,
  });
  const summary: VerifySummary = {
    verdict,
    exitCode: verdictExitCodes[verdict],
    route: plan.route,
    session: plan.session,
    network: plan.network,
    ready: { target: plan.ready.target, testId: plan.ready.testId, afterMs: run.afterMs },
    pageErrors: listPageErrors(entries),
    console: summarizeConsole(entries, consoleErrorAllowlist),
    state: run.state,
    build: run.build,
    artifacts: run.artifacts,
    durationMs: Date.now() - run.startedAt,
    error: run.error,
  };
  writeSummary(plan.outDir, summary);
  if (run.error !== undefined) report(`error: ${run.error}`);
  report(`verdict: ${verdict}`);
  report(plan.outDir);
  return summary.exitCode;
}

async function runVerify(plan: VerifyPlan): Promise<number> {
  const run: RunState = {
    plan,
    startedAt: Date.now(),
    recorder: createConsoleRecorder(plan.consoleLevel),
    artifacts: {},
    build: null,
    readyMet: false,
    afterMs: null,
    state: {},
  };
  mkdirSync(plan.outDir, { recursive: true });
  try {
    const devServer = detectDevServer(repoRoot);
    if (devServer !== undefined) {
      throw new VerifyEnvironmentError(
        `stop pnpm dev for this worktree before verifying (pid ${devServer.pid} ${devServer.reason})`
      );
    }
    prepareDist(run);
    const launched = await launchExtension();
    try {
      await drive(launched, run);
    } finally {
      await launched.context.close();
      await launched.context.browser()?.close();
    }
  } catch (error) {
    if (error instanceof VerifyEnvironmentError) {
      run.error = error.message;
      return finish(run, true);
    }
    run.error = `unexpected failure: ${describeError(error)}`;
    if (error instanceof Error && error.stack !== undefined) report(error.stack);
    return finish(run, false);
  }
  return finish(run, false);
}

function readCliArguments(): string[] {
  const [first, ...rest] = process.argv.slice(2);
  if (first === argumentSeparator) return rest;
  return process.argv.slice(2);
}

async function main(): Promise<number> {
  const program = buildProgram().parse(readCliArguments(), { from: 'user' });
  try {
    const plan = parseVerifyOptions(program.opts(), { extensionRoot, now: new Date() });
    return await runVerify(plan);
  } catch (error) {
    if (!(error instanceof VerifyUsageError)) throw error;
    report(`error: ${error.message}`);
    report('run with --help for usage');
    return usageExitCode;
  }
}

process.exitCode = await main();
