import type { BrowserContext, Page, Request, Response } from '@playwright/test';
import { readPersistedStore } from '@tests/persisted-store';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  type ConsoleEntry,
  blockingConsoleEntries,
  fallbackAbortNoise,
  pageErrorLevel,
  summarizeConsole,
} from '@leather.io/tools/console-verdict';
import {
  type NetworkInitiator,
  type NetworkRecord,
  type ServerAddress,
  classifyFailure,
  classifyResponse,
  summarizeNetwork,
} from '@leather.io/tools/network-classification';
import { type StateEvidence, buildStateEvidence } from '@leather.io/tools/state-evidence';
import {
  type VerifyReadyOutcome,
  type VerifyRpcSummary,
  type VerifyRun,
  type VerifySummary,
  decideVerdict,
  describeRpcFailure,
  summaryFileName,
  verifyExitCodes,
} from '@leather.io/tools/verify-contract';

import {
  backgroundErrorsSchema,
  backgroundErrorsStorageKey,
} from '@shared/storage/background-errors';

import { consoleErrorAllowlist } from './console-allowlist';
import type { AppliedMocks } from './mock-registry';

export interface Capture {
  readonly consoleEntries: ConsoleEntry[];
  readonly network: NetworkRecord[];
  readonly startedAt: number;
  readonly hermetic: boolean;
  settle(): Promise<void>;
}

interface RpcRequestRecord {
  readonly method: string;
  readonly params: unknown;
}

interface WriteArtifactsArgs {
  readonly run: VerifyRun;
  readonly page: Page;
  readonly context: BrowserContext;
  readonly extensionId: string;
  readonly capture: Capture;
  readonly ready: VerifyReadyOutcome;
  readonly mocks: AppliedMocks;
  readonly rpc?: VerifyRpcSummary;
  readonly rpcRequest?: RpcRequestRecord;
}

const bodySelector = 'body';
const encryptionKeyName = 'encryptionKey';
const artifactNames = {
  screenshot: 'screenshot.png',
  a11y: 'a11y.md',
  state: 'state.json',
  console: 'console.json',
  network: 'network.json',
  backgroundErrors: 'background-errors.json',
  rpcRequest: 'rpc-request.json',
} as const;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function elapsed(capture: Capture): number {
  return Date.now() - capture.startedAt;
}

function initiatorOf(request: Request): NetworkInitiator {
  return request.serviceWorker() === null ? 'page' : 'service-worker';
}

async function readServerAddress(response: Response): Promise<ServerAddress | null | undefined> {
  try {
    return await response.serverAddr();
  } catch {
    return undefined;
  }
}

function attachConsole(capture: Capture, page: Page, label: string) {
  page.on('console', message => {
    const { url, lineNumber } = message.location();
    capture.consoleEntries.push({
      page: label,
      level: message.type(),
      text: message.text(),
      location: url ? `${url}:${lineNumber}` : undefined,
      at: elapsed(capture),
    });
  });
  page.on('pageerror', error => {
    capture.consoleEntries.push({
      page: label,
      level: pageErrorLevel,
      text: `${error.name}: ${error.message}`,
      at: elapsed(capture),
    });
  });
}

export function createCapture(context: BrowserContext, hermetic: boolean): Capture {
  const pending = new Set<Promise<void>>();
  const capture: Capture = {
    consoleEntries: [],
    network: [],
    startedAt: Date.now(),
    hermetic,
    async settle() {
      await Promise.all([...pending]);
    },
  };
  let count = 0;
  function nextLabel() {
    count += 1;
    return `page-${count}`;
  }
  for (const page of context.pages()) attachConsole(capture, page, nextLabel());
  context.on('page', page => attachConsole(capture, page, nextLabel()));

  async function recordResponse(response: Response) {
    const request = response.request();
    const url = request.url();
    const serverAddr = await readServerAddress(response);
    capture.network.push({
      url,
      method: request.method(),
      resourceType: request.resourceType(),
      initiator: initiatorOf(request),
      classification: serverAddr === undefined ? 'other' : classifyResponse(url, serverAddr),
      status: response.status(),
      ...(serverAddr === undefined ? { failure: 'server address unavailable' } : {}),
      at: elapsed(capture),
    });
  }
  function track(work: Promise<void>) {
    pending.add(work);
    void work.finally(() => pending.delete(work));
  }
  context.on('response', response => track(recordResponse(response)));
  context.on('requestfailed', request => {
    const errorText = request.failure()?.errorText;
    capture.network.push({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType(),
      initiator: initiatorOf(request),
      classification: classifyFailure(request.url(), errorText, hermetic),
      status: null,
      failure: errorText,
      at: elapsed(capture),
    });
  });
  return capture;
}

