import { compareStrings } from '../utils/compare.js';
import { toRepoRelative } from './app-config.js';
import { type ParsedFeature, type ResolvedString } from './features-parser.js';
import {
  type FeatureMapModel,
  behaviorFeatures,
  claimsByKey,
  claimsByRpcHandler,
  featureRouteInstances,
  firstReference,
  routeRef,
  routedKeys,
  screenFeatures,
  uncoveredFeatures,
  unkeyedRoutes,
  unroutedKeys,
} from './model.js';
import { type RoutedRoute } from './routers-parser.js';

const catchAllPath = '*';

function code(text: string): string {
  return `\`${text}\``;
}

export function cell(text: string): string {
  return text.replaceAll('\\', '\\\\').replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function location(file: string, line: number): string {
  return `${toRepoRelative(file)}:${line}`;
}

function joinOrDash(items: readonly string[]): string {
  return items.length > 0 ? items.join(', ') : '—';
}

function table(headers: readonly string[], rows: readonly (readonly string[])[]): string[] {
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map(row => `| ${row.map(cell).join(' | ')} |`),
  ];
}

function routerCell(instance: RoutedRoute): string {
  const declared = code(location(instance.file, instance.line));
  if (instance.module === undefined) return declared;
  return `${declared} → ${code(instance.module)}`;
}

function routeRows(model: FeatureMapModel, feature: ParsedFeature): string[][] {
  const rows: string[][] = [];
  for (const { route, key, instances } of featureRouteInstances(model, feature)) {
    const label = key ? code(routeRef(model, key)) : code(route.value);
    for (const instance of instances) {
      rows.push([
        label,
        code(route.value),
        code(instance.mountedPath),
        joinOrDash(instance.gates),
        joinOrDash(instance.flags),
        routerCell(instance),
      ]);
    }
    if (instances.length === 0) {
      const reference = key ? firstReference(model, key) : undefined;
      rows.push([
        label,
        code(route.value),
        '—',
        '—',
        '—',
        reference
          ? `referenced at ${code(location(reference.file, reference.line))}`
          : 'not routed',
      ]);
    }
  }
  return rows;
}

function selectorLine(model: FeatureMapModel, selector: ResolvedString): string {
  if (!selector.ref) return code(selector.value);
  return `${code(selector.ref)} → ${code(selector.value)}`;
}

function anchorLabel(feature: ParsedFeature): string {
  const { anchor } = feature;
  if (anchor.kind === 'selectors') return `selectors (${anchor.objects.map(code).join(', ')})`;
  if (anchor.kind === 'rpc') return `rpc (${anchor.handlers.map(code).join(', ')})`;
  return anchor.kind;
}

function openedByLines(model: FeatureMapModel, feature: ParsedFeature): string[] {
  const lines = ['**Opened by**', ''];
  if (feature.anchor.kind !== 'behavior') {
    lines.push(`- start route: ${code(feature.startRoute?.value ?? '/')}`);
  }
  if (feature.open.length === 0) {
    lines.push('- open: no page-object action reveals it; follow the entry steps');
  }
  for (const action of feature.open) {
    const found = model.pageObjectActions.get(action);
    lines.push(
      `- open: ${code(action)}${found ? ` (${code(location(found.file, found.line))})` : ''}`
    );
  }
  lines.push('');
  return lines;
}

function renderFeature(model: FeatureMapModel, feature: ParsedFeature): string[] {
  const lines: string[] = [];
  lines.push(`### ${feature.id}`, '', feature.description, '');
  lines.push(
    ...table(
      ['Field', 'Value'],
      [
        ['Group', `${code(feature.group)} (${code(location(feature.file, feature.line))})`],
        ['Anchor', anchorLabel(feature)],
        ['Gate', feature.gate],
        ['Flags', joinOrDash(feature.flags.map(code))],
        ['Session', feature.preconditions.session],
        ['Network', feature.preconditions.network ?? '—'],
        ['Account type', feature.preconditions.accountType ?? '—'],
      ]
    ),
    ''
  );

  if (feature.anchor.kind === 'route') {
    lines.push('**Routes**', '');
    lines.push(
      ...table(
        ['Key', 'Value', 'Mounted at', 'Gate', 'Flags', 'Router'],
        routeRows(model, feature)
      ),
      ''
    );
  } else {
    lines.push(...openedByLines(model, feature));
  }

  if (feature.params.length > 0) {
    lines.push('**Params**', '');
    for (const param of feature.params)
      lines.push(`- ${code(param.name)} = ${code(param.example)}`);
    lines.push('');
  }

  lines.push('**Entry**', '');
  feature.entry.forEach((point, index) => {
    const method = point.method ? ` (${code(point.method)})` : '';
    lines.push(`${index + 1}. ${point.kind}${method}: ${point.steps.join(' → ')}`);
  });
  if (!feature.deepLinkable) {
    lines.push(
      'Not deep-linkable: the screen reads router state the previous screen passes, so a bare URL redirects or fails; reproduce it through its specs.'
    );
  }
  lines.push('');

  lines.push('**Preconditions**', '');
  lines.push(`- session: ${feature.preconditions.session}`);
  if (feature.preconditions.network) lines.push(`- network: ${feature.preconditions.network}`);
  if (feature.preconditions.accountType)
    lines.push(`- account type: ${feature.preconditions.accountType}`);
  for (const mock of feature.preconditions.mocks) {
    const found = model.mocks.get(mock);
    lines.push(
      `- mock ${code(mock)}${found ? ` (${code(location(found.file, found.line))})` : ''}`
    );
  }
  lines.push('');

  if (feature.selectors.ready || feature.selectors.others.length > 0) {
    lines.push('**Selectors**', '');
    if (feature.selectors.ready) {
      lines.push(`- ready: ${selectorLine(model, feature.selectors.ready)}`);
    }
    for (const other of feature.selectors.others) lines.push(`- ${selectorLine(model, other)}`);
    lines.push('');
  }

  if (feature.actions.length > 0) {
    lines.push('**Actions**', '');
    for (const action of feature.actions) {
      const found = model.pageObjectActions.get(action);
      lines.push(`- ${code(action)}${found ? ` (${code(location(found.file, found.line))})` : ''}`);
    }
    lines.push('');
  }

  if (feature.specs.length > 0) {
    lines.push('**Specs**', '');
    for (const spec of feature.specs) lines.push(`- ${code(spec)}`);
    lines.push('');
  }

  return lines;
}

