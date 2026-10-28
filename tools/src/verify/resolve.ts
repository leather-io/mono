import path from 'node:path';

import { type ParsedFeature } from '../feature-map/features-parser.js';
import {
  type FeatureMapModel,
  substituteParams,
  verifyAvailability,
} from '../feature-map/model.js';
import { type VerifyInputs } from '../feature-map/test-assets.js';
import { compareStrings } from '../utils/compare.js';
import { allStateSlicesKeyword, defaultStateSlices } from './state-evidence.js';
import {
  type VerifyAccountType,
  type VerifyMockMode,
  type VerifyRpc,
  type VerifyRun,
  type VerifySession,
  defaultReadyTimeoutMs,
  verifyAccountTypes,
} from './verify-contract.js';

export interface VerifyCliOptions {
  readonly feature?: string;
  readonly route?: string;
  readonly signedIn?: boolean;
  readonly signedOut?: boolean;
  readonly locked?: boolean;
  readonly accountType?: string;
  readonly network?: string;
  readonly connectTestApp?: boolean;
  readonly flags?: string;
  readonly mocks?: string;
  readonly ready?: string;
  readonly rpc?: string;
  readonly params?: string;
  readonly state?: string;
  readonly allowConsoleErrors?: boolean;
  readonly out?: string;
  readonly build?: boolean;
  readonly timeout?: string;
}

export interface ResolveContext {
  readonly now: Date;
  readonly cwd: string;
  readParams(file: string): unknown;
}

interface ResolvedVerify {
  readonly run: VerifyRun;
  readonly feature?: ParsedFeature;
  readonly warnings: readonly string[];
}

export class VerifyArgumentError extends Error {}

const catalogRpcPrefix = 'catalog:';
const defaultNetworkId = 'mainnet';

const defaultMockSet = 'default';
const noMockSet = 'none';
const baseMocks = ['setupMockApis', 'mockUnhandledRequests'] as const;
const verifyResultsDirName = 'verify-results';
const rootRoute = '/';

function fail(message: string): never {
  throw new VerifyArgumentError(`verify: ${message}`);
}

function splitList(text: string): string[] {
  return text
    .split(',')
    .map(item => item.trim())
    .filter(item => item !== '');
}

export function parseFlagOverrides(
  text: string | undefined,
  knownFlags: readonly string[]
): Record<string, boolean> {
  const overrides: Record<string, boolean> = {};
  if (text === undefined || text.trim() === '') return overrides;
  for (const pair of text.split(',')) {
    const [name, value, ...rest] = pair.split('=').map(part => part.trim());
    if (
      !name ||
      value === undefined ||
      rest.length > 0 ||
      (value !== 'true' && value !== 'false')
    ) {
      fail(
        `--flags expects a comma-separated list of name=true|false pairs, got '${pair}'. Fix: --flags releaseOnramperBuy=true,swapSbtcBridging=false`
      );
    }
    if (!knownFlags.includes(name)) {
      fail(`--flags names unknown flag '${name}'. Fix: use one of ${knownFlags.join(', ')}.`);
    }
    overrides[name] = value === 'true';
  }
  return overrides;
}

export function sessionFromOptions(options: VerifyCliOptions): VerifySession | undefined {
  const chosen: VerifySession[] = [];
  if (options.signedIn) chosen.push('signed-in');
  if (options.signedOut) chosen.push('signed-out');
  if (options.locked) chosen.push('locked');
  if (chosen.length > 1) {
    fail('--signed-in, --signed-out and --locked are mutually exclusive. Fix: pass one of them.');
  }
  return chosen[0];
}

export function deriveAccountType(text: string | undefined): VerifyAccountType | undefined {
  if (text === undefined) return 'software';
  return verifyAccountTypes.find(candidate => candidate === text);
}

function accountTypeFor(
  feature: ParsedFeature | undefined,
  options: VerifyCliOptions,
  warnings: string[]
): VerifyAccountType {
  if (options.accountType !== undefined) {
    const chosen = verifyAccountTypes.find(candidate => candidate === options.accountType);
    if (chosen === undefined) {
      fail(
        `--account-type must be one of ${verifyAccountTypes.join(', ')}, got '${options.accountType}'.`
      );
    }
    return chosen;
  }
  const text = feature?.preconditions.accountType;
  const derived = deriveAccountType(text);
  if (derived !== undefined) return derived;
  warnings.push(
    `feature '${feature?.id ?? ''}' declares accountType '${text ?? ''}', which is none of ${verifyAccountTypes.join(', ')}; running as software. Fix: pass --account-type <type>.`
  );
  return 'software';
}

function networkFor(
  inputs: VerifyInputs,
  feature: ParsedFeature | undefined,
  options: VerifyCliOptions
): string {
  const network = options.network ?? feature?.preconditions.network ?? defaultNetworkId;
  if (!inputs.networkIds.includes(network)) {
    fail(
      `--network '${network}' is not a wallet network id. Fix: use one of ${inputs.networkIds.join(', ')}.`
    );
  }
  return network;
}

