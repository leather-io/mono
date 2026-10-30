import { existsSync, readFileSync } from 'node:fs';
import ts from 'typescript';

import {
  type RouteReference,
  type RoutedRoute,
  type RouterModel,
  createImportResolver,
} from './routers-parser.js';
import {
  type StringTable,
  evaluateStringExpression,
  getLine,
  hasExportModifier,
  parseSourceFile,
  readStringObjectLiteral,
  unwrapExpression,
} from './ts-ast.js';

export interface RouteConfigOptions {
  readonly objectName: string;
  readonly layoutGates: Readonly<Record<string, string>>;
  readonly conditionFlags: Readonly<Record<string, string>>;
}

type RouteConfigNodeKind = 'route' | 'index' | 'layout' | 'prefix';

interface RouteConfigNode {
  readonly kind: RouteConfigNodeKind;
  readonly path?: string;
  readonly module?: string;
  readonly children: readonly RouteConfigNode[];
  readonly file: string;
  readonly line: number;
  readonly flags: readonly string[];
}

interface UnresolvedRouteConfig {
  readonly file: string;
  readonly line: number;
  readonly text: string;
}

interface FileScope {
  readonly sourceFile: ts.SourceFile;
  readonly imports: ReadonlyMap<string, string>;
  readonly locals: ReadonlyMap<string, ts.Expression>;
}

type ImportResolver = ReturnType<typeof createImportResolver>;

interface EvaluationState {
  readonly options: RouteConfigOptions;
  readonly imports: ImportResolver;
  readonly scopes: Map<string, FileScope>;
  readonly unresolved: UnresolvedRouteConfig[];
}

const routeFunction = 'route';
const indexFunction = 'index';
const layoutFunction = 'layout';
const prefixFunction = 'prefix';
const mapMethod = 'map';
const rootPath = '/';

function collectFileScope(sourceFile: ts.SourceFile): FileScope {
  const imports = new Map<string, string>();
  const locals = new Map<string, ts.Expression>();
  for (const statement of sourceFile.statements) {
    if (
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      statement.importClause?.namedBindings &&
      ts.isNamedImports(statement.importClause.namedBindings)
    ) {
      for (const element of statement.importClause.namedBindings.elements) {
        imports.set(element.name.text, statement.moduleSpecifier.text);
      }
    }
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && declaration.initializer) {
          locals.set(declaration.name.text, declaration.initializer);
        }
      }
    }
  }
  return { sourceFile, imports, locals };
}

function scopeFor(sourceFile: ts.SourceFile, state: EvaluationState): FileScope {
  const existing = state.scopes.get(sourceFile.fileName);
  if (existing) return existing;
  const scope = collectFileScope(sourceFile);
  state.scopes.set(sourceFile.fileName, scope);
  return scope;
}

function findExportedInitializer(
  sourceFile: ts.SourceFile,
  name: string
): ts.Expression | undefined {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement) || !hasExportModifier(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === name) {
        return declaration.initializer;
      }
    }
  }
  return undefined;
}

function findDefaultExport(sourceFile: ts.SourceFile): ts.Expression | undefined {
  for (const statement of sourceFile.statements) {
    if (ts.isExportAssignment(statement) && !statement.isExportEquals) return statement.expression;
  }
  return undefined;
}

interface EvaluationContext {
  readonly scope: FileScope;
  readonly table: StringTable;
  readonly flags: readonly string[];
}

function fail(node: ts.Node, context: EvaluationContext, state: EvaluationState): never[] {
  state.unresolved.push({
    file: context.scope.sourceFile.fileName,
    line: getLine(context.scope.sourceFile, node),
    text: node.getText(),
  });
  return [];
}

function readString(
  node: ts.Expression | undefined,
  context: EvaluationContext,
  state: EvaluationState
): string | undefined {
  if (!node) return undefined;
  const evaluated = evaluateStringExpression(node, context.table);
  if (evaluated) return evaluated.value;
  fail(node, context, state);
  return undefined;
}

function isOptionsArgument(node: ts.Expression): boolean {
  return ts.isObjectLiteralExpression(unwrapExpression(node));
}

function evaluateChildren(
  candidates: readonly ts.Expression[],
  context: EvaluationContext,
  state: EvaluationState
): RouteConfigNode[] {
  return candidates
    .filter(candidate => !isOptionsArgument(candidate))
    .flatMap(candidate => evaluateEntries(candidate, context, state));
}

function makeNode(
  kind: RouteConfigNodeKind,
  node: ts.Node,
  context: EvaluationContext,
  fields: { path?: string; module?: string; children: readonly RouteConfigNode[] }
): RouteConfigNode {
  return {
    kind,
    path: fields.path,
    module: fields.module,
    children: fields.children,
    file: context.scope.sourceFile.fileName,
    line: getLine(context.scope.sourceFile, node),
    flags: context.flags,
  };
}