export function renderFeatureMap(model: FeatureMapModel): string {
  const { app } = model.config;
  const claims = claimsByKey(model);
  const routed = routedKeys(model);
  const claimedRouted = routed.filter(key => claims.has(key));
  const rpcClaims = claimsByRpcHandler(model);
  const claimedHandlers = [...model.rpcHandlers.keys()].filter(name => rpcClaims.has(name));
  const rpcCoverage =
    model.config.rpcMethodsDir === undefined
      ? ''
      : ` and ${claimedHandlers.length} of ${model.rpcHandlers.size} rpc handlers`;
  const lines: string[] = [];

  lines.push(
    `# ${app} feature map`,
    '',
    `Generated by \`pnpm lt feature-map generate --app ${app}\` from \`${toRepoRelative(model.config.featuresDir)}/*.features.ts\`. The file is gitignored: change a source file and run the generator instead of editing it.`,
    '',
    'Find a feature by its route key, by a selector or by searching the descriptions for what the screen shows. Each feature lists the covering specs and the page-object actions that own the readiness waits, which is the fastest path to a reproduction.',
    '',
    `Proofread entries when their tests change: the check validates every reference but not the prose, so whenever a spec, page object, mock or selector under ${toRepoRelative(model.config.specsDir).replace(/\/specs$/, '')} changes, re-read the entries that cite it and fix their steps, preconditions and description.`,
    '',
    `Coverage: ${model.features.length} features claim ${claimedRouted.length} of ${routed.length} routed \`${model.config.routeUrlsObjectName}\` keys${rpcCoverage}; ${uncoveredFeatures(model).length} features have no covering spec.`,
    '',
    'Anchors: a `route` entry is reached by URL; a `selectors` entry is a dialog or sheet with no URL, opened by the listed page-object action; an `rpc` entry is a dApp method whose handler opens no approver of its own; a `behavior` entry has no screen and is documented under Behaviors.',
    '',
    '## Features',
    ''
  );

  for (const feature of screenFeatures(model)) lines.push(...renderFeature(model, feature));

  const behaviors = behaviorFeatures(model);
  lines.push('## Behaviors', '');
  lines.push(
    'Entries with no screen of their own: what the wallet does rather than what it shows. Reproduce them through their specs.',
    ''
  );
  for (const feature of behaviors) lines.push(...renderFeature(model, feature));
  if (behaviors.length === 0) lines.push('None.', '');

  const uncovered = uncoveredFeatures(model);
  lines.push('## Uncovered screens', '');
  lines.push(
    'Features with no covering spec. A reproduction for these starts from the entry steps alone; adding a spec removes the feature from this list.',
    ''
  );
  for (const feature of uncovered) {
    const routes = feature.routes.map(route => code(route.ref ?? route.value)).join(', ');
    lines.push(`- ${feature.id} (${routes || feature.anchor.kind})`);
  }
  if (uncovered.length === 0) lines.push('None.');
  lines.push('');

  const unrouted = unroutedKeys(model);
  lines.push(`## ${model.config.routeUrlsObjectName} keys no router references`, '');
  for (const key of unrouted) {
    const value = model.routeUrls.get(key);
    if (value === undefined) continue;
    lines.push(`- ${code(routeRef(model, key))} (${code(value)})`);
  }
  lines.push('');

  lines.push(`## Router paths without a ${model.config.routeUrlsObjectName} key`, '');
  lines.push(
    'Mounted by routers as string literals. A feature claims one by claiming the key whose value equals the mounted path, or describes it in the parent entry.',
    ''
  );
  const unkeyed = unkeyedRoutes(model)
    .filter(route => route.path !== catchAllPath)
    .sort((a, b) => compareStrings(a.mountedPath, b.mountedPath) || compareStrings(a.file, b.file));
  lines.push(
    ...table(
      ['Mounted at', 'Gate', 'Router'],
      unkeyed.map(route => [
        code(route.mountedPath),
        joinOrDash(route.gates),
        code(location(route.file, route.line)),
      ])
    ),
    ''
  );

  return lines.join('\n');
}
