import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

export type StringTable = Map<string, Map<string, string>>;

export interface SourceLocation {
  readonly file: string;
  readonly line: number;
}

export function parseSourceFile(file: string, text = readFileSync(file, 'utf8')): ts.SourceFile {
  const kind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  return ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
}

export function getLine(sourceFile: ts.SourceFile, node: ts.Node): number {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}

export function listFiles(dir: string, matches: (file: string) => boolean): string[] {
  const entries = readdirSync(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter(entry => entry.isFile())
    .map(entry => path.join(entry.parentPath, entry.name))
    .filter(matches)
    .sort();
}

export function parseFilesIn(dir: string, matches: (file: string) => boolean): ts.SourceFile[] {
  return listFiles(dir, matches).map(file => parseSourceFile(file));
}

function hasModifier(node: ts.Node, kind: ts.ModifierSyntaxKind): boolean {
  if (!ts.canHaveModifiers(node)) return false;
  return (ts.getModifiers(node) ?? []).some(modifier => modifier.kind === kind);
}

export function walkDescendants(node: ts.Node, visit: (node: ts.Node) => boolean): void {
  if (visit(node)) return;
  ts.forEachChild(node, child => walkDescendants(child, visit));
}

export function collectDescendants<T>(
  node: ts.Node,
  select: (node: ts.Node) => T | undefined
): T[] {
  const results: T[] = [];
  walkDescendants(node, child => {
    const result = select(child);
    if (result !== undefined) results.push(result);
    return false;
  });
  return results;
}

export function findDescendant<T>(
  node: ts.Node,
  select: (node: ts.Node) => T | undefined
): T | undefined {
  let found: T | undefined;
  walkDescendants(node, child => {
    if (found === undefined) found = select(child);
    return found !== undefined;
  });
  return found;
}

export function unwrapExpression(node: ts.Expression): ts.Expression {
  if (ts.isAsExpression(node) || ts.isSatisfiesExpression(node))
    return unwrapExpression(node.expression);
  if (ts.isParenthesizedExpression(node)) return unwrapExpression(node.expression);
  return node;
}

interface TopLevelDeclaration {
  readonly name: string;
  readonly node: ts.VariableDeclaration | ts.FunctionDeclaration;
  readonly initializer?: ts.Expression;
  readonly exported: boolean;
}

export function topLevelDeclarations(sourceFile: ts.SourceFile): TopLevelDeclaration[] {
  const declarations: TopLevelDeclaration[] = [];
  for (const statement of sourceFile.statements) {
    const exported = hasModifier(statement, ts.SyntaxKind.ExportKeyword);
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      declarations.push({ name: statement.name.text, node: statement, exported });
      continue;
    }
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name)) continue;
      declarations.push({
        name: declaration.name.text,
        node: declaration,
        initializer: declaration.initializer
          ? unwrapExpression(declaration.initializer)
          : undefined,
        exported,
      });
    }
  }
  return declarations;
}

export function findTopLevelDeclaration(
  sourceFile: ts.SourceFile,
  name: string
): TopLevelDeclaration | undefined {
  return topLevelDeclarations(sourceFile).find(declaration => declaration.name === name);
}

export function getPropertyName(name: ts.PropertyName): string | undefined {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name))
    return name.text;
  return undefined;
}

function getStringLiteralText(node: ts.Node): string | undefined {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return undefined;
}

function readStringObjectLiteral(node: ts.ObjectLiteralExpression): Map<string, string> {
  const values = new Map<string, string>();
  for (const prop of node.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const key = getPropertyName(prop.name);
    const value = getStringLiteralText(prop.initializer);
    if (key === undefined || value === undefined) continue;
    values.set(key, value);
  }
  return values;
}

export function collectStringConstObjects(sourceFile: ts.SourceFile): StringTable {
  const table: StringTable = new Map();
  for (const { name, initializer } of topLevelDeclarations(sourceFile)) {
    if (!initializer || !ts.isObjectLiteralExpression(initializer)) continue;
    const values = readStringObjectLiteral(initializer);
    if (values.size > 0) table.set(name, values);
  }
  return table;
}

export function mergeStringTables(tables: readonly StringTable[]): StringTable {
  const merged: StringTable = new Map();
  for (const table of tables) {
    for (const [name, values] of table) merged.set(name, values);
  }
  return merged;
}

export interface EvaluatedString {
  readonly value: string;
  readonly refs: readonly string[];
}

