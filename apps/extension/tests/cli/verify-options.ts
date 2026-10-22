import path from 'node:path';
import { z } from 'zod';

import { type PersistedSliceKey, persistWhitelist } from '@shared/storage/persist-whitelist';

import { parseFlagOverrides } from './feature-flags';
import { type MocksPlan, parseMocksSpec } from './mock-registry';
import { type ResolvedReadyTarget, resolveReadyTarget } from './selector-registry';
import { VerifyUsageError } from './verify-errors';

export const sessionModes = ['signed-in', 'signed-out', 'locked'] as const;
export type SessionMode = (typeof sessionModes)[number];

export const consoleLevels = ['error', 'warning', 'all'] as const;
export type ConsoleLevel = (typeof consoleLevels)[number];

export const accountTypes = ['software', 'ledger', 'mixed', 'policy'] as const;
export type AccountType = (typeof accountTypes)[number];

export const defaultRoute = '/';
export const defaultSessionMode: SessionMode = 'signed-in';
export const defaultNetworkId = 'mainnet';
export const defaultShotMode = 'viewport';
export const defaultConsoleLevel: ConsoleLevel = 'all';
export const defaultStateSlices = 'active,networks,wallets';
export const defaultTimeoutMs = 15_000;
export const defaultAccountType: AccountType = 'software';
export const defaultMocksSpec = 'default';
export const verifyOutputDirName = '.verify';
export const catalogRpcPrefix = 'catalog:';

const allSlicesKeyword = 'all';
const shotTestIdPrefix = 'testid:';
const fallbackRouteSlug = 'root';

export interface ViewportShot {
  kind: 'viewport';
}

export interface FullPageShot {
  kind: 'full';
}

export interface NoShot {
  kind: 'none';
}

export interface TestIdShot {
  kind: 'testid';
  testId: string;
}

export type ShotMode = ViewportShot | FullPageShot | NoShot | TestIdShot;

export interface ParamsRpcPlan {
  source: 'params';
  method: string;
  paramsFile: string;
}

export interface CatalogRpcPlan {
  source: 'catalog';
  method: string;
  catalogId: string;
}

export type RpcPlan = ParamsRpcPlan | CatalogRpcPlan;

export interface VerifyPlan {
  route: string;
  session: SessionMode;
  network: string;
  ready: ResolvedReadyTarget;
  shot: ShotMode;
  consoleLevel: ConsoleLevel;
  allowConsoleErrors: boolean;
  stateSlices: PersistedSliceKey[];
  outDir: string;
  build: boolean;
  timeoutMs: number;
  flags: Record<string, boolean>;
  mocks: MocksPlan;
  accountType: AccountType;
  rpc: RpcPlan | undefined;
  onboard: boolean;
  mnemonicFromGh: boolean;
}

export interface VerifyOptionsContext {
  extensionRoot: string;
  now: Date;
  catalogMethods: ReadonlyMap<string, string>;
}

const rawOptionsSchema = z.object({
  route: z.string().min(1).optional(),
  param: z.array(z.string()).default([]),
  session: z.enum(sessionModes).default(defaultSessionMode),
  network: z.string().min(1).default(defaultNetworkId),
  ready: z.string().min(1),
  shot: z.string().default(defaultShotMode),
  console: z.enum(consoleLevels).default(defaultConsoleLevel),
  allowConsoleErrors: z.boolean().default(false),
  state: z.string().default(defaultStateSlices),
  out: z.string().optional(),
  build: z.boolean().default(true),
  timeout: z.coerce.number().int().positive().default(defaultTimeoutMs),
  flag: z.array(z.string()).default([]),
  mocks: z.string().default(defaultMocksSpec),
  accountType: z.enum(accountTypes).optional(),
  rpc: z.string().min(1).optional(),
  params: z.string().min(1).optional(),
  onboard: z.boolean().default(false),
  mnemonicFromGh: z.boolean().default(false),
});

const sliceSchema = z.enum(persistWhitelist);

const routeParamPattern = /:([A-Za-z_][A-Za-z0-9_]*)\??/g;

export function parseRouteParams(pairs: readonly string[]): Map<string, string> {
  const params = new Map<string, string>();
  for (const pair of pairs) {
    const separatorIndex = pair.indexOf('=');
    if (separatorIndex <= 0) {
      throw new VerifyUsageError(`--param expects name=value, got "${pair}"`);
    }
    params.set(pair.slice(0, separatorIndex), pair.slice(separatorIndex + 1));
  }
  return params;
}

export function substituteRouteParams(route: string, params: ReadonlyMap<string, string>): string {
  const unknownParams = [...params.keys()].filter(name => !route.includes(`:${name}`));
  if (unknownParams.length > 0) {
    throw new VerifyUsageError(
      `--param ${unknownParams.join(', ')} does not match any :param in route "${route}"`
    );
  }
  const substituted = route.replace(
    routeParamPattern,
    (match: string, name: string) => params.get(name) ?? match
  );
  const leftover = [...substituted.matchAll(routeParamPattern)].map(([, name]) => `:${name}`);
  if (leftover.length > 0) {
    throw new VerifyUsageError(
      `Route "${route}" still has unsubstituted params ${leftover.join(', ')}. Pass --param name=value for each.`
    );
  }
  return substituted;
}

