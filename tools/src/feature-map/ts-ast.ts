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

export function hasExportModifier(node: ts.Node): boolean {
  if (!ts.canHaveModifiers(node)) return false;
  return (ts.getModifiers(node) ?? []).some(mod => mod.kind === ts.SyntaxKind.ExportKeyword);
}

function hasPrivateModifier(node: ts.Node): boolean {
  if (!ts.canHaveModifiers(node)) return false;
  return (ts.getModifiers(node) ?? []).some(mod => mod.kind === ts.SyntaxKind.PrivateKeyword);
}

export function unwrapExpression(node: ts.Expression): ts.Expression {
  if (ts.isAsExpression(node) || ts.isSatisfiesExpression(node))
    return unwrapExpression(node.expression);
  if (ts.isParenthesizedExpression(node)) return unwrapExpression(node.expression);
  return node;
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
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
      const initializer = unwrapExpression(declaration.initializer);
      if (!ts.isObjectLiteralExpression(initializer)) continue;
      const values = readStringObjectLiteral(initializer);
      if (values.size === 0) continue;
      table.set(declaration.name.text, values);
    }
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
  const references: { key: string; line: number }[] = [];
  function visit(node: ts.Node) {
    if (
      ts.isPropertyAccessExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === objectName
    ) {
      references.push({ key: node.name.text, line: getLine(sourceFile, node) });
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return references;
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
  for (const statement of sourceFile.statements) {
    if (!hasExportModifier(statement)) continue;
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      names.set(statement.name.text, getLine(sourceFile, statement));
    }
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) {
          names.set(declaration.name.text, getLine(sourceFile, declaration));
        }
      }
    }
  }
  return names;
}

interface ClassMethod {
  readonly line: number;
  readonly requiredParameters: number;
  readonly isStatic: boolean;
}

function hasStaticModifier(node: ts.Node): boolean {
  return ts.canHaveModifiers(node)
    ? (ts.getModifiers(node) ?? []).some(modifier => modifier.kind === ts.SyntaxKind.StaticKeyword)
    : false;
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
      if (hasPrivateModifier(member)) continue;
      if (!ts.isMethodDeclaration(member) && !ts.isPropertyDeclaration(member)) continue;
      const name = getPropertyName(member.name);
      if (name === undefined) continue;
      const line = getLine(sourceFile, member);
      const isStatic = hasStaticModifier(member);
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
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
      const initializer = unwrapExpression(declaration.initializer);
      if (!ts.isCallExpression(initializer)) continue;
      if (!ts.isIdentifier(initializer.expression)) continue;
      if (initializer.expression.text !== defineFunctionName) continue;
      const argument = initializer.arguments[0];
      if (!argument || !ts.isObjectLiteralExpression(argument)) continue;
      for (const property of argument.properties) {
        if (!ts.isPropertyAssignment(property) || getPropertyName(property.name) !== propertyName)
          continue;
        const value = getStringLiteralText(property.initializer);
        if (value !== undefined) endpoints.set(declaration.name.text, value);
      }
    }
  }
  return endpoints;
}

export function collectHandlerEndpointNames(
  sourceFile: ts.SourceFile,
  defineFunctionName: string,
  propertyName: string
): string[] {
  const names: string[] = [];
  function visit(node: ts.Node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === defineFunctionName
    ) {
      const argument = node.arguments[0];
      if (
        argument &&
        ts.isPropertyAccessExpression(argument) &&
        ts.isIdentifier(argument.expression) &&
        argument.name.text === propertyName
      ) {
        names.push(argument.expression.text);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return names;
}

interface FunctionCallees {
  readonly line: number;
  readonly callees: readonly string[];
}

export function collectFunctionCallees(
  sourceFile: ts.SourceFile,
  functionName: string
): FunctionCallees | undefined {
  for (const statement of sourceFile.statements) {
    if (!ts.isFunctionDeclaration(statement) || statement.name?.text !== functionName) continue;
    if (!statement.body) return undefined;
    const callees: string[] = [];
    function visit(node: ts.Node) {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
        callees.push(node.expression.text);
      }
      ts.forEachChild(node, visit);
    }
    visit(statement.body);
    return { line: getLine(sourceFile, statement), callees };
  }
  return undefined;
}

export function collectObjectPropertyStrings(
  sourceFile: ts.SourceFile,
  propertyName: string
): string[] {
  const texts: string[] = [];
  function visit(node: ts.Node) {
    if (ts.isPropertyAssignment(node) && getPropertyName(node.name) === propertyName) {
      const text = getStringLiteralText(node.initializer);
      if (text !== undefined) texts.push(text);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return texts;
}
