import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import {
  type EvaluatedString,
  type StringTable,
  evaluateStringExpression,
  getLine,
  getPropertyName,
  hasExportModifier,
  parseSourceFile,
  unwrapExpression,
} from './ts-ast.js';

export interface RoutedRoute {
  readonly file: string;
  readonly line: number;
  readonly keys: readonly string[];
  readonly path: string;
  readonly mountedPath: string;
  readonly gates: readonly string[];
  readonly flags: readonly string[];
  readonly parentKeys: readonly string[];
  readonly isIndex: boolean;
}

export interface RouteReference {
  readonly key: string;
  readonly file: string;
  readonly line: number;
}

interface UnresolvedRoutePath {
  readonly file: string;
  readonly line: number;
  readonly text: string;
}

export interface RouterModel {
  readonly routes: readonly RoutedRoute[];
  readonly references: ReadonlyMap<string, readonly RouteReference[]>;
  readonly unresolved: readonly UnresolvedRoutePath[];
}

const routeComponentName = 'Route';
const pathAttributeName = 'path';
const indexAttributeName = 'index';
const elementAttributeName = 'element';
const componentNamePattern = /^[A-Z]/;

const lazyAttributeName = 'lazy';
const lazyComponentProperty = 'Component';

const gateComponents: ReadonlyMap<string, string> = new Map([
  ['AccountGate', 'account'],
  ['OnboardingGate', 'onboarding'],
  ['LedgerStacksGate', 'ledgerStacks'],
  ['LedgerBitcoinGate', 'ledgerBitcoin'],
]);

interface WalkContext {
  readonly parentPath: string;
  readonly gates: readonly string[];
  readonly flags: readonly string[];
  readonly parentKeys: readonly string[];
}

interface RouteTemplate {
  readonly paramName: string;
  readonly body: ts.Node;
  readonly sourceFile: ts.SourceFile;
}

interface ImportResolver {
  resolve(specifier: string, fromFile: string): ts.SourceFile | undefined;
}

interface WalkState {
  readonly sourceFile: ts.SourceFile;
  readonly table: StringTable;
  readonly objectName: string;
  readonly bindings: ReadonlyMap<string, EvaluatedString>;
  readonly localJsx: ReadonlyMap<string, ts.Node>;
  readonly templates: ReadonlyMap<string, RouteTemplate>;
  readonly components: ReadonlyMap<string, ts.SourceFile>;
  readonly descending: ReadonlySet<string>;
  readonly imports: ImportResolver;
  readonly routes: RoutedRoute[];
  readonly unresolved: UnresolvedRoutePath[];
}

type JsxElementLike = ts.JsxElement | ts.JsxSelfClosingElement;

function isJsxElementLike(node: ts.Node) {
  return ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node);
}

function getOpening(node: JsxElementLike): ts.JsxOpeningLikeElement {
  return ts.isJsxElement(node) ? node.openingElement : node;
}

function getTagName(node: ts.JsxOpeningLikeElement): string {
  return node.tagName.getText();
}

function asRouteElement(node: ts.Node): JsxElementLike | undefined {
  if (!isJsxElementLike(node)) return undefined;
  return getTagName(getOpening(node)) === routeComponentName ? node : undefined;
}

function findAttribute(node: JsxElementLike, name: string): ts.JsxAttribute | undefined {
  for (const attribute of getOpening(node).attributes.properties) {
    if (
      ts.isJsxAttribute(attribute) &&
      ts.isIdentifier(attribute.name) &&
      attribute.name.text === name
    )
      return attribute;
  }
  return undefined;
}

function attributeExpression(attribute: ts.JsxAttribute): ts.Expression | undefined {
  const initializer = attribute.initializer;
  if (!initializer) return undefined;
  if (ts.isStringLiteral(initializer)) return initializer;
  if (ts.isJsxExpression(initializer)) return initializer.expression;
  return undefined;
}