export function parseShotMode(shot: string): ShotMode {
  if (shot === 'viewport' || shot === 'full' || shot === 'none') return { kind: shot };
  if (shot.startsWith(shotTestIdPrefix)) {
    const testId = shot.slice(shotTestIdPrefix.length);
    if (testId.length > 0) return { kind: 'testid', testId };
  }
  throw new VerifyUsageError(
    `--shot expects viewport, full, none or ${shotTestIdPrefix}<id>, got "${shot}"`
  );
}

export function parseStateSlices(state: string): PersistedSliceKey[] {
  if (state === allSlicesKeyword) return [...persistWhitelist];
  const names = state
    .split(',')
    .map(name => name.trim())
    .filter(name => name.length > 0);
  if (names.length === 0) {
    throw new VerifyUsageError(
      `--state expects a comma-separated list of slices or ${allSlicesKeyword}`
    );
  }
  return names.map(name => {
    const parsed = sliceSchema.safeParse(name);
    if (!parsed.success) {
      throw new VerifyUsageError(
        `Unknown state slice "${name}". Known slices: ${persistWhitelist.join(', ')}`
      );
    }
    return parsed.data;
  });
}

export function routeSlug(route: string): string {
  const slug = route.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (slug.length === 0) return fallbackRouteSlug;
  return slug;
}

export function defaultOutDir(extensionRoot: string, label: string, now: Date): string {
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  return path.join(extensionRoot, verifyOutputDirName, `${timestamp}-${routeSlug(label)}`);
}

export function parseRpcPlan(
  rpc: string,
  params: string | undefined,
  catalogMethods: ReadonlyMap<string, string>
): RpcPlan {
  if (rpc.startsWith(catalogRpcPrefix)) {
    const catalogId = rpc.slice(catalogRpcPrefix.length);
    const method = catalogMethods.get(catalogId);
    if (method === undefined) {
      throw new VerifyUsageError(
        `Unknown catalog id "${catalogId}". Known ids: ${[...catalogMethods.keys()].sort().join(', ')}`
      );
    }
    if (params !== undefined) {
      throw new VerifyUsageError('--params only applies to a bare --rpc method, not a catalog id');
    }
    return { source: 'catalog', method, catalogId };
  }
  if (params === undefined) {
    throw new VerifyUsageError(`--rpc ${rpc} needs --params <file.json> with the request params`);
  }
  return { source: 'params', method: rpc, paramsFile: path.resolve(params) };
}

export function parseVerifyOptions(
  rawOptions: unknown,
  { extensionRoot, now, catalogMethods }: VerifyOptionsContext
): VerifyPlan {
  const parsed = rawOptionsSchema.safeParse(rawOptions);
  if (!parsed.success) throw new VerifyUsageError(z.prettifyError(parsed.error));
  const options = parsed.data;
  const rpc =
    options.rpc === undefined
      ? undefined
      : parseRpcPlan(options.rpc, options.params, catalogMethods);
  if (rpc !== undefined && options.session !== 'signed-in') {
    throw new VerifyUsageError('--rpc needs --session signed-in');
  }
  if (rpc !== undefined && options.route !== undefined) {
    throw new VerifyUsageError('--route cannot be combined with --rpc; the popup is the subject');
  }
  if (rpc === undefined && options.params !== undefined) {
    throw new VerifyUsageError('--params only applies together with --rpc');
  }
  const accountType = options.accountType ?? defaultAccountType;
  if (options.accountType !== undefined && options.session !== 'signed-in') {
    throw new VerifyUsageError('--account-type only applies to --session signed-in');
  }
  if (options.onboard && options.session !== 'signed-out') {
    throw new VerifyUsageError('--onboard only applies to --session signed-out');
  }
  if (options.mnemonicFromGh && !options.onboard) {
    throw new VerifyUsageError('--mnemonic-from-gh only applies together with --onboard');
  }
  const route = substituteRouteParams(
    options.route ?? defaultRoute,
    parseRouteParams(options.param)
  );
  const outDirLabel = rpc === undefined ? route : rpc.method;
  const outDir =
    options.out === undefined
      ? defaultOutDir(extensionRoot, outDirLabel, now)
      : path.resolve(options.out);
  return {
    route,
    session: options.session,
    network: options.network,
    ready: resolveReadyTarget(options.ready),
    shot: parseShotMode(options.shot),
    consoleLevel: options.console,
    allowConsoleErrors: options.allowConsoleErrors,
    stateSlices: parseStateSlices(options.state),
    outDir,
    build: options.build,
    timeoutMs: options.timeout,
    flags: parseFlagOverrides(options.flag),
    mocks: parseMocksSpec(options.mocks),
    accountType,
    rpc,
    onboard: options.onboard,
    mnemonicFromGh: options.mnemonicFromGh,
  };
}
