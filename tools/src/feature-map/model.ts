import { readFileSync } from 'node:fs';

import { compareStrings } from '../utils/compare.js';
import { type FeatureMapAppConfig } from './app-config.js';
import { parseExpoRouteFiles } from './expo-routes-parser.js';
import { type FeatureGate, type FeatureParam, featureGates } from './feature-entry.js';
import {
  type FeaturesParseResult,
  type ParsedFeature,
  type ResolvedString,
  parseFeaturesSource,
} from './features-parser.js';
import { loadMaestroActions, loadMaestroFlows } from './maestro-flows.js';
import { loadFeatureFlagHookKeys, loadRpcDispatchHandlers } from './mobile-assets.js';
import {
  type RouteReference,
  type RoutedRoute,
  type RouterModel,
  innermostGate,
  parseRouterFiles,
} from './routers-parser.js';
import {
  type PageObjectAction,
  type RpcHandler,
  type SelectorObject,
  type SetupMocks,
  type SpecFile,
  loadFeatureFiles,
  loadFeatureFlags,
  loadMockFunctions,
  loadPageObjectActions,
  loadRouteUrls,
  loadRouterFiles,
  loadRpcEndpointNames,
  loadRpcHandlers,
  loadRpcMethods,
  loadSelectorObjects,
  loadSelectorTable,
  loadSetupMocks,
  loadSpecs,
} from './test-assets.js';
import { type SourceLocation, type StringTable, mergeStringTables } from './ts-ast.js';

export interface FeatureMapModel {
  readonly config: FeatureMapAppConfig;
  readonly routeUrls: ReadonlyMap<string, string>;
  readonly selectorTable: StringTable;
  readonly router: RouterModel;
  readonly features: readonly ParsedFeature[];
  readonly parseErrors: readonly string[];
  readonly pageObjectActions: ReadonlyMap<string, PageObjectAction>;
  readonly mocks: ReadonlyMap<string, SourceLocation>;
  readonly setupMocks: SetupMocks | undefined;
  readonly specs: ReadonlyMap<string, SpecFile>;
  readonly flags: readonly string[];
  readonly rpcMethods: ReadonlySet<string>;
  readonly selectorObjects: ReadonlyMap<string, SelectorObject>;
  readonly rpcHandlers: ReadonlyMap<string, RpcHandler>;
}

function parseAllFeatures(files: readonly string[], table: StringTable): FeaturesParseResult {
  const features: ParsedFeature[] = [];
  const errors: string[] = [];
  for (const file of files) {
    const result = parseFeaturesSource(file, readFileSync(file, 'utf8'), table);
    features.push(...result.features);
    errors.push(...result.errors);
  }
  features.sort((a, b) => compareStrings(a.id, b.id));
  return { features, errors };
}

function loadRouter(config: FeatureMapAppConfig, table: StringTable): RouterModel {
  if (config.expoRouter) {
    return parseExpoRouteFiles(config.expoRouter, table, config.routeUrlsObjectName);
  }
  return parseRouterFiles(
    loadRouterFiles(config),
    table,
    config.routeUrlsObjectName,
    config.importAliases
  );
}

function loadActions(config: FeatureMapAppConfig): Map<string, PageObjectAction> {
  if (config.maestro) return loadMaestroActions(config.maestro);
  return loadPageObjectActions(config);
}

function loadAllSpecs(config: FeatureMapAppConfig): Map<string, SpecFile> {
  const specs = loadSpecs(config);
  if (!config.maestro) return specs;
  for (const [key, flow] of loadMaestroFlows(config.maestro)) specs.set(key, flow);
  return specs;
}

function loadFlags(config: FeatureMapAppConfig): string[] {
  if (config.featureFlagHooks) {
    return loadFeatureFlagHookKeys(config.featureFlagsFile, config.featureFlagHooks);
  }
  return loadFeatureFlags(config);
}

function loadHandlers(config: FeatureMapAppConfig): Map<string, RpcHandler> {
  if (config.rpcDispatchFiles) {
    return loadRpcDispatchHandlers(config.rpcDispatchFiles, loadRpcEndpointNames(config));
  }
  return loadRpcHandlers(config);
}

export function buildFeatureMapModel(config: FeatureMapAppConfig): FeatureMapModel {
  const routeUrls = loadRouteUrls(config);
  const selectorTable = loadSelectorTable(config);
  const table = mergeStringTables([
    selectorTable,
    new Map([[config.routeUrlsObjectName, routeUrls]]),
  ]);
  const router = loadRouter(config, table);
  const parsed = parseAllFeatures(loadFeatureFiles(config), table);
  const mocks = loadMockFunctions(config);

  return {
    config,
    routeUrls,
    selectorTable,
    router,
    features: parsed.features,
    parseErrors: parsed.errors,
    pageObjectActions: loadActions(config),
    mocks,
    setupMocks: loadSetupMocks(config, mocks),
    specs: loadAllSpecs(config),
    flags: loadFlags(config),
    rpcMethods: loadRpcMethods(config),
    selectorObjects: loadSelectorObjects(config),
    rpcHandlers: loadHandlers(config),
  };
}

export function routeRef(model: FeatureMapModel, key: string): string {
  return `${model.config.routeUrlsObjectName}.${key}`;
}

function keyForRouteValue(model: FeatureMapModel, value: string): string | undefined {
  for (const [key, routeValue] of model.routeUrls) {
    if (routeValue === value) return key;
  }
  return undefined;
}

export function keyForRoute(
  model: FeatureMapModel,
  route: { readonly value: string; readonly ref?: string }
): string | undefined {
  const prefix = `${model.config.routeUrlsObjectName}.`;
  if (route.ref?.startsWith(prefix)) return route.ref.slice(prefix.length);
  return keyForRouteValue(model, route.value);
}