function evaluateRouteCall(
  call: ts.CallExpression,
  name: string,
  context: EvaluationContext,
  state: EvaluationState
): RouteConfigNode[] {
  const [first, second, ...rest] = call.arguments;
  if (name === indexFunction) {
    const module = readString(first, context, state);
    if (module === undefined) return [];
    return [makeNode('index', call, context, { module, children: [] })];
  }
  if (name === routeFunction) {
    const path = readString(first, context, state);
    const module = readString(second, context, state);
    if (path === undefined || module === undefined) return [];
    const children = evaluateChildren(rest, context, state);
    return [makeNode('route', call, context, { path, module, children })];
  }
  if (name === layoutFunction) {
    const module = readString(first, context, state);
    if (module === undefined) return [];
    const children = evaluateChildren(second ? [second, ...rest] : rest, context, state);
    return [makeNode('layout', call, context, { module, children })];
  }
  if (name === prefixFunction) {
    const path = readString(first, context, state);
    if (path === undefined) return [];
    const children = evaluateChildren(second ? [second, ...rest] : rest, context, state);
    return [makeNode('prefix', call, context, { path, children })];
  }
  return fail(call, context, state);
}

function resolveObjectArray(
  node: ts.Expression,
  context: EvaluationContext,
  state: EvaluationState
): ts.ObjectLiteralExpression[] | undefined {
  const expression = unwrapExpression(node);
  if (ts.isArrayLiteralExpression(expression)) {
    return expression.elements.map(unwrapExpression).filter(ts.isObjectLiteralExpression);
  }
  if (!ts.isIdentifier(expression)) return undefined;
  const resolved = resolveIdentifier(expression, context, state);
  if (!resolved) return undefined;
  return resolveObjectArray(resolved.initializer, { ...context, scope: resolved.scope }, state);
}

interface ResolvedIdentifier {
  readonly initializer: ts.Expression;
  readonly scope: FileScope;
}

function resolveIdentifier(
  identifier: ts.Identifier,
  context: EvaluationContext,
  state: EvaluationState
): ResolvedIdentifier | undefined {
  const local = context.scope.locals.get(identifier.text);
  if (local) return { initializer: local, scope: context.scope };
  const specifier = context.scope.imports.get(identifier.text);
  if (specifier === undefined) return undefined;
  const sourceFile = state.imports.resolve(specifier, context.scope.sourceFile.fileName);
  if (!sourceFile) return undefined;
  const initializer = findExportedInitializer(sourceFile, identifier.text);
  if (!initializer) return undefined;
  return { initializer, scope: scopeFor(sourceFile, state) };
}

function evaluateMapCall(
  call: ts.CallExpression,
  context: EvaluationContext,
  state: EvaluationState
): RouteConfigNode[] {
  if (!ts.isPropertyAccessExpression(call.expression)) return fail(call, context, state);
  const callback = call.arguments[0];
  const elements = resolveObjectArray(call.expression.expression, context, state);
  if (
    !elements ||
    !callback ||
    !(ts.isArrowFunction(callback) || ts.isFunctionExpression(callback)) ||
    !ts.isExpression(callback.body)
  ) {
    return fail(call, context, state);
  }
  const parameter = callback.parameters[0]?.name;
  if (!parameter || !ts.isIdentifier(parameter)) return fail(call, context, state);
  const body = callback.body;
  return elements.flatMap(element => {
    const table: StringTable = new Map(context.table);
    table.set(parameter.text, readStringObjectLiteral(element));
    return evaluateEntries(body, { ...context, table }, state);
  });
}

function evaluateConditional(
  conditional: ts.ConditionalExpression,
  context: EvaluationContext,
  state: EvaluationState
): RouteConfigNode[] {
  const flag = state.options.conditionFlags[conditional.condition.getText()];
  if (flag === undefined) fail(conditional.condition, context, state);
  const whenTrue = evaluateEntries(
    conditional.whenTrue,
    flag === undefined ? context : { ...context, flags: [...context.flags, flag] },
    state
  );
  return [...whenTrue, ...evaluateEntries(conditional.whenFalse, context, state)];
}

