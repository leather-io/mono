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
  collectObjectLiteralKeys,
  collectObjectLiteralStringPairs,
  collectPropertyAccessReferences,
  collectStringArrayConsts,
  collectStringConstObjects,
  listFiles,
  mergeStringTables,
  parseFilesIn,
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

function isTsFile(file: string): boolean {
  return file.endsWith('.ts');
}

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

interface SelectorAssets {
  readonly table: StringTable;
  readonly objects: ReadonlyMap<string, SelectorObject>;
}

export function loadSelectors(config: FeatureMapAppConfig): SelectorAssets {
  const tables: StringTable[] = [];
  const objects = new Map<string, SelectorObject>();
  for (const sourceFile of parseFilesIn(config.selectorsDir, isTsFile)) {
    const table = collectStringConstObjects(sourceFile);
    tables.push(table);
    for (const [name, line] of collectExportedNames(sourceFile)) {
      const members = table.get(name);
      if (!members || !name.endsWith(selectorsObjectSuffix)) continue;
      objects.set(name, { name, file: sourceFile.fileName, line, members: [...members.keys()] });
    }
  }
  return { table: mergeStringTables(tables), objects };
}

export function loadRpcEndpoints(config: FeatureMapAppConfig): Map<string, string> {
  const endpoints = new Map<string, string>();
  for (const sourceFile of parseFilesIn(config.rpcEndpointsDir, isTsFile)) {
    const defined = collectDefinedEndpoints(sourceFile, rpcEndpointFunction, rpcMethodProperty);
    for (const [name, method] of defined) endpoints.set(name, method);
  }
  return endpoints;
}

export function loadRpcHandlers(
  config: FeatureMapAppConfig,
  endpoints: ReadonlyMap<string, string>
): Map<string, RpcHandler> {
  const handlers = new Map<string, RpcHandler>();
  const sourceFiles = parseFilesIn(
    config.rpcMethodsDir,
    file => isTsFile(file) && !specFilePattern.test(file)
  );
  for (const sourceFile of sourceFiles) {
    const name = path.basename(sourceFile.fileName, '.ts');
    const methods = collectHandlerEndpointNames(sourceFile, rpcHandlerFunction, rpcMethodProperty)
      .map(endpoint => endpoints.get(endpoint))
      .filter(method => method !== undefined);
    handlers.set(name, { name, file: sourceFile.fileName, line: 1, methods });
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
  for (const sourceFile of parseFilesIn(config.pageObjectsDir, isTsFile)) {
    for (const [className, methods] of collectClassMethods(sourceFile)) {
      for (const [method, info] of methods) {
        actions.set(`${className}.${method}`, {
          file: sourceFile.fileName,
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
  for (const sourceFile of parseFilesIn(config.mocksDir, isTsFile)) {
    for (const [name, line] of collectExportedNames(sourceFile)) {
      mocks.set(name, { file: sourceFile.fileName, line });
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
  for (const sourceFile of parseFilesIn(config.specsDir, file => specFilePattern.test(file))) {
    const relative = toRepoRelative(sourceFile.fileName);
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
  return collectInterfaceProperties(
    parseSourceFile(config.featureFlagsFile),
    config.featureFlagsInterfaceName
  );
}

const verifyMockObjectNames = ['contextMocks', 'pageMocks'] as const;
const verifyBaseMocksName = 'baseMockNames';

export function loadVerifyMockNames(config: FeatureMapAppConfig): Set<string> {
  const sourceFile = parseSourceFile(config.verifyMockRegistryFile);
  const names = new Set(collectStringArrayConsts(sourceFile).get(verifyBaseMocksName) ?? []);
  for (const objectName of verifyMockObjectNames) {
    const keys = collectObjectLiteralKeys(sourceFile, objectName);
    if (keys === undefined) {
      throw new Error(
        `feature-map: ${toRepoRelative(config.verifyMockRegistryFile)} does not define an object literal '${objectName}'`
      );
    }
    for (const key of keys) names.add(key);
  }
  return names;
}

export function loadPersistedSliceKeys(config: FeatureMapAppConfig): string[] {
  const arrays = collectStringArrayConsts(parseSourceFile(config.persistWhitelistFile));
  const slices = arrays.get(config.persistWhitelistName);
  if (!slices) {
    throw new Error(
      `feature-map: ${toRepoRelative(config.persistWhitelistFile)} does not define a string array '${config.persistWhitelistName}'`
    );
  }
  return slices;
}

export function loadNetworkIds(config: FeatureMapAppConfig): string[] {
  const table = collectStringConstObjects(parseSourceFile(config.networkIdsFile));
  const ids = table.get(config.networkIdsObjectName);
  if (!ids) {
    throw new Error(
      `feature-map: ${toRepoRelative(config.networkIdsFile)} does not export a '${config.networkIdsObjectName}' object`
    );
  }
  return [...ids.values()];
}

const catalogIdProperty = 'id';

export function loadRpcCatalog(config: FeatureMapAppConfig): Map<string, string> {
  const catalog = new Map<string, string>();
  const files = listFiles(
    config.rpcCatalogDir,
    file => file.endsWith('.ts') && !specFilePattern.test(file)
  );
  for (const file of files) {
    const pairs = collectObjectLiteralStringPairs(
      parseSourceFile(file),
      catalogIdProperty,
      rpcMethodProperty
    );
    for (const [id, method] of pairs) if (!catalog.has(id)) catalog.set(id, method);
  }
  return catalog;
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

export interface VerifyInputs {
  readonly persistedSlices: readonly string[];
  readonly networkIds: readonly string[];
  readonly rpcCatalog: ReadonlyMap<string, string>;
  readonly verifyMocks: ReadonlySet<string>;
}

export function loadVerifyInputs(config: FeatureMapAppConfig): VerifyInputs {
  return {
    persistedSlices: loadPersistedSliceKeys(config),
    networkIds: loadNetworkIds(config),
    rpcCatalog: loadRpcCatalog(config),
    verifyMocks: loadVerifyMockNames(config),
  };
}

export function loadFeatureFiles(config: FeatureMapAppConfig): string[] {
  return listFiles(config.featuresDir, file => file.endsWith('.features.ts'));
}

export function specPathFor(spec: string): string {
  return path.join(getMonorepoRoot(), spec);
}