function stateSlicesFor(inputs: VerifyInputs, options: VerifyCliOptions): string[] {
  if (options.state === undefined) return [...defaultStateSlices];
  if (options.state === allStateSlicesKeyword) return [...inputs.persistedSlices];
  const names = splitList(options.state);
  if (names.length === 0) {
    fail(
      `--state expects a comma-separated list of persisted slices or '${allStateSlicesKeyword}'.`
    );
  }
  for (const name of names) {
    if (inputs.persistedSlices.includes(name)) continue;
    fail(
      `--state names unknown slice '${name}'. Fix: use '${allStateSlicesKeyword}' or some of ${inputs.persistedSlices.join(', ')}.`
    );
  }
  return names;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatTimestamp(date: Date): string {
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    '-',
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
    '-',
    String(date.getUTCMilliseconds()).padStart(3, '0'),
  ].join('');
}

export function slugFor(feature: string | undefined, route: string): string {
  if (feature) return feature;
  const slug = route
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return slug === '' ? 'root' : slug;
}

function findFeature(model: FeatureMapModel, id: string): ParsedFeature {
  const feature = model.features.find(candidate => candidate.id === id);
  if (feature) return feature;
  const ids = model.features.map(candidate => candidate.id).join(', ');
  return fail(`unknown feature '${id}'. Fix: use one of ${ids}.`);
}

function routeFor(feature: ParsedFeature): string {
  if (feature.startRoute) return substituteParams(feature.startRoute.value, feature.params);
  if (feature.anchor.kind !== 'route') return rootRoute;
  const first = feature.routes[0];
  if (!first) return fail(`feature '${feature.id}' lists no routes.`);
  return substituteParams(first.value, feature.params);
}

function openFor(model: FeatureMapModel, feature: ParsedFeature | undefined): string[] {
  if (!feature) return [];
  for (const action of feature.open) {
    if (model.pageObjectActions.has(action)) continue;
    fail(
      `feature '${feature.id}' open action '${action}' is not a public page-object method. Fix: pnpm lt feature-map check names the methods of that page object.`
    );
  }
  return [...feature.open];
}

function assertVerifiable(feature: ParsedFeature): void {
  const availability = verifyAvailability(feature);
  if (availability.verifiable) return;
  const specs = feature.specs.length > 0 ? feature.specs.join(', ') : 'none listed';
  fail(`${availability.reason}. Specs: ${specs}`);
}

function defaultFlags(feature: ParsedFeature | undefined): Record<string, boolean> {
  const flags: Record<string, boolean> = {};
  for (const flag of feature?.flags ?? []) flags[flag] = true;
  return flags;
}

function describeCatalog(inputs: VerifyInputs): string {
  const byMethod = new Map<string, string[]>();
  for (const [id, method] of inputs.rpcCatalog) {
    byMethod.set(method, [...(byMethod.get(method) ?? []), id]);
  }
  return [...byMethod.entries()]
    .sort(([a], [b]) => compareStrings(a, b))
    .map(([method, ids]) => `${method} (${ids.join(', ')})`)
    .join('; ');
}

function catalogIdsFor(inputs: VerifyInputs, method: string): string[] {
  return [...inputs.rpcCatalog.entries()]
    .filter(([, candidate]) => candidate === method)
    .map(([id]) => id);
}

function catalogRpc(inputs: VerifyInputs, catalogId: string, options: VerifyCliOptions): VerifyRpc {
  const method = inputs.rpcCatalog.get(catalogId);
  if (method === undefined) {
    fail(
      `--rpc names unknown catalog id '${catalogId}'. Fix: use one of ${[...inputs.rpcCatalog.keys()].sort(compareStrings).join(', ')}.`
    );
  }
  if (options.params !== undefined) {
    fail(
      '--params only applies to --rpc <method>, not to a catalog id that builds its own params.'
    );
  }
  return { method, catalogId };
}

function rpcFor(
  inputs: VerifyInputs,
  feature: ParsedFeature | undefined,
  options: VerifyCliOptions,
  context: ResolveContext
): VerifyRpc | undefined {
  if (options.rpc?.startsWith(catalogRpcPrefix)) {
    return catalogRpc(inputs, options.rpc.slice(catalogRpcPrefix.length), options);
  }
  const entryMethod = feature?.entry.find(point => point.kind === 'rpc' && point.method)?.method;
  const method = options.rpc ?? entryMethod;
  if (options.params !== undefined && method === undefined) {
    fail('--params needs --rpc <method> (or a feature whose entry is an rpc call).');
  }
  if (method === undefined) return undefined;
  if (options.params !== undefined) {
    return { method, params: context.readParams(path.resolve(context.cwd, options.params)) };
  }
  if (options.rpc !== undefined) return { method };
  const [catalogId] = catalogIdsFor(inputs, method);
  if (catalogId === undefined) {
    fail(
      `feature '${feature?.id ?? ''}' calls '${method}' but no catalog spec in apps/test-app/src/methods builds its params. Fix: pass --params <file.json>, or add a catalog spec for it. Catalog methods: ${describeCatalog(inputs)}.`
    );
  }
  return { method, catalogId };
}