export function readyLocator(page: Page, ready: string | undefined) {
  if (ready === undefined) return page.locator(bodySelector);
  return page.getByTestId(ready).first();
}

export async function waitForReady(
  page: Page,
  ready: string | undefined,
  timeoutMs: number
): Promise<VerifyReadyOutcome> {
  const started = Date.now();
  try {
    await readyLocator(page, ready).waitFor({ state: 'attached', timeout: timeoutMs });
    return { selector: ready, attached: true, waitedMs: Date.now() - started };
  } catch (error) {
    return {
      selector: ready,
      attached: false,
      waitedMs: Date.now() - started,
      error: errorMessage(error),
    };
  }
}

interface StateRead {
  readonly evidence: StateEvidence;
  readonly error?: string;
}

async function readStateEvidence(page: Page, slices: readonly string[]): Promise<StateRead> {
  try {
    const store = await readPersistedStore(page);
    const sessionArea: unknown = await page.evaluate(
      async key => chrome.storage.session.get([key]),
      encryptionKeyName
    );
    return { evidence: buildStateEvidence(store, slices, sessionArea) };
  } catch (error) {
    return {
      evidence: buildStateEvidence(undefined, slices, undefined),
      error: errorMessage(error),
    };
  }
}

interface BackgroundErrorsRead {
  readonly errors: string[];
  readonly unavailable?: string;
  readonly testBuild: boolean;
}

const notTestBuild =
  'the dist is not a WALLET_ENVIRONMENT=testing build, so the service worker records no errors; run pnpm --filter @leather.io/extension build:test or pass --build';

async function readBackgroundErrors(context: BrowserContext): Promise<BackgroundErrorsRead> {
  const [worker] = context.serviceWorkers();
  if (worker === undefined) {
    return { errors: [], unavailable: 'no service worker is registered', testBuild: true };
  }
  try {
    const stored: unknown = await worker.evaluate(async key => {
      const area = await chrome.storage.session.get([key]);
      const value: unknown = area[key];
      return value;
    }, backgroundErrorsStorageKey);
    if (stored === undefined) return { errors: [], unavailable: notTestBuild, testBuild: false };
    const parsed = backgroundErrorsSchema.safeParse(stored);
    if (!parsed.success) {
      return { errors: [], unavailable: `stored records do not match the schema`, testBuild: true };
    }
    return {
      errors: parsed.data.map(record => `${record.ts} ${record.message}`),
      testBuild: true,
    };
  } catch (error) {
    return { errors: [], unavailable: errorMessage(error), testBuild: true };
  }
}

async function writeScreenshot(page: Page, outDir: string): Promise<string | undefined> {
  try {
    await page.screenshot({ path: path.join(outDir, artifactNames.screenshot), fullPage: true });
    return undefined;
  } catch (error) {
    return errorMessage(error);
  }
}

async function readAriaSnapshot(page: Page): Promise<string> {
  try {
    return await page.locator(bodySelector).ariaSnapshot();
  } catch (error) {
    return `(unavailable: ${errorMessage(error)})`;
  }
}

function writeJson(outDir: string, name: string, value: unknown) {
  writeFileSync(path.join(outDir, name), `${JSON.stringify(value, null, 2)}\n`);
}

function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

