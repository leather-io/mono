import { readFileSync } from 'node:fs';
import path from 'node:path';

import { getMonorepoRoot } from '../utils/paths.js';
import { type FeatureMapAppConfig, toRepoRelative } from './app-config.js';
import {
  type SourceLocation,
  type StringTable,
  collectClassMethods,
  collectDefinedEndpoints,
  collectExportedNames,
  collectFunctionCallees,
  collectHandlerEndpointNames,
  collectInterfaceProperties,
  collectObjectPropertyStrings,
  collectPropertyAccessReferences,
  collectStringConstObjects,
  listFiles,
  mergeStringTables,
  parseSourceFile,
} from './ts-ast.js';

export interface SpecFile {
  readonly path: string;
  readonly routeKeys: readonly string[];
}

const specFilePattern = /\.spec\.tsx?$/;
const rpcMethodProperty = 'method';
const rpcEndpointFunction = 'defineRpcEndpoint';
const rpcHandlerFunction = 'defineRpcRequestHandler';
const selectorsObjectSuffix = 'Selectors';

export interface SelectorObject extends SourceLocation {
  readonly name: string;
  readonly members: readonly string[];
}

export interface RpcHandler extends SourceLocation {
  readonly name: string;
  readonly methods: readonly string[];
}

export function loadRouteUrls(config: FeatureMapAppConfig): Map<string, string> {
  const sourceFile = parseSourceFile(config.routeUrlsFile);
  const table = collectStringConstObjects(sourceFile);
  const values = table.get(config.routeUrlsObjectName);
  if (!values) {
    throw new Error(
      `feature-map: ${toRepoRelative(config.routeUrlsFile)} does not export a '${config.routeUrlsObjectName}' object`
    );
  }
  return values;
}

export function loadSelectorTable(config: FeatureMapAppConfig): StringTable {
  const files = listFiles(config.selectorsDir, file => file.endsWith('.ts'));
  return mergeStringTables(files.map(file => collectStringConstObjects(parseSourceFile(file))));
}

export function loadSelectorObjects(config: FeatureMapAppConfig): Map<string, SelectorObject> {
  const objects = new Map<string, SelectorObject>();
  for (const file of listFiles(config.selectorsDir, file => file.endsWith('.ts'))) {
    const sourceFile = parseSourceFile(file);
    const table = collectStringConstObjects(sourceFile);
    for (const [name, line] of collectExportedNames(sourceFile)) {
      const members = table.get(name);
      if (!members || !name.endsWith(selectorsObjectSuffix)) continue;
      objects.set(name, { name, file, line, members: [...members.keys()] });
    }
  }
  return objects;
}

export function loadRpcEndpointNames(config: FeatureMapAppConfig): Map<string, string> {
  const endpoints = new Map<string, string>();
  for (const file of listFiles(config.rpcEndpointsDir, file => file.endsWith('.ts'))) {
    const defined = collectDefinedEndpoints(
      parseSourceFile(file),
      rpcEndpointFunction,
      rpcMethodProperty
    );
    for (const [name, method] of defined) endpoints.set(name, method);
  }
  return endpoints;
}

export function loadRpcHandlers(config: FeatureMapAppConfig): Map<string, RpcHandler> {
  const handlers = new Map<string, RpcHandler>();
  if (config.rpcMethodsDir === undefined) return handlers;
  const endpoints = loadRpcEndpointNames(config);
  const files = listFiles(
    config.rpcMethodsDir,
    file => file.endsWith('.ts') && !specFilePattern.test(file)
  );
  for (const file of files) {
    const name = path.basename(file, '.ts');
    const methods = collectHandlerEndpointNames(
      parseSourceFile(file),
      rpcHandlerFunction,
      rpcMethodProperty
    )
      .map(endpoint => endpoints.get(endpoint))
      .filter(method => method !== undefined);
    handlers.set(name, { name, file, line: 1, methods });
  }
  return handlers;
}

export interface PageObjectAction extends SourceLocation {
  readonly className: string;
  readonly requiredParameters: number;
  readonly isStatic: boolean;
}