interface ResolvedMocks {
  readonly mode: VerifyMockMode;
  readonly mocks: string[];
}

const mockRegistryFile = 'apps/extension/tests/verify/mock-registry.ts';

function mocksFor(
  model: FeatureMapModel,
  inputs: VerifyInputs,
  feature: ParsedFeature | undefined,
  options: VerifyCliOptions
): ResolvedMocks {
  const text = options.mocks ?? defaultMockSet;
  if (text === defaultMockSet) {
    const mocks = feature ? [...feature.preconditions.mocks] : [...baseMocks];
    const unregistered = mocks.filter(name => !inputs.verifyMocks.has(name));
    if (unregistered.length > 0) {
      fail(
        `feature '${feature?.id ?? ''}' lists mocks the verify registry cannot apply: ${unregistered.join(', ')}. Fix: register them in ${mockRegistryFile} or drop them from the entry.`
      );
    }
    return { mode: 'default', mocks };
  }
  if (text === noMockSet) return { mode: 'none', mocks: [] };
  const names = splitList(text);
  for (const name of names) {
    if (!model.mocks.has(name)) {
      fail(
        `--mocks names unknown mock '${name}'. Fix: use '${defaultMockSet}', '${noMockSet}' or a comma-separated list of functions exported from apps/extension/tests/mocks.`
      );
    }
    if (inputs.verifyMocks.has(name)) continue;
    fail(
      `--mocks names '${name}', which is exported but not registered in ${mockRegistryFile}, so verify cannot apply it. Fix: register it there or leave it out.`
    );
  }
  return { mode: 'list', mocks: [...baseMocks, ...names] };
}

function timeoutFor(options: VerifyCliOptions): number {
  if (options.timeout === undefined) return defaultReadyTimeoutMs;
  const timeout = Number(options.timeout);
  if (!Number.isFinite(timeout) || timeout <= 0) {
    fail(`--timeout must be a positive number of milliseconds, got '${options.timeout}'.`);
  }
  return timeout;
}

function validateRoute(route: string | undefined): string {
  if (route === undefined || !route.startsWith('/')) {
    fail(`--route must start with '/', got '${route ?? ''}'. Fix: --route '/${route ?? ''}'`);
  }
  return route;
}

export function resolveVerifyRun(
  model: FeatureMapModel,
  inputs: VerifyInputs,
  options: VerifyCliOptions,
  context: ResolveContext
): ResolvedVerify {
  if (!options.feature && !options.route) {
    fail(
      'pass --feature <id> or --route <path>. Fix: pnpm lt verify extension --feature home-tokens'
    );
  }
  if (options.feature && options.route) {
    fail('--feature and --route are mutually exclusive. Fix: pass one of them.');
  }
  const warnings: string[] = [];
  const feature = options.feature ? findFeature(model, options.feature) : undefined;
  if (feature) assertVerifiable(feature);
  const route = feature ? routeFor(feature) : validateRoute(options.route);
  const session = sessionFromOptions(options) ?? feature?.preconditions.session ?? 'signed-in';
  const accountType = accountTypeFor(feature, options, warnings);
  if (session === 'locked' && accountType === 'ledger') {
    fail(
      '--locked needs a wallet with a password; a Ledger wallet has none. Fix: drop --locked or use --account-type software.'
    );
  }
  const flags = { ...defaultFlags(feature), ...parseFlagOverrides(options.flags, model.flags) };
  const ready = options.ready ?? feature?.selectors.ready?.value;
  if (ready === undefined) {
    warnings.push(
      '--route without --ready: the run only waits for the document, pass --ready <data-testid> to wait for the screen.'
    );
  }
  const rpc = rpcFor(inputs, feature, options, context);
  const mocks = mocksFor(model, inputs, feature, options);
  if (mocks.mode === 'none') {
    warnings.push(
      '--mocks none: every request reaches the real network, so the run only proves the screen renders against live APIs.'
    );
  }
  const outDir = options.out
    ? path.resolve(context.cwd, options.out)
    : path.join(
        model.config.appDir,
        verifyResultsDirName,
        `${slugFor(feature?.id, route)}-${formatTimestamp(context.now)}`
      );

  return {
    feature,
    warnings,
    run: {
      feature: feature?.id,
      route,
      open: openFor(model, feature),
      session,
      accountType,
      network: networkFor(inputs, feature, options),
      connectTestApp: options.connectTestApp ?? rpc !== undefined,
      flags,
      mocksMode: mocks.mode,
      mocks: mocks.mocks,
      ready,
      rpc,
      stateSlices: stateSlicesFor(inputs, options),
      allowConsoleErrors: options.allowConsoleErrors === true,
      outDir,
      readyTimeoutMs: timeoutFor(options),
    },
  };
}
