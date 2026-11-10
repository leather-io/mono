import { existsSync } from 'node:fs';

import { compareStrings } from '../utils/compare.js';
import { toRepoRelative } from './app-config.js';
import { type ParsedFeature, type ResolvedString } from './features-parser.js';
import {
  type FeatureMapModel,
  claimsByKey,
  claimsByRpcHandler,
  derivedGate,
  featureRouteInstances,
  firstReference,
  isNestedOnly,
  keyForRoute,
  routeRef,
  routedKeys,
  routesForKey,
  selectorObjectOf,
} from './model.js';
import { distinctMountedPaths } from './routers-parser.js';
import { specPathFor } from './test-assets.js';

interface CheckResult {
  readonly errors: readonly string[];
}

function featureLabel(feature: ParsedFeature): string {
  return `entry '${feature.id}' (${toRepoRelative(feature.file)}:${feature.line})`;
}

function featuresGlob(model: FeatureMapModel): string {
  return `${toRepoRelative(model.config.featuresDir)}/*.features.ts`;
}

function sortedEntries<T>(map: ReadonlyMap<string, T>): [string, T][] {
  return [...map.entries()].sort(([a], [b]) => compareStrings(a, b));
}

function checkUnclaimedRoutes(
  model: FeatureMapModel,
  claims: ReadonlyMap<string, readonly ParsedFeature[]>
): string[] {
  const errors: string[] = [];
  for (const key of routedKeys(model)) {
    if (claims.has(key)) continue;
    const reference = firstReference(model, key);
    const where = reference ? `${toRepoRelative(reference.file)}:${reference.line}` : 'a router';
    const ref = routeRef(model, key);
    const lines = [
      `route ${ref} ('${model.routeUrls.get(key) ?? ''}') is routed in ${where}`,
      `but no entry in ${featuresGlob(model)} claims it.`,
    ];
    if (isNestedOnly(model, key)) {
      const parents = [...new Set(routesForKey(model, key).flatMap(route => route.parentKeys))]
        .map(parent => routeRef(model, parent))
        .join(', ');
      lines.push(
        `It is nested under ${parents}: add it to the routes of the entry that claims the parent.`
      );
    } else {
      lines.push(
        `Fix: add an entry with anchor { kind: 'route' } and routes: [${ref}] to ${featuresGlob(model).replaceAll('*', '<group>')}; copy the nearest entry as a starting point.`
      );
    }
    errors.push(lines.join('\n'));
  }
  return errors;
}

function checkOverclaimedRoutes(
  model: FeatureMapModel,
  claims: ReadonlyMap<string, readonly ParsedFeature[]>
): string[] {
  const errors: string[] = [];
  for (const [key, features] of sortedEntries(claims)) {
    if (features.length < 2) continue;
    const mounted = distinctMountedPaths(routesForKey(model, key));
    const allowed = Math.max(mounted.size, 1);
    if (features.length <= allowed) continue;
    errors.push(
      [
        `route ${routeRef(model, key)} is claimed by ${features.length} entries (${features.map(feature => feature.id).join(', ')})`,
        `but routers mount it at ${allowed} path${allowed === 1 ? '' : 's'} (${[...mounted].map(path => `'${path}'`).join(', ') || 'none'}).`,
        'Fix: keep it in one entry per mounted path; a nested sheet belongs to the entry whose route mounts it.',
      ].join('\n')
    );
  }
  return errors;
}

function checkUnclaimedRpcHandlers(
  model: FeatureMapModel,
  claims: ReadonlyMap<string, readonly ParsedFeature[]>
): string[] {
  const errors: string[] = [];
  for (const [name, handler] of sortedEntries(model.rpcHandlers)) {
    if (claims.has(name)) continue;
    const methods = handler.methods.length > 0 ? handler.methods.join(', ') : 'no method found';
    errors.push(
      [
        `rpc handler ${name} (${toRepoRelative(handler.file)}, ${methods}) is claimed by no entry in ${featuresGlob(model)}.`,
        `Fix: add an entry with anchor { kind: 'rpc', handlers: ['${name}'] } for a method without a popup,`,
        "or add an entry point { kind: 'rpc', method: '<method>' } to the routed entry whose popup it opens.",
      ].join('\n')
    );
  }
  return errors;
}

