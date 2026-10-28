import type { NetworkClassification } from './network-classification.js';

export const verifySessions = ['signed-in', 'signed-out', 'locked'] as const;
export type VerifySession = (typeof verifySessions)[number];

export const verifyAccountTypes = ['software', 'ledger', 'mixed', 'policy'] as const;
export type VerifyAccountType = (typeof verifyAccountTypes)[number];

export const verifyMockModes = ['default', 'none', 'list'] as const;
export type VerifyMockMode = (typeof verifyMockModes)[number];

export const verifyPageObjectNames = [
  'GlobalPage',
  'HomePage',
  'OnboardingPage',
  'SendPage',
  'SwapRevampPage',
  'NetworkPage',
  'SettingsPage',
  'SwitchAccountPage',
] as const;
export type VerifyPageObjectName = (typeof verifyPageObjectNames)[number];

export interface VerifyRpc {
  readonly method: string;
  readonly params?: unknown;
  readonly catalogId?: string;
}

export interface VerifyRun {
  readonly feature?: string;
  readonly route: string;
  readonly open: readonly string[];
  readonly session: VerifySession;
  readonly accountType: VerifyAccountType;
  readonly network: string;
  readonly connectTestApp: boolean;
  readonly flags: Readonly<Record<string, boolean>>;
  readonly mocksMode: VerifyMockMode;
  readonly mocks: readonly string[];
  readonly ready?: string;
  readonly rpc?: VerifyRpc;
  readonly stateSlices: readonly string[];
  readonly allowConsoleErrors: boolean;
  readonly outDir: string;
  readonly readyTimeoutMs: number;
}

export const verifyVerdicts = ['verified', 'ready-not-met', 'errors', 'env'] as const;
export type VerifyVerdict = (typeof verifyVerdicts)[number];

export const verifyExitCodes = {
  verified: 0,
  usage: 1,
  'ready-not-met': 2,
  errors: 3,
  env: 4,
} as const;

export interface VerdictInputs {
  readonly readyMet: boolean;
  readonly blockingErrorCount: number;
  readonly allowConsoleErrors: boolean;
}

export function decideVerdict({
  readyMet,
  blockingErrorCount,
  allowConsoleErrors,
}: VerdictInputs): VerifyVerdict {
  if (!readyMet) return 'ready-not-met';
  if (blockingErrorCount > 0 && !allowConsoleErrors) return 'errors';
  return 'verified';
}

export interface VerifyReadyOutcome {
  readonly selector?: string;
  readonly attached: boolean;
  readonly waitedMs: number;
  readonly error?: string;
}

export type VerifyNetworkCounts = Readonly<Record<NetworkClassification, number>>;

export interface VerifyNetworkSummary {
  readonly total: number;
  readonly counts: VerifyNetworkCounts;
  readonly serviceWorkerRequests: number;
  readonly realUrls: readonly string[];
  readonly blockingReal: number;
}

export interface VerifyConsoleSummary {
  readonly total: number;
  readonly errors: number;
  readonly pageErrors: number;
  readonly allowlisted: number;
  readonly blocking: number;
}

export interface VerifyStateSummary {
  readonly slices: readonly string[];
  readonly encryptionKeyPresent: boolean;
}

export const verifyRpcSources = ['catalog', 'params', 'none'] as const;
export type VerifyRpcSource = (typeof verifyRpcSources)[number];

export interface VerifyRpcSummary {
  readonly method: string;
  readonly source: VerifyRpcSource;
  readonly catalogId?: string;
  readonly popupUrl: string | null;
  readonly response: unknown;
}

export interface VerifySummary {
  readonly verdict: VerifyVerdict;
  readonly exitCode: number;
  readonly run: VerifyRun;
  readonly extensionId: string;
  readonly finalUrl: string;
  readonly ready: VerifyReadyOutcome;
  readonly timings: {
    readonly startedAt: string;
    readonly finishedAt: string;
    readonly totalMs: number;
  };
  readonly artifacts: readonly string[];
  readonly network: VerifyNetworkSummary;
  readonly console: VerifyConsoleSummary;
  readonly backgroundErrors: number;
  readonly backgroundErrorsUnavailable?: string;
  readonly state: VerifyStateSummary;
  readonly rpc?: VerifyRpcSummary;
  readonly mocks: {
    readonly applied: readonly string[];
    readonly skipped: readonly string[];
  };
  readonly blocking: readonly string[];
  readonly notes: readonly string[];
}

