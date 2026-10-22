import type { BrowserContext, Page } from '@playwright/test';
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
  hasLaunchDarklyKey,
  listWorkspacePackages,
  readBuildStamp,
  readHeadCommit,
  resolveBundledWorkspacePackages,
  runTestBuild,
  testBuildMode,
  writeBuildStamp,
} from './environment';
import { readAriaSnapshot } from './evidence/aria-evidence';
import { readBackgroundErrors } from './evidence/background-evidence';
import {
  type ConsoleRecorder,
  createConsoleRecorder,
  findBlockingErrors,
  listPageErrors,
  summarizeConsole,
} from './evidence/console-evidence';
import {
  type NetworkRecorder,
  type NetworkSummary,
  createNetworkRecorder,
  summarizeNetwork,
} from './evidence/network-evidence';
import { captureScreenshot } from './evidence/screenshot-evidence';
import { captureState, summarizeQueries } from './evidence/state-evidence';
import { installMocks } from './mocks';
import { openRoute, waitForReady } from './readiness';
import {
  dispatchRpcRequest,
  listCatalogMethods,
  readRpcParamsFile,
  resolveRpcRequest,
  rpcRequestFileName,
  settleRpcResponse,
} from './rpc';
import { createRedactor, describeMissingMnemonic, resolveMnemonic } from './secret';
import { establishSession } from './session';
import {
  type ArtifactName,
  type BuildSummary,
  type MocksSummary,
  type RpcSummary,
  type VerifySummary,
  decideVerdict,
  usageExitCode,
  verdictExitCodes,
  writeSummary,
} from './summary';
import {
  type TestAppHandle,
  ensureTestApp,
  stopTestApp,
  testAppLogFileName,
  waitForTestApp,
} from './test-app';
import { VerifyEnvironmentError, VerifyUsageError, describeError } from './verify-errors';
import {
  type VerifyPlan,
  accountTypes,
  catalogRpcPrefix,
  consoleLevels,
  defaultAccountType,
  defaultConsoleLevel,
  defaultMocksSpec,
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
const networkFileName = 'network.jsonl';
const backgroundErrorsFileName = 'background-errors.json';
const shortHashLength = 8;
const argumentSeparator = '--';
const serviceWorkerNetworkEventsVariable = 'PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS';
const backgroundNetworkObserved = true;

interface RunState {
  plan: VerifyPlan;
  rpcParams: unknown;
  startedAt: number;
  recorder: ConsoleRecorder;
  network: NetworkRecorder;
  redact(text: string): string;
  artifacts: Partial<Record<ArtifactName, string>>;
  build: BuildSummary | null;
  mocks: MocksSummary;
  rpc: RpcSummary | null;
  testApp: TestAppHandle | undefined;
  readyMet: boolean;
  afterMs: number | null;
  state: Record<string, unknown>;
  backgroundErrors: number;
  error?: string;
}

function report(line: string) {
  process.stderr.write(`${line}\n`);
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
      '--account-type <type>',
      `${accountTypes.join(' | ')} for signed-in sessions (default: ${defaultAccountType})`
    )
    .option(
      '--network <id>',
      `current network id in the seeded state (default: ${defaultNetworkId})`
    )
    .option(
      '--flag <key=true|false>',
      'override a LaunchDarkly flag (repeatable)',
      collectRepeatable,
      []
    )
    .option(
      '--mocks <spec>',
      `default, none, or default,+name,+name from the mock registry (default: ${defaultMocksSpec})`
    )
    .option(
      '--rpc <method>',
      `send an RPC request from the test app: a method or ${catalogRpcPrefix}<id>`
    )
    .option('--params <file.json>', 'params for a bare --rpc method, sent verbatim')
    .option('--onboard', 'with --session signed-out, sign in through the UI with the test mnemonic')
    .option(
      '--mnemonic-from-gh',
      'read the test mnemonic with gh variable get instead of the environment'
    )
    .option('--shot <mode>', `viewport | full | testid:<id> | none (default: ${defaultShotMode})`)
    .option(
      '--console <level>',
      `minimum console level recorded, errors always are: ${consoleLevels.join(' | ')} (default: ${defaultConsoleLevel})`
    )
    .option(
      '--allow-console-errors',
      'downgrade console, page, background and real-network errors to warnings'
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

function writeEvidence(run: RunState, fileName: string, content: string) {
  writeFileSync(path.join(run.plan.outDir, fileName), run.redact(content));
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

function warnAboutFlags(run: RunState) {
  if (Object.keys(run.plan.flags).length === 0) return;
  if (hasLaunchDarklyKey(extensionRoot)) return;
  report(
    'warning: no LAUNCH_DARKLY_KEY in .env or the environment, so the dist uses NoopProvider and every flag reads false; --flag has no effect'
  );
}

function resolveSecret(run: RunState): string | undefined {
  if (!run.plan.onboard) return undefined;
  const mnemonic = resolveMnemonic({ fromGh: run.plan.mnemonicFromGh });
  if (mnemonic === undefined) throw new VerifyEnvironmentError(describeMissingMnemonic());
  run.redact = createRedactor([mnemonic]);
  report(`secret: mnemonic loaded from ${run.plan.mnemonicFromGh ? 'gh' : 'the environment'}`);
  return mnemonic;
}

function startTestApp(run: RunState) {
  if (run.plan.rpc === undefined) return;
  const logPath = path.join(run.plan.outDir, testAppLogFileName);
  run.testApp = ensureTestApp(repoRoot, logPath);
  if (run.testApp.mode === 'spawned') {
    run.artifacts.testAppLog = testAppLogFileName;
    report(`test-app: spawned pnpm --filter @leather.io/test-app dev (log: ${logPath})`);
    return;
  }
  report(`test-app: reusing the listener on port 3000 (pid ${run.testApp.pid})`);
}

async function launchExtension(): Promise<LaunchedExtension> {
  if (backgroundNetworkObserved) process.env[serviceWorkerNetworkEventsVariable] = '1';
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

async function captureEvidence(page: Page, context: BrowserContext, run: RunState) {
  const { plan, artifacts } = run;
  await attempt('screenshot', async () => {
    const screenshotPath = path.join(plan.outDir, screenshotFileName);
    if (await captureScreenshot(page, plan.shot, screenshotPath)) {
      artifacts.screenshot = screenshotFileName;
    }
  });
  await attempt('aria', async () => {
    const snapshot = await readAriaSnapshot(page);
    writeEvidence(run, ariaFileName, `${snapshot}\n`);
    artifacts.aria = ariaFileName;
  });
  await attempt('state', async () => {
    const state = await captureState(page, plan.stateSlices);
    writeEvidence(run, stateFileName, `${JSON.stringify(state, null, 2)}\n`);
    artifacts.state = stateFileName;
    run.state = {
      ...state.slices,
      location: state.location,
      queries: summarizeQueries(state.queries),
    };
  });
  await attempt('background errors', async () => {
    const errors = await readBackgroundErrors(context);
    writeEvidence(run, backgroundErrorsFileName, `${JSON.stringify(errors, null, 2)}\n`);
    artifacts.backgroundErrors = backgroundErrorsFileName;
    run.backgroundErrors = errors.length;
  });
}

async function establishSessionSafely(
  page: Page,
  extensionId: string,
  run: RunState,
  mnemonic: string | undefined
) {
  const { plan } = run;
  try {
    await establishSession(plan.session, {
      page,
      extensionId,
      networkId: plan.network,
      accountType: plan.accountType,
      connectTestApp: plan.rpc !== undefined,
      mnemonic,
    });
  } catch (error) {
    run.error = `session ${plan.session} not established: ${describeError(error)}`;
    report(`session: ${plan.session} not established`);
    return false;
  }
  report(`session: ${plan.session} (${plan.accountType})`);
  return true;
}

async function recordReadiness(page: Page, run: RunState) {
  const { plan } = run;
  const readiness = await waitForReady(page, plan.ready.testId, plan.timeoutMs);
  run.readyMet = readiness.met;
  run.afterMs = readiness.afterMs;
  if (readiness.met) report(`ready: ${plan.ready.testId} after ${readiness.afterMs} ms`);
  else report(`ready: ${plan.ready.testId} not reached within ${plan.timeoutMs} ms`);
}

async function driveRoute(page: Page, extensionId: string, run: RunState): Promise<Page> {
  await openRoute(page, extensionId, run.plan.route);
  await recordReadiness(page, run);
  return page;
}

async function driveRpc(page: Page, context: BrowserContext, run: RunState): Promise<Page> {
  const { plan } = run;
  if (plan.rpc === undefined || run.testApp === undefined) return page;
  await waitForTestApp(page);
  report(`test-app: ready (${run.testApp.mode})`);
  const request = await resolveRpcRequest(plan.rpc, page, run.rpcParams);
  writeEvidence(
    run,
    rpcRequestFileName,
    `${JSON.stringify({ method: request.method, params: request.params }, null, 2)}\n`
  );
  run.artifacts.rpcRequest = rpcRequestFileName;
  const dispatched = await dispatchRpcRequest(page, context, request);
  const subject = dispatched.popup ?? page;
  if (dispatched.popup === undefined) report(`rpc: ${request.method} opened no popup`);
  else report(`rpc: ${request.method} opened ${dispatched.popup.url()}`);
  await recordReadiness(subject, run);
  run.rpc = {
    method: request.method,
    source: request.source,
    ...(request.catalogId === undefined ? {} : { catalogId: request.catalogId }),
    popupUrl: dispatched.popup?.url() ?? null,
    response: await settleRpcResponse(dispatched.response),
    testApp: run.testApp.mode,
  };
  return subject;
}

async function drive(
  { context, extensionId }: LaunchedExtension,
  run: RunState,
  mnemonic: string | undefined
) {
  const { plan, recorder } = run;
  context.setDefaultTimeout(plan.timeoutMs);
  recorder.attachToContext(context);
  run.network.attachToContext(context);
  run.mocks = await installMocks(context, plan.mocks, plan.flags);
  if (plan.mocks.mode === 'none')
    report('warning: --mocks none, every request reaches the real network');
  const page = await getInitialPage(context);
  recorder.attachToPage(page);
  await disableAnimations(page);
  const sessionEstablished = await establishSessionSafely(page, extensionId, run, mnemonic);
  if (!sessionEstablished) {
    await captureEvidence(page, context, run);
    return;
  }
  const subject =
    plan.rpc === undefined
      ? await driveRoute(page, extensionId, run)
      : await driveRpc(page, context, run);
  await captureEvidence(subject, context, run);
}

function countBlockingRequests(run: RunState, requests: NetworkSummary) {
  if (run.plan.mocks.mode !== 'default') return 0;
  return requests.counts.real;
}

async function finish(run: RunState, envFailed: boolean): Promise<number> {
  const { plan, recorder } = run;
  await run.network.settle();
  const entries = recorder.entries();
  writeEvidence(run, consoleFileName, recorder.serialize());
  run.artifacts.console = consoleFileName;
  writeEvidence(run, networkFileName, run.network.serialize());
  run.artifacts.network = networkFileName;
  const requests = summarizeNetwork(
    run.network.records(),
    backgroundNetworkObserved ? 'observed' : 'unobserved'
  );
  const blocking = findBlockingErrors(entries, consoleErrorAllowlist);
  const blockingRequestCount = countBlockingRequests(run, requests);
  const blockingErrorCount =
    blocking.consoleErrors.length +
    blocking.pageErrors.length +
    run.backgroundErrors +
    blockingRequestCount;
  report(
    `network: mocked ${requests.counts.mocked}, fallback ${requests.counts.fallback}, real ${requests.counts.real}, local ${requests.counts.local}, service worker ${requests.serviceWorkerRequests}`
  );
  if (blockingRequestCount > 0) {
    report(
      `network: ${blockingRequestCount} real requests under default mocks: ${requests.realUrls.join(', ')}`
    );
  }
  if (run.backgroundErrors > 0) report(`background: ${run.backgroundErrors} errors recorded`);
  if (blockingErrorCount > 0 && plan.allowConsoleErrors) {
    report(`warning: ${blockingErrorCount} errors downgraded by --allow-console-errors`);
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
    accountType: plan.accountType,
    network: plan.network,
    flags: plan.flags,
    mocks: run.mocks,
    rpc: run.rpc,
    ready: { target: plan.ready.target, testId: plan.ready.testId, afterMs: run.afterMs },
    pageErrors: listPageErrors(entries),
    console: summarizeConsole(entries, consoleErrorAllowlist),
    backgroundErrors: run.backgroundErrors,
    requests,
    state: run.state,
    build: run.build,
    artifacts: run.artifacts,
    durationMs: Date.now() - run.startedAt,
    error: run.error === undefined ? undefined : run.redact(run.error),
  };
  writeSummary(plan.outDir, summary, run.redact);
  if (summary.error !== undefined) report(`error: ${summary.error}`);
  report(`verdict: ${verdict}`);
  report(plan.outDir);
  return summary.exitCode;
}

function createRunState(plan: VerifyPlan, rpcParams: unknown): RunState {
  return {
    plan,
    rpcParams,
    startedAt: Date.now(),
    recorder: createConsoleRecorder(plan.consoleLevel),
    network: createNetworkRecorder(plan.mocks.mode),
    redact: createRedactor([]),
    artifacts: {},
    build: null,
    mocks: { mode: plan.mocks.mode, installed: [] },
    rpc: null,
    testApp: undefined,
    readyMet: false,
    afterMs: null,
    state: {},
    backgroundErrors: 0,
  };
}

async function runVerify(plan: VerifyPlan, rpcParams: unknown): Promise<number> {
  const run = createRunState(plan, rpcParams);
  mkdirSync(plan.outDir, { recursive: true });
  try {
    const devServer = detectDevServer(repoRoot);
    if (devServer !== undefined) {
      throw new VerifyEnvironmentError(
        `stop pnpm dev for this worktree before verifying (pid ${devServer.pid} ${devServer.reason})`
      );
    }
    prepareDist(run);
    warnAboutFlags(run);
    const mnemonic = resolveSecret(run);
    startTestApp(run);
    const launched = await launchExtension();
    try {
      await drive(launched, run, mnemonic);
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
    if (error instanceof Error && error.stack !== undefined) report(run.redact(error.stack));
    return finish(run, false);
  } finally {
    if (run.testApp !== undefined) stopTestApp(run.testApp);
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
    const plan = parseVerifyOptions(program.opts(), {
      extensionRoot,
      now: new Date(),
      catalogMethods: listCatalogMethods(),
    });
    const rpcParams =
      plan.rpc?.source === 'params' ? readRpcParamsFile(plan.rpc.paramsFile) : undefined;
    return await runVerify(plan, rpcParams);
  } catch (error) {
    if (!(error instanceof VerifyUsageError)) throw error;
    report(`error: ${error.message}`);
    report('run with --help for usage');
    return usageExitCode;
  }
}

process.exitCode = await main();