export function routedKeys(model: FeatureMapModel): string[] {
  return [...model.router.references.keys()].filter(key => model.routeUrls.has(key)).sort();
}

export function unroutedKeys(model: FeatureMapModel): string[] {
  return [...model.routeUrls.keys()].filter(key => !model.router.references.has(key)).sort();
}

export function routesForKey(model: FeatureMapModel, key: string): RoutedRoute[] {
  return model.router.routes.filter(route => route.keys.includes(key));
}

function routesForPath(model: FeatureMapModel, value: string): RoutedRoute[] {
  return model.router.routes.filter(route => route.mountedPath === value && !route.isIndex);
}

export function unkeyedRoutes(model: FeatureMapModel): RoutedRoute[] {
  return model.router.routes.filter(route => route.keys.length === 0 && !route.isIndex);
}

export function firstReference(model: FeatureMapModel, key: string): RouteReference | undefined {
  const references = [...(model.router.references.get(key) ?? [])];
  references.sort((a, b) => compareStrings(a.file, b.file) || a.line - b.line);
  return references[0];
}

export function claimsByKey(model: FeatureMapModel): Map<string, ParsedFeature[]> {
  const claims = new Map<string, ParsedFeature[]>();
  for (const feature of model.features) {
    for (const route of feature.routes) {
      const key = keyForRoute(model, route);
      if (!key) continue;
      const list = claims.get(key) ?? [];
      if (!list.includes(feature)) list.push(feature);
      claims.set(key, list);
    }
  }
  return claims;
}

export function isNestedOnly(model: FeatureMapModel, key: string): boolean {
  const routes = routesForKey(model, key);
  return routes.length > 0 && routes.every(route => route.parentKeys.length > 0);
}

const templateSegment = /^\{(.+)\}$/;

const splatSegment = '*';

function paramNameOf(segment: string): string | undefined {
  if (segment === splatSegment) return splatSegment;
  const template = templateSegment.exec(segment);
  if (template) return template[1];
  if (segment.startsWith(':')) return segment.slice(1).replace(/\?$/, '');
  return undefined;
}

function substituteParams(value: string, params: readonly FeatureParam[]): string {
  return value
    .split('/')
    .map(segment => {
      const name = paramNameOf(segment);
      if (name === undefined) return segment;
      return params.find(param => param.name === name)?.example ?? segment;
    })
    .join('/');
}

function instancesForRoute(
  model: FeatureMapModel,
  route: ResolvedString,
  params: readonly FeatureParam[]
): RoutedRoute[] {
  const key = keyForRoute(model, route);
  const routed = [...(key ? routesForKey(model, key) : []), ...routesForPath(model, route.value)];
  const seen = new Set<string>();
  const instances = routed.filter(instance => {
    const id = `${instance.file}:${instance.line}:${instance.mountedPath}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  const substituted = substituteParams(route.value, params);
  const exact = instances.filter(
    instance => instance.mountedPath === route.value || instance.mountedPath === substituted
  );
  return exact.length > 0 ? exact : instances;
}

function isAbsoluteRoute(route: ResolvedString): boolean {
  return route.value.startsWith('/');
}

interface FeatureRouteInstances {
  readonly route: ResolvedString;
  readonly key?: string;
  readonly instances: readonly RoutedRoute[];
  readonly orphan: boolean;
}

export function featureRouteInstances(
  model: FeatureMapModel,
  feature: ParsedFeature
): FeatureRouteInstances[] {
  const selected = feature.routes.map(route => instancesForRoute(model, route, feature.params));
  const parentPaths = selected
    .flat()
    .filter(instance => instance.parentKeys.length === 0)
    .map(instance => instance.mountedPath);
  return feature.routes.map((route, index) => {
    const all = selected[index] ?? [];
    if (isAbsoluteRoute(route)) {
      return { route, key: keyForRoute(model, route), instances: all, orphan: false };
    }
    const nested = all.filter(instance =>
      parentPaths.some(parent => instance.mountedPath.startsWith(`${parent}/`))
    );
    return {
      route,
      key: keyForRoute(model, route),
      instances: nested,
      orphan: nested.length === 0 && all.length > 0,
    };
  });
}

export function derivedGate(instance: RoutedRoute): FeatureGate {
  const innermost = innermostGate(instance);
  return featureGates.find(gate => gate === innermost) ?? 'none';
}

export function uncoveredFeatures(model: FeatureMapModel): ParsedFeature[] {
  return model.features.filter(feature => feature.specs.length === 0);
}

export function screenFeatures(model: FeatureMapModel): ParsedFeature[] {
  return model.features.filter(feature => feature.anchor.kind !== 'behavior');
}

export function behaviorFeatures(model: FeatureMapModel): ParsedFeature[] {
  return model.features.filter(feature => feature.anchor.kind === 'behavior');
}

export function selectorObjectOf(ref: string): string {
  return ref.split('.')[0] ?? ref;
}

export function claimsByRpcHandler(model: FeatureMapModel): Map<string, ParsedFeature[]> {
  const claims = new Map<string, ParsedFeature[]>();
  function claim(name: string, feature: ParsedFeature) {
    const list = claims.get(name) ?? [];
    if (!list.includes(feature)) list.push(feature);
    claims.set(name, list);
  }
  for (const feature of model.features) {
    if (feature.anchor.kind === 'rpc') {
      for (const handler of feature.anchor.handlers) claim(handler, feature);
      continue;
    }
    const methods = new Set(
      feature.entry.flatMap(point => (point.method === undefined ? [] : [point.method]))
    );
    if (methods.size === 0) continue;
    for (const handler of model.rpcHandlers.values()) {
      if (handler.methods.some(method => methods.has(method))) claim(handler.name, feature);
    }
  }
  return claims;
}