function checkAnchor(model: FeatureMapModel, feature: ParsedFeature): string[] {
  const errors: string[] = [];
  const label = featureLabel(feature);
  const { anchor } = feature;
  const routeUrls = model.config.routeUrlsObjectName;
  if (anchor.kind === 'route' && feature.routes.length === 0) {
    errors.push(`${label}: a route anchor needs at least one ${routeUrls} value in routes.`);
  }
  if (anchor.kind !== 'route' && feature.routes.length > 0) {
    errors.push(
      `${label}: anchor '${anchor.kind}' must not list routes; use anchor { kind: 'route' } for a routed screen.`
    );
  }
  for (const route of feature.routes) {
    if (keyForRoute(model, route)) continue;
    errors.push(
      `${label}: route '${route.value}' is not a ${routeUrls} value. Fix: use ${routeUrls}.<Key>.`
    );
  }
  if (anchor.kind === 'selectors') {
    if (anchor.objects.length === 0) {
      errors.push(`${label}: a selectors anchor needs at least one *Selectors object or member.`);
    }
    for (const object of anchor.objects) {
      const owner = model.selectorObjects.get(selectorObjectOf(object));
      const member = object.includes('.') ? object.split('.')[1] : undefined;
      if (owner && (member === undefined || owner.members.includes(member))) continue;
      errors.push(
        `${label}: anchor object '${object}' is not an exported *Selectors object or member in ${toRepoRelative(model.config.selectorsDir)}. Fix: use one of ${[...model.selectorObjects.keys()].join(', ')}.`
      );
    }
  }
  if (anchor.kind === 'rpc') {
    if (anchor.handlers.length === 0) {
      errors.push(`${label}: an rpc anchor needs at least one handler file name.`);
    }
    for (const handler of anchor.handlers) {
      if (model.rpcHandlers.has(handler)) continue;
      errors.push(
        `${label}: anchor handler '${handler}' is not a file in ${toRepoRelative(model.config.rpcMethodsDir)}. Fix: use one of ${[...model.rpcHandlers.keys()].join(', ')}.`
      );
    }
  }
  if (feature.startRoute && !keyForRoute(model, feature.startRoute)) {
    errors.push(
      `${label}: startRoute '${feature.startRoute.value}' is not a ${routeUrls} value. Fix: use ${routeUrls}.<Key>.`
    );
  }
  if (
    anchor.kind !== 'behavior' &&
    anchor.kind !== 'rpc' &&
    feature.selectors.ready === undefined
  ) {
    errors.push(
      `${label}: selectors.ready is required for a ${anchor.kind} anchor; name the element whose presence means the screen is usable.`
    );
  }
  return errors;
}

function checkSelectorRef(
  feature: ParsedFeature,
  field: string,
  selector: ResolvedString
): string | undefined {
  if (selector.ref) return undefined;
  return `${featureLabel(feature)}: selectors.${field} '${selector.value}' must reference a *Selectors member (for example SendCryptoAssetSelectors.SendForm).`;
}

function actionError(
  model: FeatureMapModel,
  feature: ParsedFeature,
  field: string,
  action: string
): string | undefined {
  if (model.pageObjectActions.has(action)) return undefined;
  const [className] = action.split('.');
  const candidates = [...model.pageObjectActions.keys()].filter(name =>
    name.startsWith(`${className}.`)
  );
  const hint =
    candidates.length > 0
      ? `Methods of ${className}: ${candidates.map(name => name.split('.')[1]).join(', ')}.`
      : `No page object named ${className} in ${toRepoRelative(model.config.pageObjectsDir)}.`;
  return `${featureLabel(feature)}: ${field} '${action}' is not a public page-object method. ${hint} Fix: use an existing method or add one to the page object.`;
}

function checkRedundantMocks(model: FeatureMapModel, feature: ParsedFeature): string[] {
  const setup = model.setupMocks;
  if (!setup || !feature.preconditions.mocks.includes(setup.name)) return [];
  return feature.preconditions.mocks
    .filter(mock => setup.members.includes(mock))
    .map(
      mock =>
        `${featureLabel(feature)}: mock '${mock}' is already registered by ${setup.name} (${toRepoRelative(setup.file)}:${setup.line}). Fix: remove it from mocks; name it in the description if the screen depends on it.`
    );
}

function checkFeatureReferences(model: FeatureMapModel, feature: ParsedFeature): string[] {
  const errors: string[] = [];
  const label = featureLabel(feature);
  const specsDir = toRepoRelative(model.config.specsDir);
  const mocksDir = toRepoRelative(model.config.mocksDir);
  const rpcDir = toRepoRelative(model.config.rpcEndpointsDir);

  errors.push(...checkAnchor(model, feature));

  const readyError = feature.selectors.ready
    ? checkSelectorRef(feature, 'ready', feature.selectors.ready)
    : undefined;
  if (readyError) errors.push(readyError);
  for (const other of feature.selectors.others) {
    const error = checkSelectorRef(feature, 'others', other);
    if (error) errors.push(error);
  }

  for (const spec of feature.specs) {
    if (model.specs.has(spec) && existsSync(specPathFor(spec))) continue;
    errors.push(
      `${label}: spec '${spec}' does not exist. Fix: point it at a *.spec.ts under ${specsDir} or remove it.`
    );
  }

  for (const action of feature.actions) {
    const error = actionError(model, feature, 'action', action);
    if (error) errors.push(error);
  }
  for (const action of feature.open) {
    const error = actionError(model, feature, 'open action', action);
    if (error) errors.push(error);
  }

  for (const mock of feature.preconditions.mocks) {
    if (model.mocks.has(mock)) continue;
    errors.push(
      `${label}: mock '${mock}' is not exported from ${mocksDir}. Fix: use an exported mock function name or add the mock.`
    );
  }
  errors.push(...checkRedundantMocks(model, feature));

  feature.entry.forEach((point, index) => {
    if (point.method === undefined || model.rpcMethods.has(point.method)) return;
    errors.push(
      `${label}: entry[${index}].method '${point.method}' is not an RPC method defined in ${rpcDir}. Fix: use the 'method' string of a defineRpcEndpoint call.`
    );
  });

  for (const flag of feature.flags) {
    if (model.flags.includes(flag)) continue;
    errors.push(
      `${label}: flag '${flag}' is not a key of ${model.config.featureFlagsInterfaceName} in ${toRepoRelative(model.config.featureFlagsFile)}. Fix: use one of ${model.flags.join(', ')}.`
    );
  }

  return errors;
}