function evaluateReplaceCall(
  node: ts.CallExpression,
  table: StringTable,
  bindings: ReadonlyMap<string, EvaluatedString>
): EvaluatedString | undefined {
  if (!ts.isPropertyAccessExpression(node.expression)) return undefined;
  if (node.expression.name.text !== 'replace' || node.arguments.length !== 2) return undefined;
  const target = evaluateStringExpression(node.expression.expression, table, bindings);
  const search = getStringLiteralText(node.arguments[0]);
  const replacement = getStringLiteralText(node.arguments[1]);
  if (!target || search === undefined || replacement === undefined) return undefined;
  return { value: target.value.replace(search, replacement), refs: target.refs };
}

const routePatternFunction = 'toRoutePattern';
const routePatternPlaceholder = '{chain}';
const routePatternParam = ':chain';

export function evaluateStringExpression(
  node: ts.Expression,
  table: StringTable,
  bindings: ReadonlyMap<string, EvaluatedString> = new Map()
): EvaluatedString | undefined {
  const expression = unwrapExpression(node);
  const literal = getStringLiteralText(expression);
  if (literal !== undefined) return { value: literal, refs: [] };

  if (ts.isIdentifier(expression)) return bindings.get(expression.text);

  if (ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.expression)) {
    const objectName = expression.expression.text;
    const value = table.get(objectName)?.get(expression.name.text);
    if (value === undefined) return undefined;
    return { value, refs: [`${objectName}.${expression.name.text}`] };
  }

  if (
    ts.isBinaryExpression(expression) &&
    expression.operatorToken.kind === ts.SyntaxKind.PlusToken
  ) {
    const left = evaluateStringExpression(expression.left, table, bindings);
    const right = evaluateStringExpression(expression.right, table, bindings);
    if (!left || !right) return undefined;
    return { value: left.value + right.value, refs: [...left.refs, ...right.refs] };
  }

  if (ts.isTemplateExpression(expression)) {
    const refs: string[] = [];
    let value = expression.head.text;
    for (const span of expression.templateSpans) {
      const part = evaluateStringExpression(span.expression, table, bindings);
      if (!part) return undefined;
      refs.push(...part.refs);
      value += part.value + span.literal.text;
    }
    return { value, refs };
  }

  if (ts.isCallExpression(expression)) {
    if (
      ts.isIdentifier(expression.expression) &&
      expression.expression.text === routePatternFunction &&
      expression.arguments.length === 1
    ) {
      const inner = evaluateStringExpression(expression.arguments[0], table, bindings);
      if (!inner) return undefined;
      return {
        value: inner.value.replace(routePatternPlaceholder, routePatternParam),
        refs: inner.refs,
      };
    }
    return evaluateReplaceCall(expression, table, bindings);
  }

  return undefined;
}

export function collectPropertyAccessReferences(
  sourceFile: ts.SourceFile,
  objectName: string
): { key: string; line: number }[] {
  return collectDescendants(sourceFile, node => {
    if (!ts.isPropertyAccessExpression(node) || !ts.isIdentifier(node.expression)) return undefined;
    if (node.expression.text !== objectName) return undefined;
    return { key: node.name.text, line: getLine(sourceFile, node) };
  });
}

export function collectInterfaceProperties(
  sourceFile: ts.SourceFile,
  interfaceName: string
): string[] {
  for (const statement of sourceFile.statements) {
    if (!ts.isInterfaceDeclaration(statement) || statement.name.text !== interfaceName) continue;
    return statement.members
      .filter(ts.isPropertySignature)
      .map(member => getPropertyName(member.name))
      .filter(name => name !== undefined);
  }
  return [];
}

export function collectExportedNames(sourceFile: ts.SourceFile): Map<string, number> {
  const names = new Map<string, number>();
  for (const { name, node, exported } of topLevelDeclarations(sourceFile)) {
    if (exported) names.set(name, getLine(sourceFile, node));
  }
  return names;
}

interface ClassMethod {
  readonly line: number;
  readonly requiredParameters: number;
  readonly isStatic: boolean;
}

function countRequiredParameters(parameters: readonly ts.ParameterDeclaration[]): number {
  return parameters.filter(
    parameter =>
      parameter.questionToken === undefined &&
      parameter.initializer === undefined &&
      parameter.dotDotDotToken === undefined
  ).length;
}