export async function writeArtifacts({
  run,
  page,
  context,
  extensionId,
  capture,
  ready,
  mocks,
  rpc,
  rpcRequest,
}: WriteArtifactsArgs): Promise<VerifySummary> {
  const { outDir } = run;
  mkdirSync(outDir, { recursive: true });
  const notes: string[] = [];
  const blocking: string[] = [];
  const screenshotError = await writeScreenshot(page, outDir);
  const artifacts: string[] = [
    ...(screenshotError === undefined ? [artifactNames.screenshot] : []),
    artifactNames.a11y,
    artifactNames.state,
    artifactNames.console,
    artifactNames.network,
    artifactNames.backgroundErrors,
  ];
  if (screenshotError !== undefined) {
    notes.push(`screenshot.png is missing: the page could not be captured (${screenshotError}).`);
  }

  const aria = await readAriaSnapshot(page);
  writeFileSync(
    path.join(outDir, artifactNames.a11y),
    `# Accessibility snapshot\n\nURL: ${page.url()}\n\n\`\`\`yaml\n${aria}\n\`\`\`\n`
  );

  const state = await readStateEvidence(page, run.stateSlices);
  writeJson(outDir, artifactNames.state, state.evidence);
  notes.push(
    `state.json holds only the persisted slices ${run.stateSlices.join(', ')} (--state); softwareKeys.salt and every encryptedSecretKey are replaced; chrome.storage.session is reported as encryptionKeyPresent only.`
  );
  if (state.error !== undefined) {
    notes.push(`state.json is empty: the persisted store could not be read (${state.error}).`);
  }

  await capture.settle();
  writeJson(outDir, artifactNames.console, capture.consoleEntries);
  writeJson(outDir, artifactNames.network, capture.network);
  notes.push(
    'network.json classifications: extension and local resources, mocked = fulfilled by a route (no server address), fallback = aborted by the hermetic fallback, real = answered by a remote server, failed = aborted by the page or the network, other = non-http.'
  );

  const background = await readBackgroundErrors(context);
  const backgroundErrors = background.errors;
  writeJson(outDir, artifactNames.backgroundErrors, backgroundErrors);
  if (background.unavailable !== undefined) {
    notes.push(
      `background-errors.json is empty because the service worker storage could not be read (${background.unavailable}); background errors are unknown for this run.`
    );
  }

  const fallbackUrls = new Set(
    capture.network.filter(record => record.classification === 'fallback').map(record => record.url)
  );
  const isNoise = fallbackAbortNoise(fallbackUrls);
  const consoleSummary = summarizeConsole(capture.consoleEntries, consoleErrorAllowlist, isNoise);
  const blockingConsole = blockingConsoleEntries(
    capture.consoleEntries,
    consoleErrorAllowlist,
    isNoise
  );
  const noise = capture.consoleEntries.filter(isNoise);
  if (noise.length > 0) {
    notes.push(
      `${pluralize(noise.length, 'console error')} came from requests the hermetic fallback aborted on purpose and did not block: ${[...new Set(noise.map(entry => entry.location ?? ''))].join(', ')}.`
    );
  }
  if (blockingConsole.length > 0) {
    blocking.push(
      `${pluralize(blockingConsole.length, 'console or page error')} not in the allowlist (console.json): ${blockingConsole
        .slice(0, 3)
        .map(entry => entry.text)
        .join(' | ')}`
    );
  }
  if (backgroundErrors.length > 0) {
    blocking.push(
      `${pluralize(backgroundErrors.length, 'background service worker error')} (background-errors.json)`
    );
  }
  const network = summarizeNetwork(capture.network, capture.hermetic);
  if (network.blockingReal > 0) {
    blocking.push(
      `${pluralize(network.blockingReal, 'real request')} under mocks (network.json): ${network.realUrls.join(', ')}; add a mock, not an allowlist entry`
    );
  } else if (network.counts.real > 0) {
    notes.push(
      `${pluralize(network.counts.real, 'real request')} reached the network because the run has no mocks; this proves rendering against live APIs only.`
    );
  }
  if (run.ready === undefined) {
    notes.push('No ready selector: the run only waited for the document body.');
  }
  if (mocks.skipped.length > 0) {
    blocking.push(
      `${pluralize(mocks.skipped.length, 'listed mock')} the verify registry cannot apply (${mocks.skipped.join(', ')}); register them in apps/extension/tests/verify/mock-registry.ts or drop them from the entry`
    );
  }
  if (run.allowConsoleErrors && blocking.length > 0) {
    notes.push(
      '--allow-console-errors downgraded the blocking findings above; the run only proves the screen did not crash.'
    );
  }
  const rpcFailure = rpc === undefined ? undefined : describeRpcFailure(rpc.response);
  if (rpc !== undefined && rpcFailure !== undefined) {
    blocking.push(
      `the ${rpc.method} request failed, so the screen was not reached through it: ${rpcFailure}`
    );
  }
  if (rpcRequest !== undefined) {
    writeJson(outDir, artifactNames.rpcRequest, rpcRequest);
    artifacts.push(artifactNames.rpcRequest);
  }

  const verdict = decideVerdict({
    readyMet: ready.attached,
    blockingErrorCount: blocking.length,
    allowConsoleErrors: run.allowConsoleErrors,
    requestFailed: rpcFailure !== undefined,
    testBuild: background.testBuild,
  });
  const finishedAt = Date.now();
  const summary: VerifySummary = {
    verdict,
    exitCode: verifyExitCodes[verdict],
    run,
    extensionId,
    finalUrl: page.url(),
    ready,
    timings: {
      startedAt: new Date(capture.startedAt).toISOString(),
      finishedAt: new Date(finishedAt).toISOString(),
      totalMs: finishedAt - capture.startedAt,
    },
    artifacts: [...artifacts, summaryFileName],
    network,
    console: consoleSummary,
    backgroundErrors: backgroundErrors.length,
    ...(background.unavailable === undefined
      ? {}
      : { backgroundErrorsUnavailable: background.unavailable }),
    state: {
      slices: run.stateSlices,
      encryptionKeyPresent: state.evidence.session.encryptionKeyPresent,
    },
    ...(rpc === undefined ? {} : { rpc }),
    mocks,
    blocking,
    notes,
  };
  writeJson(outDir, summaryFileName, summary);
  return summary;
}