export function loadPageObjectActions(config: FeatureMapAppConfig): Map<string, PageObjectAction> {
  const actions = new Map<string, PageObjectAction>();
  if (config.pageObjectsDir === undefined) return actions;
  for (const file of listFiles(config.pageObjectsDir, file => file.endsWith('.ts'))) {
    for (const [className, methods] of collectClassMethods(parseSourceFile(file))) {
      for (const [method, info] of methods) {
        actions.set(`${className}.${method}`, {
          file,
          line: info.line,
          className,
          requiredParameters: info.requiredParameters,
          isStatic: info.isStatic,
        });
      }
    }
  }
  return actions;
}

export function loadMockFunctions(config: FeatureMapAppConfig): Map<string, SourceLocation> {
  const mocks = new Map<string, SourceLocation>();
  if (config.mocksDir === undefined) return mocks;
  for (const file of listFiles(config.mocksDir, file => file.endsWith('.ts'))) {
    for (const [name, line] of collectExportedNames(parseSourceFile(file))) {
      mocks.set(name, { file, line });
    }
  }
  return mocks;
}

export interface SetupMocks extends SourceLocation {
  readonly name: string;
  readonly members: readonly string[];
}

export function loadSetupMocks(
  config: FeatureMapAppConfig,
  mocks: ReadonlyMap<string, SourceLocation>
): SetupMocks | undefined {
  const name = config.setupMocksFunctionName;
  if (name === undefined) return undefined;
  const location = mocks.get(name);
  if (!location) return undefined;
  const calls = collectFunctionCallees(parseSourceFile(location.file), name);
  if (!calls) return undefined;
  const members = [...new Set(calls.callees)].filter(
    callee => callee !== name && mocks.has(callee)
  );
  return { name, file: location.file, line: location.line, members };
}

export function loadSpecs(config: FeatureMapAppConfig): Map<string, SpecFile> {
  const specs = new Map<string, SpecFile>();
  for (const file of listFiles(config.specsDir, file => specFilePattern.test(file))) {
    const sourceFile = parseSourceFile(file);
    const relative = toRepoRelative(file);
    specs.set(relative, {
      path: relative,
      routeKeys: collectPropertyAccessReferences(sourceFile, config.routeUrlsObjectName).map(
        reference => reference.key
      ),
    });
  }
  return specs;
}

export function loadFeatureFlags(config: FeatureMapAppConfig): string[] {
  if (config.featureFlagsInterfaceName === undefined) return [];
  return collectInterfaceProperties(
    parseSourceFile(config.featureFlagsFile),
    config.featureFlagsInterfaceName
  );
}

export function loadRpcMethods(config: FeatureMapAppConfig): Set<string> {
  const methods = new Set<string>();
  for (const file of listFiles(config.rpcEndpointsDir, file => file.endsWith('.ts'))) {
    for (const method of collectObjectPropertyStrings(parseSourceFile(file), rpcMethodProperty)) {
      methods.add(method);
    }
  }
  return methods;
}

const routeElementPattern = /<Routes?[\s>/]/;
const routeGroupFilePattern = /routes\.tsx$/;

function isRouterFile(file: string): boolean {
  if (routeGroupFilePattern.test(file)) return true;
  return routeElementPattern.test(readFileSync(file, 'utf8'));
}

export function loadRouterFiles(config: FeatureMapAppConfig): string[] {
  const excluded = new Set(config.routerExcludeFiles);
  const files = config.routerScanDirs.flatMap(dir =>
    listFiles(
      dir,
      file => file.endsWith('.tsx') && !specFilePattern.test(file) && !excluded.has(file)
    )
  );
  return files.filter(isRouterFile).sort();
}

export function loadFeatureFiles(config: FeatureMapAppConfig): string[] {
  return listFiles(config.featuresDir, file => file.endsWith('.features.ts'));
}

export function specPathFor(spec: string): string {
  return path.join(getMonorepoRoot(), spec);
}
