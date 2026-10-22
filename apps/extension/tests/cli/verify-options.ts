import path from 'node:path';
import { z } from 'zod';

import { type PersistedSliceKey, persistWhitelist } from '@shared/storage/persist-whitelist';

import { type ResolvedReadyTarget, resolveReadyTarget } from './selector-registry';
import { VerifyUsageError } from './verify-errors';

export const sessionModes = ['signed-in', 'signed-out', 'locked'] as const;
export type SessionMode = (typeof sessionModes)[number];

export const consoleLevels = ['error', 'warning', 'all'] as const;
export type ConsoleLevel = (typeof consoleLevels)[number];

export const defaultRoute = '/';
export const defaultSessionMode: SessionMode = 'signed-in';
export const defaultNetworkId = 'mainnet';
export const defaultShotMode = 'viewport';
export const defaultConsoleLevel: ConsoleLevel = 'all';
export const defaultStateSlices = 'active,networks,wallets';
export const defaultTimeoutMs = 15_000;
export const verifyOutputDirName = '.verify';

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
}

export interface VerifyOptionsContext {
  extensionRoot: string;
  now: Date;
}

const rawOptionsSchema = z.object({
  route: z.string().min(1).default(defaultRoute),
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
  const slug = route
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  if (slug.length === 0) return fallbackRouteSlug;
  return slug;
}

export function defaultOutDir(extensionRoot: string, route: string, now: Date): string {
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  return path.join(extensionRoot, verifyOutputDirName, `${timestamp}-${routeSlug(route)}`);
}

export function parseVerifyOptions(
  rawOptions: unknown,
  { extensionRoot, now }: VerifyOptionsContext
): VerifyPlan {
  const parsed = rawOptionsSchema.safeParse(rawOptions);
  if (!parsed.success) throw new VerifyUsageError(z.prettifyError(parsed.error));
  const options = parsed.data;
  const route = substituteRouteParams(options.route, parseRouteParams(options.param));
  const outDir =
    options.out === undefined
      ? defaultOutDir(extensionRoot, route, now)
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
  };
}