export const verifyEnvKeys = {
  run: 'VERIFY_RUN',
  feature: 'VERIFY_FEATURE',
  route: 'VERIFY_ROUTE',
  open: 'VERIFY_OPEN',
  session: 'VERIFY_SESSION',
  accountType: 'VERIFY_ACCOUNT_TYPE',
  network: 'VERIFY_NETWORK',
  connectTestApp: 'VERIFY_CONNECT_TEST_APP',
  flags: 'VERIFY_FLAGS',
  mocksMode: 'VERIFY_MOCKS_MODE',
  mocks: 'VERIFY_MOCKS',
  ready: 'VERIFY_READY',
  rpcMethod: 'VERIFY_RPC_METHOD',
  rpcParams: 'VERIFY_RPC_PARAMS',
  rpcCatalogId: 'VERIFY_RPC_CATALOG_ID',
  stateSlices: 'VERIFY_STATE',
  allowConsoleErrors: 'VERIFY_ALLOW_CONSOLE_ERRORS',
  outDir: 'VERIFY_OUT',
  readyTimeoutMs: 'VERIFY_READY_TIMEOUT_MS',
} as const;

export const summaryFileName = 'summary.json';
export const defaultReadyTimeoutMs = 30_000;

const runViaCli = 'Run it through `pnpm lt verify extension …`, which sets the VERIFY_* variables.';
const envTrue = '1';
const envFalse = '0';

function envError(message: string): Error {
  return new Error(`verify: ${message} ${runViaCli}`);
}

function required(env: Readonly<Record<string, string | undefined>>, key: string): string {
  const value = env[key];
  if (value === undefined || value === '') throw envError(`${key} is not set.`);
  return value;
}

function parseJson(text: string, key: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw envError(`${key} is not valid JSON.`);
  }
}

function parseFlags(text: string): Record<string, boolean> {
  const parsed = parseJson(text, verifyEnvKeys.flags);
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw envError(`${verifyEnvKeys.flags} must be a JSON object of booleans.`);
  }
  const flags: Record<string, boolean> = {};
  for (const [name, value] of Object.entries(parsed)) {
    if (typeof value !== 'boolean') {
      throw envError(`${verifyEnvKeys.flags} must be a JSON object of booleans.`);
    }
    flags[name] = value;
  }
  return flags;
}

function parseStringList(text: string, key: string): string[] {
  const parsed = parseJson(text, key);
  if (!Array.isArray(parsed)) throw envError(`${key} must be a JSON array of strings.`);
  const items: string[] = [];
  for (const item of parsed) {
    if (typeof item !== 'string') throw envError(`${key} must be a JSON array of strings.`);
    items.push(item);
  }
  return items;
}

function parseChoice<T extends string>(text: string, choices: readonly T[], key: string): T {
  const choice = choices.find(candidate => candidate === text);
  if (choice === undefined) throw envError(`${key} must be one of ${choices.join(', ')}.`);
  return choice;
}

function parseBoolean(text: string | undefined, key: string): boolean {
  if (text === undefined || text === '' || text === envFalse) return false;
  if (text === envTrue) return true;
  throw envError(`${key} must be ${envTrue} or ${envFalse}.`);
}

function parseRpc(env: Readonly<Record<string, string | undefined>>): VerifyRpc | undefined {
  const method = env[verifyEnvKeys.rpcMethod];
  if (method === undefined || method === '') return undefined;
  const catalogId = env[verifyEnvKeys.rpcCatalogId];
  if (catalogId !== undefined && catalogId !== '') return { method, catalogId };
  const params = env[verifyEnvKeys.rpcParams];
  if (params === undefined || params === '') return { method };
  return { method, params: parseJson(params, verifyEnvKeys.rpcParams) };
}