function collectChildTagNames(node: ts.Node): string[] {
  const tags: string[] = [];
  function visit(child: ts.Node) {
    if (ts.isJsxElement(child)) {
      tags.push(getTagName(child.openingElement));
      child.children.forEach(visit);
      return;
    }
    if (ts.isJsxSelfClosingElement(child)) {
      tags.push(getTagName(child));
      return;
    }
    if (ts.isJsxFragment(child)) {
      child.children.forEach(visit);
      return;
    }
    if (ts.isJsxExpression(child) && child.expression) {
      visit(child.expression);
      return;
    }
    if (ts.isJsxAttribute(child) && child.initializer) {
      visit(child.initializer);
      return;
    }
    if (ts.isParenthesizedExpression(child)) visit(child.expression);
  }
  visit(node);
  return tags;
}

function collectGates(node: ts.Node): string[] {
  const gates: string[] = [];
  for (const tag of collectChildTagNames(node)) {
    const gate = gateComponents.get(tag);
    if (gate !== undefined) gates.push(gate);
  }
  return gates;
}

function findDynamicImportSpecifier(node: ts.Node): string | undefined {
  let specifier: string | undefined;
  function visit(child: ts.Node) {
    if (specifier !== undefined) return;
    if (
      ts.isCallExpression(child) &&
      child.expression.kind === ts.SyntaxKind.ImportKeyword &&
      child.arguments[0] &&
      ts.isStringLiteral(child.arguments[0])
    ) {
      specifier = child.arguments[0].text;
      return;
    }
    ts.forEachChild(child, visit);
  }
  visit(node);
  return specifier;
}

function findLazyComponentName(node: ts.Node): string | undefined {
  let name: string | undefined;
  function visit(child: ts.Node) {
    if (name !== undefined) return;
    if (ts.isPropertyAssignment(child) && getPropertyName(child.name) === lazyComponentProperty) {
      if (ts.isIdentifier(child.initializer)) name = child.initializer.text;
      return;
    }
    if (ts.isShorthandPropertyAssignment(child) && child.name.text === lazyComponentProperty) {
      name = child.name.text;
      return;
    }
    ts.forEachChild(child, visit);
  }
  visit(node);
  return name;
}

function findDeclaration(sourceFile: ts.SourceFile, name: string): ts.Node | undefined {
  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name?.text === name) return statement;
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === name) return declaration;
    }
  }
  return undefined;
}

function collectGatesWithin(node: ts.Node): string[] {
  const gates: string[] = [];
  function visit(child: ts.Node) {
    if (isJsxElementLike(child)) {
      gates.push(...collectGates(child));
      return;
    }
    ts.forEachChild(child, visit);
  }
  visit(node);
  return gates;
}

function collectLazyGates(lazyAttribute: ts.JsxAttribute, state: WalkState): string[] {
  const specifier = findDynamicImportSpecifier(lazyAttribute);
  const componentName = findLazyComponentName(lazyAttribute);
  if (specifier === undefined || componentName === undefined) return [];
  const sourceFile = state.imports.resolve(specifier, state.sourceFile.fileName);
  if (!sourceFile) return [];
  const declaration = findDeclaration(sourceFile, componentName);
  return declaration ? collectGatesWithin(declaration) : [];
}

function joinPath(parent: string, own: string): string {
  if (own.startsWith('/')) return own;
  if (own === '') return parent;
  if (parent === '' || parent === '/') return `/${own}`;
  return `${parent}/${own}`;
}

function keysFromRefs(refs: readonly string[], objectName: string): string[] {
  const prefix = `${objectName}.`;
  return refs.filter(ref => ref.startsWith(prefix)).map(ref => ref.slice(prefix.length));
}

const splatSuffix = '/*';
const rootPath = '/';

function keysWithValue(state: WalkState, value: string): string[] {
  const values = state.table.get(state.objectName);
  if (!values) return [];
  return [...values.entries()].filter(([, candidate]) => candidate === value).map(([key]) => key);
}

function keysForMountedRoute(
  ownPath: string,
  mountedPath: string,
  refs: readonly string[],
  state: WalkState
): string[] {
  const own = keysWithValue(state, ownPath);
  if (own.length > 0) return own;
  const mounted = keysWithValue(state, mountedPath);
  if (mounted.length > 0) return mounted;
  if (mountedPath.endsWith(splatSuffix)) {
    const root = keysWithValue(state, mountedPath.slice(0, -splatSuffix.length) || rootPath);
    if (root.length > 0) return root;
  }
  return keysFromRefs(refs, state.objectName);
}