function evaluateEntries(
  node: ts.Expression,
  context: EvaluationContext,
  state: EvaluationState
): RouteConfigNode[] {
  const expression = unwrapExpression(node);
  if (ts.isArrayLiteralExpression(expression)) {
    return expression.elements.flatMap(element =>
      ts.isSpreadElement(element)
        ? evaluateEntries(element.expression, context, state)
        : evaluateEntries(element, context, state)
    );
  }
  if (ts.isCallExpression(expression)) {
    if (ts.isIdentifier(expression.expression)) {
      return evaluateRouteCall(expression, expression.expression.text, context, state);
    }
    if (
      ts.isPropertyAccessExpression(expression.expression) &&
      expression.expression.name.text === mapMethod
    ) {
      return evaluateMapCall(expression, context, state);
    }
    return fail(expression, context, state);
  }
  if (ts.isIdentifier(expression)) {
    const resolved = resolveIdentifier(expression, context, state);
    if (!resolved) return fail(expression, context, state);
    return evaluateEntries(resolved.initializer, { ...context, scope: resolved.scope }, state);
  }
  if (ts.isConditionalExpression(expression)) {
    return evaluateConditional(expression, context, state);
  }
  return fail(expression, context, state);
}

function joinPath(parent: string, own: string): string {
  if (own.startsWith('/')) return own;
  if (own === '') return parent;
  if (parent === '' || parent === rootPath) return `/${own}`;
  return `${parent}/${own}`;
}

interface FlattenContext {
  readonly parentPath: string;
  readonly gates: readonly string[];
  readonly parentKeys: readonly string[];
}

interface FlattenState {
  readonly table: StringTable;
  readonly options: RouteConfigOptions;
  readonly routes: RoutedRoute[];
}

function keysWithValue(state: FlattenState, value: string): string[] {
  const values = state.table.get(state.options.objectName);
  if (!values) return [];
  return [...values.entries()].filter(([, candidate]) => candidate === value).map(([key]) => key);
}

function pushRoute(
  node: RouteConfigNode,
  mountedPath: string,
  isIndex: boolean,
  context: FlattenContext,
  state: FlattenState
): string[] {
  const keys = keysWithValue(state, mountedPath);
  state.routes.push({
    file: node.file,
    line: node.line,
    keys,
    path: node.path ?? '',
    mountedPath,
    gates: context.gates,
    flags: node.flags,
    parentKeys: context.parentKeys,
    isIndex,
    module: node.module,
  });
  return keys;
}

function flatten(
  nodes: readonly RouteConfigNode[],
  context: FlattenContext,
  state: FlattenState
): void {
  for (const node of nodes) {
    const ownPath = node.path ?? '';
    if (node.kind === 'prefix') {
      flatten(
        node.children,
        { ...context, parentPath: joinPath(context.parentPath, ownPath) },
        state
      );
      continue;
    }
    if (node.kind === 'layout') {
      const gate = node.module === undefined ? undefined : state.options.layoutGates[node.module];
      flatten(
        node.children,
        { ...context, gates: gate === undefined ? context.gates : [...context.gates, gate] },
        state
      );
      continue;
    }
    if (node.kind === 'index') {
      pushRoute(node, context.parentPath || rootPath, true, context, state);
      continue;
    }
    const mountedPath = joinPath(context.parentPath, ownPath);
    const keys = pushRoute(node, mountedPath, false, context, state);
    flatten(
      node.children,
      { ...context, parentPath: mountedPath, parentKeys: [...context.parentKeys, ...keys] },
      state
    );
  }
}

const rootFlattenContext: FlattenContext = { parentPath: '', gates: [], parentKeys: [] };

export function parseRouteConfig(
  file: string,
  text: string,
  table: StringTable,
  options: RouteConfigOptions,
  imports: ImportResolver
): RouterModel {
  const sourceFile = parseSourceFile(file, text);
  const state: EvaluationState = { options, imports, scopes: new Map(), unresolved: [] };
  const scope = scopeFor(sourceFile, state);
  const context: EvaluationContext = { scope, table, flags: [] };
  const defaultExport = findDefaultExport(sourceFile);
  const nodes = defaultExport ? evaluateEntries(defaultExport, context, state) : [];
  if (!defaultExport) {
    state.unresolved.push({ file, line: 1, text: 'no default export of route config entries' });
  }

  const routes: RoutedRoute[] = [];
  flatten(nodes, rootFlattenContext, { table, options, routes });

  const references = new Map<string, RouteReference[]>();
  for (const route of routes) {
    for (const key of route.keys) {
      const list = references.get(key) ?? [];
      list.push({ key, file: route.file, line: route.line });
      references.set(key, list);
    }
  }
  return { routes, references, unresolved: state.unresolved };
}

function readFromDisk(file: string): string | undefined {
  return existsSync(file) ? readFileSync(file, 'utf8') : undefined;
}

export function parseRouteConfigFile(
  file: string,
  table: StringTable,
  options: RouteConfigOptions,
  aliases: Readonly<Record<string, string>> = {}
): RouterModel {
  return parseRouteConfig(
    file,
    readFileSync(file, 'utf8'),
    table,
    options,
    createImportResolver(aliases, readFromDisk)
  );
}