export function parseVerifyEnv(env: Readonly<Record<string, string | undefined>>): VerifyRun {
  if (env[verifyEnvKeys.run] !== envTrue) throw envError(`${verifyEnvKeys.run} is not set.`);
  const feature = env[verifyEnvKeys.feature];
  const ready = env[verifyEnvKeys.ready];
  const timeout = Number(env[verifyEnvKeys.readyTimeoutMs] ?? defaultReadyTimeoutMs);
  if (!Number.isFinite(timeout) || timeout <= 0) {
    throw envError(`${verifyEnvKeys.readyTimeoutMs} must be a positive number of milliseconds.`);
  }
  return {
    feature: feature === '' ? undefined : feature,
    route: required(env, verifyEnvKeys.route),
    open: parseStringList(env[verifyEnvKeys.open] ?? '[]', verifyEnvKeys.open),
    session: parseChoice(
      required(env, verifyEnvKeys.session),
      verifySessions,
      verifyEnvKeys.session
    ),
    accountType: parseChoice(
      required(env, verifyEnvKeys.accountType),
      verifyAccountTypes,
      verifyEnvKeys.accountType
    ),
    network: required(env, verifyEnvKeys.network),
    connectTestApp: parseBoolean(env[verifyEnvKeys.connectTestApp], verifyEnvKeys.connectTestApp),
    flags: parseFlags(required(env, verifyEnvKeys.flags)),
    mocksMode: parseChoice(
      required(env, verifyEnvKeys.mocksMode),
      verifyMockModes,
      verifyEnvKeys.mocksMode
    ),
    mocks: parseStringList(required(env, verifyEnvKeys.mocks), verifyEnvKeys.mocks),
    ready: ready === '' ? undefined : ready,
    rpc: parseRpc(env),
    stateSlices: parseStringList(
      required(env, verifyEnvKeys.stateSlices),
      verifyEnvKeys.stateSlices
    ),
    allowConsoleErrors: parseBoolean(
      env[verifyEnvKeys.allowConsoleErrors],
      verifyEnvKeys.allowConsoleErrors
    ),
    outDir: required(env, verifyEnvKeys.outDir),
    readyTimeoutMs: timeout,
  };
}

function envBoolean(value: boolean): string {
  return value ? envTrue : envFalse;
}

export function toVerifyEnv(run: VerifyRun): Record<string, string> {
  const env: Record<string, string> = {
    [verifyEnvKeys.run]: envTrue,
    [verifyEnvKeys.route]: run.route,
    [verifyEnvKeys.open]: JSON.stringify(run.open),
    [verifyEnvKeys.session]: run.session,
    [verifyEnvKeys.accountType]: run.accountType,
    [verifyEnvKeys.network]: run.network,
    [verifyEnvKeys.connectTestApp]: envBoolean(run.connectTestApp),
    [verifyEnvKeys.flags]: JSON.stringify(run.flags),
    [verifyEnvKeys.mocksMode]: run.mocksMode,
    [verifyEnvKeys.mocks]: JSON.stringify(run.mocks),
    [verifyEnvKeys.stateSlices]: JSON.stringify(run.stateSlices),
    [verifyEnvKeys.allowConsoleErrors]: envBoolean(run.allowConsoleErrors),
    [verifyEnvKeys.outDir]: run.outDir,
    [verifyEnvKeys.readyTimeoutMs]: String(run.readyTimeoutMs),
  };
  if (run.feature !== undefined) env[verifyEnvKeys.feature] = run.feature;
  if (run.ready !== undefined) env[verifyEnvKeys.ready] = run.ready;
  if (run.rpc) {
    env[verifyEnvKeys.rpcMethod] = run.rpc.method;
    if (run.rpc.catalogId !== undefined) env[verifyEnvKeys.rpcCatalogId] = run.rpc.catalogId;
    if (run.rpc.params !== undefined) {
      env[verifyEnvKeys.rpcParams] = JSON.stringify(run.rpc.params);
    }
  }
  return env;
}