function collectParameterNames(fn: ts.FunctionDeclaration): Set<string> {
  const names = new Set<string>();
  for (const parameter of fn.parameters) {
    if (ts.isIdentifier(parameter.name)) names.add(parameter.name.text);
    if (ts.isObjectBindingPattern(parameter.name)) {
      for (const element of parameter.name.elements) {
        if (ts.isIdentifier(element.name)) names.add(element.name.text);
      }
    }
  }
  return names;
}

function findTemplateParam(fn: ts.FunctionDeclaration): string | undefined {
  const parameterNames = collectParameterNames(fn);
  let found: string | undefined;
  function visit(node: ts.Node) {
    if (found) return;
    const route = asRouteElement(node);
    if (route) {
      const pathAttribute = findAttribute(route, pathAttributeName);
      const expression = pathAttribute ? attributeExpression(pathAttribute) : undefined;
      if (expression && ts.isIdentifier(expression) && parameterNames.has(expression.text)) {
        found = expression.text;
        return;
      }
    }
    ts.forEachChild(node, visit);
  }
  if (fn.body) visit(fn.body);
  return found;
}

function collectTemplates(sourceFile: ts.SourceFile): Map<string, RouteTemplate> {
  const templates = new Map<string, RouteTemplate>();
  for (const statement of sourceFile.statements) {
    if (!ts.isFunctionDeclaration(statement) || !statement.name || !statement.body) continue;
    const paramName = findTemplateParam(statement);
    if (!paramName) continue;
    templates.set(statement.name.text, { paramName, body: statement.body, sourceFile });
  }
  return templates;
}

function collectExportedComponents(sourceFile: ts.SourceFile): string[] {
  const names: string[] = [];
  for (const statement of sourceFile.statements) {
    if (!hasExportModifier(statement)) continue;
    if (ts.isFunctionDeclaration(statement) && statement.name) names.push(statement.name.text);
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) names.push(declaration.name.text);
      }
    }
  }
  return names.filter(name => componentNamePattern.test(name));
}