export function collectClassMethods(
  sourceFile: ts.SourceFile
): Map<string, Map<string, ClassMethod>> {
  const classes = new Map<string, Map<string, ClassMethod>>();
  for (const statement of sourceFile.statements) {
    if (!ts.isClassDeclaration(statement) || !statement.name) continue;
    const methods = new Map<string, ClassMethod>();
    for (const member of statement.members) {
      if (hasModifier(member, ts.SyntaxKind.PrivateKeyword)) continue;
      if (!ts.isMethodDeclaration(member) && !ts.isPropertyDeclaration(member)) continue;
      const name = getPropertyName(member.name);
      if (name === undefined) continue;
      const line = getLine(sourceFile, member);
      const isStatic = hasModifier(member, ts.SyntaxKind.StaticKeyword);
      if (ts.isMethodDeclaration(member)) {
        methods.set(name, {
          line,
          requiredParameters: countRequiredParameters(member.parameters),
          isStatic,
        });
        continue;
      }
      if (
        ts.isPropertyDeclaration(member) &&
        member.initializer !== undefined &&
        ts.isArrowFunction(member.initializer)
      ) {
        methods.set(name, {
          line,
          requiredParameters: countRequiredParameters(member.initializer.parameters),
          isStatic,
        });
      }
    }
    classes.set(statement.name.text, methods);
  }
  return classes;
}

export function collectDefinedEndpoints(
  sourceFile: ts.SourceFile,
  defineFunctionName: string,
  propertyName: string
): Map<string, string> {
  const endpoints = new Map<string, string>();
  for (const { name, initializer } of topLevelDeclarations(sourceFile)) {
    if (!initializer || !ts.isCallExpression(initializer)) continue;
    if (!ts.isIdentifier(initializer.expression)) continue;
    if (initializer.expression.text !== defineFunctionName) continue;
    const argument = initializer.arguments[0];
    if (!argument || !ts.isObjectLiteralExpression(argument)) continue;
    const value = readStringObjectLiteral(argument).get(propertyName);
    if (value !== undefined) endpoints.set(name, value);
  }
  return endpoints;
}

export function collectHandlerEndpointNames(
  sourceFile: ts.SourceFile,
  defineFunctionName: string,
  propertyName: string
): string[] {
  return collectDescendants(sourceFile, node => {
    if (!ts.isCallExpression(node) || !ts.isIdentifier(node.expression)) return undefined;
    if (node.expression.text !== defineFunctionName) return undefined;
    const argument = node.arguments[0];
    if (!argument || !ts.isPropertyAccessExpression(argument)) return undefined;
    if (!ts.isIdentifier(argument.expression) || argument.name.text !== propertyName) {
      return undefined;
    }
    return argument.expression.text;
  });
}

interface FunctionCallees {
  readonly line: number;
  readonly callees: readonly string[];
}

export function collectFunctionCallees(
  sourceFile: ts.SourceFile,
  functionName: string
): FunctionCallees | undefined {
  const declaration = findTopLevelDeclaration(sourceFile, functionName);
  if (!declaration || !ts.isFunctionDeclaration(declaration.node)) return undefined;
  if (!declaration.node.body) return undefined;
  return {
    line: getLine(sourceFile, declaration.node),
    callees: collectDescendants(declaration.node.body, node =>
      ts.isCallExpression(node) && ts.isIdentifier(node.expression)
        ? node.expression.text
        : undefined
    ),
  };
}

export function collectStringArrayConsts(sourceFile: ts.SourceFile): Map<string, string[]> {
  const arrays = new Map<string, string[]>();
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
      const initializer = unwrapExpression(declaration.initializer);
      if (!ts.isArrayLiteralExpression(initializer)) continue;
      const items: string[] = [];
      for (const element of initializer.elements) {
        const text = getStringLiteralText(element);
        if (text !== undefined) items.push(text);
      }
      arrays.set(declaration.name.text, items);
    }
  }
  return arrays;
}

export function collectObjectLiteralKeys(
  sourceFile: ts.SourceFile,
  variableName: string
): string[] | undefined {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== variableName) continue;
      if (!declaration.initializer) return undefined;
      const initializer = unwrapExpression(declaration.initializer);
      if (!ts.isObjectLiteralExpression(initializer)) return undefined;
      const keys: string[] = [];
      for (const property of initializer.properties) {
        if (!ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property))
          continue;
        const key = getPropertyName(property.name);
        if (key !== undefined) keys.push(key);
      }
      return keys;
    }
  }
  return undefined;
}

export function collectObjectLiteralStringPairs(
  sourceFile: ts.SourceFile,
  keyProperty: string,
  valueProperty: string
): Map<string, string> {
  const pairs = new Map<string, string>();
  function visit(node: ts.Node) {
    if (ts.isObjectLiteralExpression(node)) {
      const strings = readStringObjectLiteral(node);
      const key = strings.get(keyProperty);
      const value = strings.get(valueProperty);
      if (key !== undefined && value !== undefined && !pairs.has(key)) pairs.set(key, value);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return pairs;
}