function checkRouteFlags(model: FeatureMapModel, feature: ParsedFeature): string[] {
  if (feature.anchor.kind !== 'route') return [];
  const errors: string[] = [];
  const reported = new Set<string>();
  for (const { key, instances } of featureRouteInstances(model, feature)) {
    for (const instance of instances) {
      for (const flag of instance.flags) {
        if (feature.flags.includes(flag) || reported.has(flag)) continue;
        reported.add(flag);
        const label = key ? routeRef(model, key) : `'${instance.mountedPath}'`;
        errors.push(
          `${featureLabel(feature)}: ${label} is mounted behind the ${flag} flag (${toRepoRelative(instance.file)}:${instance.line}) but flags does not list it. Fix: add '${flag}' to flags so verify turns it on.`
        );
      }
    }
  }
  return errors;
}

function checkGates(model: FeatureMapModel, feature: ParsedFeature): string[] {
  if (feature.anchor.kind !== 'route') return [];
  const errors: string[] = [];
  const reported = new Set<string>();
  for (const { route, key, instances, orphan } of featureRouteInstances(model, feature)) {
    if (orphan) {
      errors.push(
        `${featureLabel(feature)}: route '${route.value}' is not mounted under any of this entry's routes; it only nests under other screens. Fix: move it to the entry whose route mounts it.`
      );
      continue;
    }
    for (const instance of instances) {
      const gate = derivedGate(instance);
      if (gate === feature.gate || reported.has(gate)) continue;
      reported.add(gate);
      const label = key ? routeRef(model, key) : `'${instance.mountedPath}'`;
      errors.push(
        `${featureLabel(feature)}: gate '${feature.gate}' does not match the router: ${label} mounts at '${instance.mountedPath}' behind ${gate === 'none' ? 'no gate' : `${gate}`} (${toRepoRelative(instance.file)}:${instance.line}). Fix: set gate to '${gate}' or split the entry so each one has a single gate.`
      );
    }
  }
  return errors;
}

function checkDuplicateIds(model: FeatureMapModel): string[] {
  const seen = new Map<string, ParsedFeature>();
  const errors: string[] = [];
  for (const feature of model.features) {
    const existing = seen.get(feature.id);
    if (existing) {
      errors.push(
        `${featureLabel(feature)}: id '${feature.id}' is already used by ${toRepoRelative(existing.file)}:${existing.line}. Fix: ids must be unique.`
      );
      continue;
    }
    seen.set(feature.id, feature);
  }
  return errors;
}

function checkUnresolvedRouterPaths(model: FeatureMapModel): string[] {
  return model.router.unresolved.map(
    unresolved =>
      `router path expression at ${toRepoRelative(unresolved.file)}:${unresolved.line} could not be resolved: ${unresolved.text}. Fix: use a ${model.config.routeUrlsObjectName} member, a string literal, a template of those, or extend evaluateStringExpression in tools/src/feature-map/ts-ast.ts.`
  );
}

export function checkFeatureMap(model: FeatureMapModel): CheckResult {
  const errors: string[] = [...model.parseErrors, ...checkUnresolvedRouterPaths(model)];
  const routeClaims = claimsByKey(model);
  const rpcClaims = claimsByRpcHandler(model);

  errors.push(...checkDuplicateIds(model));
  for (const feature of model.features) {
    errors.push(...checkFeatureReferences(model, feature));
    errors.push(...checkGates(model, feature));
    errors.push(...checkRouteFlags(model, feature));
  }
  errors.push(...checkUnclaimedRoutes(model, routeClaims));
  errors.push(...checkOverclaimedRoutes(model, routeClaims));
  errors.push(...checkUnclaimedRpcHandlers(model, rpcClaims));
  return { errors };
}

function indent(text: string): string {
  return text
    .split('\n')
    .map(line => `  ${line}`)
    .join('\n');
}

export function formatCheckReport(model: FeatureMapModel, result: CheckResult): string {
  const app = toRepoRelative(model.config.appDir);
  if (result.errors.length === 0) {
    return `feature-map: ok (${model.features.length} features in ${app})`;
  }
  const count = result.errors.length === 1 ? '1 error' : `${result.errors.length} errors`;
  return `feature-map: ${count} in ${app}\n\n${result.errors.map(indent).join('\n\n')}\n`;
}