function collectMountedComponentFiles(
  sourceFile: ts.SourceFile,
  components: ReadonlyMap<string, ts.SourceFile>
): ts.SourceFile[] {
  const files: ts.SourceFile[] = [];
  function visit(node: ts.Node) {
    const route = asRouteElement(node);
    if (route) {
      const elementAttribute = findAttribute(route, elementAttributeName);
      for (const tag of elementAttribute ? collectChildTagNames(elementAttribute) : []) {
        const component = components.get(tag);
        if (component && component !== sourceFile) files.push(component);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return files;
}

function collectLocalJsx(sourceFile: ts.SourceFile): Map<string, ts.Node> {
  const locals = new Map<string, ts.Node>();
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
      const initializer = unwrapExpression(declaration.initializer);
      if (isJsxElementLike(initializer) || ts.isJsxFragment(initializer)) {
        locals.set(declaration.name.text, initializer);
      }
    }
  }
  return locals;
}

function collectSplicedNames(sourceFile: ts.SourceFile): Set<string> {
  const names = new Set<string>();
  function visit(node: ts.Node) {
    if (ts.isJsxExpression(node) && node.expression && ts.isIdentifier(node.expression)) {
      names.add(node.expression.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return names;
}

function descendIntoMountedComponents(
  elementAttribute: ts.JsxAttribute | undefined,
  context: WalkContext,
  state: WalkState
) {
  if (!elementAttribute) return;
  const visited = new Set<ts.SourceFile>();
  for (const tag of collectChildTagNames(elementAttribute)) {
    const component = state.components.get(tag);
    if (!component || component === state.sourceFile || visited.has(component)) continue;
    if (state.descending.has(component.fileName)) continue;
    visited.add(component);
    walkFile(
      component,
      {
        ...state,
        sourceFile: component,
        bindings: new Map(),
        localJsx: collectLocalJsx(component),
        descending: new Set([...state.descending, component.fileName]),
      },
      context
    );
  }
}

function handleRoute(node: JsxElementLike, context: WalkContext, state: WalkState) {
  const file = state.sourceFile.fileName;
  const line = getLine(state.sourceFile, node);
  const elementAttribute = findAttribute(node, elementAttributeName);
  const lazyAttribute = findAttribute(node, lazyAttributeName);
  const gates = [
    ...context.gates,
    ...(elementAttribute ? collectGates(elementAttribute) : []),
    ...(lazyAttribute ? collectLazyGates(lazyAttribute, state) : []),
  ];
  const pathAttribute = findAttribute(node, pathAttributeName);
  const isIndex = findAttribute(node, indexAttributeName) !== undefined;

  let next: WalkContext = { ...context, gates };

  if (pathAttribute) {
    const expression = attributeExpression(pathAttribute);
    const evaluated = expression
      ? evaluateStringExpression(expression, state.table, state.bindings)
      : undefined;
    if (evaluated) {
      const mountedPath = joinPath(context.parentPath, evaluated.value);
      const keys = keysForMountedRoute(evaluated.value, mountedPath, evaluated.refs, state);
      state.routes.push({
        file,
        line,
        keys,
        path: evaluated.value,
        mountedPath,
        gates,
        flags: context.flags,
        parentKeys: context.parentKeys,
        isIndex: false,
      });
      next = {
        parentPath: mountedPath,
        gates,
        flags: context.flags,
        parentKeys: [...context.parentKeys, ...keys],
      };
    } else {
      state.unresolved.push({ file, line, text: expression?.getText() ?? '' });
    }
  } else if (isIndex) {
    state.routes.push({
      file,
      line,
      keys: [],
      path: '',
      mountedPath: context.parentPath,
      gates,
      flags: context.flags,
      parentKeys: context.parentKeys,
      isIndex: true,
    });
  }

  descendIntoMountedComponents(elementAttribute, next, state);

  if (ts.isJsxElement(node)) {
    for (const child of node.children) walk(child, next, state);
  }
}

function readPathArgument(node: ts.CallExpression, state: WalkState): EvaluatedString | undefined {
  const argument = node.arguments[0];
  if (!argument) return undefined;
  const object = unwrapExpression(argument);
  if (!ts.isObjectLiteralExpression(object)) return undefined;
  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property) || getPropertyName(property.name) !== pathAttributeName)
      continue;
    return evaluateStringExpression(property.initializer, state.table, state.bindings);
  }
  return undefined;
}

function walk(node: ts.Node, context: WalkContext, state: WalkState) {
  const route = asRouteElement(node);
  if (route) {
    handleRoute(route, context, state);
    return;
  }

  if (ts.isJsxExpression(node) && node.expression) {
    const expression = node.expression;
    if (
      ts.isBinaryExpression(expression) &&
      expression.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken &&
      ts.isIdentifier(expression.left)
    ) {
      walk(
        expression.right,
        { ...context, flags: [...context.flags, expression.left.text] },
        state
      );
      return;
    }
    if (ts.isIdentifier(expression)) {
      const local = state.localJsx.get(expression.text);
      if (local) {
        walk(local, context, state);
        return;
      }
    }
  }

  if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
    const template = state.templates.get(node.expression.text);
    if (template) {
      const pathValue = readPathArgument(node, state);
      if (pathValue) {
        const bindings = new Map(state.bindings);
        bindings.set(template.paramName, pathValue);
        walk(template.body, context, {
          ...state,
          sourceFile: template.sourceFile,
          bindings,
          localJsx: collectLocalJsx(template.sourceFile),
        });
        return;
      }
    }
  }

  ts.forEachChild(node, child => walk(child, context, state));
}

const rootContext: WalkContext = { parentPath: '', gates: [], flags: [], parentKeys: [] };

function walkFile(sourceFile: ts.SourceFile, state: WalkState, context: WalkContext) {
  const spliced = collectSplicedNames(sourceFile);
  for (const statement of sourceFile.statements) {
    if (
      ts.isFunctionDeclaration(statement) &&
      statement.name &&
      state.templates.has(statement.name.text)
    )
      continue;
    if (ts.isVariableStatement(statement)) {
      const names = statement.declarationList.declarations
        .map(declaration => (ts.isIdentifier(declaration.name) ? declaration.name.text : ''))
        .filter(name => name !== '');
      if (names.some(name => spliced.has(name) && state.localJsx.has(name))) continue;
    }
    walk(statement, context, state);
  }
}

interface RouterSource {
  readonly file: string;
  readonly text: string;
}

interface ImportAliases {
  readonly [prefix: string]: string;
}

const moduleFileExtensions = ['.tsx', '.ts', '/index.tsx', '/index.ts'] as const;

function moduleBase(
  specifier: string,
  fromFile: string,
  aliases: ImportAliases
): string | undefined {
  const aliased = Object.entries(aliases).find(([prefix]) => specifier.startsWith(prefix));
  if (aliased) return path.join(aliased[1], specifier.slice(aliased[0].length));
  if (specifier.startsWith('.')) return path.resolve(path.dirname(fromFile), specifier);
  return undefined;
}

function moduleCandidates(specifier: string, fromFile: string, aliases: ImportAliases): string[] {
  const base = moduleBase(specifier, fromFile, aliases);
  if (base === undefined) return [];
  return moduleFileExtensions.map(extension => `${base}${extension}`);
}

export function createImportResolver(
  aliases: ImportAliases,
  read: (file: string) => string | undefined
): ImportResolver {
  const cache = new Map<string, ts.SourceFile | undefined>();
  return {
    resolve(specifier, fromFile) {
      for (const candidate of moduleCandidates(specifier, fromFile, aliases)) {
        if (!cache.has(candidate)) {
          const text = read(candidate);
          cache.set(candidate, text === undefined ? undefined : parseSourceFile(candidate, text));
        }
        const sourceFile = cache.get(candidate);
        if (sourceFile) return sourceFile;
      }
      return undefined;
    },
  };
}

function readFromDisk(file: string): string | undefined {
  return existsSync(file) ? readFileSync(file, 'utf8') : undefined;
}

export function parseRouterFiles(
  files: readonly string[],
  table: StringTable,
  objectName: string,
  aliases: ImportAliases = {}
): RouterModel {
  return parseRouters(
    files.map(file => ({ file, text: readFileSync(file, 'utf8') })),
    table,
    objectName,
    createImportResolver(aliases, readFromDisk)
  );
}

const noImports: ImportResolver = {
  resolve() {
    return undefined;
  },
};

export function parseRouters(
  sources: readonly RouterSource[],
  table: StringTable,
  objectName: string,
  imports: ImportResolver = noImports
): RouterModel {
  const sourceFiles = sources.map(source => parseSourceFile(source.file, source.text));
  const templates = new Map<string, RouteTemplate>();
  const components = new Map<string, ts.SourceFile>();
  for (const sourceFile of sourceFiles) {
    for (const [name, template] of collectTemplates(sourceFile)) templates.set(name, template);
    for (const name of collectExportedComponents(sourceFile)) components.set(name, sourceFile);
  }
  const descendants = new Set<ts.SourceFile>();
  for (const sourceFile of sourceFiles) {
    for (const mounted of collectMountedComponentFiles(sourceFile, components)) {
      descendants.add(mounted);
    }
  }

  const routes: RoutedRoute[] = [];
  const unresolved: UnresolvedRoutePath[] = [];
  const references = new Map<string, RouteReference[]>();

  for (const sourceFile of sourceFiles) {
    if (!descendants.has(sourceFile)) {
      walkFile(
        sourceFile,
        {
          sourceFile,
          table,
          objectName,
          bindings: new Map(),
          localJsx: collectLocalJsx(sourceFile),
          templates,
          components,
          descending: new Set([sourceFile.fileName]),
          imports,
          routes,
          unresolved,
        },
        rootContext
      );
    }
  }
  for (const route of routes) {
    for (const key of route.keys) {
      const list = references.get(key) ?? [];
      list.push({ key, file: route.file, line: route.line });
      references.set(key, list);
    }
  }

  return { routes, references, unresolved };
}

export function distinctMountedPaths(routes: readonly RoutedRoute[]): Set<string> {
  return new Set(routes.map(route => route.mountedPath));
}

export function innermostGate(route: RoutedRoute): string | undefined {
  return route.gates[route.gates.length - 1];
}
