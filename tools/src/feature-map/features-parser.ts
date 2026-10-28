import path from 'node:path';
import ts from 'typescript';

import { toRepoRelative } from './app-config.js';
import {
  type FeatureAnchor,
  type FeatureEntryKind,
  type FeatureEntryPoint,
  type FeatureGate,
  type FeatureParam,
  type FeatureSession,
  featureAnchorKinds,
  featureEntryKinds,
  featureGates,
  featureSessions,
} from './feature-entry.js';
import {
  type EvaluatedString,
  type StringTable,
  evaluateStringExpression,
  getLine,
  getPropertyName,
  parseSourceFile,
  topLevelDeclarations,
  unwrapExpression,
} from './ts-ast.js';

export interface ResolvedString {
  readonly value: string;
  readonly ref?: string;
}

export interface ParsedFeature {
  readonly file: string;
  readonly line: number;
  readonly group: string;
  readonly id: string;
  readonly anchor: FeatureAnchor;
  readonly routes: readonly ResolvedString[];
  readonly startRoute?: ResolvedString;
  readonly open: readonly string[];
  readonly deepLinkable: boolean;
  readonly params: readonly FeatureParam[];
  readonly entry: readonly FeatureEntryPoint[];
  readonly gate: FeatureGate;
  readonly flags: readonly string[];
  readonly preconditions: {
    readonly session: FeatureSession;
    readonly network?: string;
    readonly accountType?: string;
    readonly mocks: readonly string[];
  };
  readonly selectors: {
    readonly ready?: ResolvedString;
    readonly others: readonly ResolvedString[];
  };
  readonly actions: readonly string[];
  readonly specs: readonly string[];
  readonly description: string;
}

export interface FeaturesParseResult {
  readonly features: readonly ParsedFeature[];
  readonly errors: readonly string[];
}

type ParsedValue =
  | { readonly kind: 'string'; readonly value: string; readonly ref?: string }
  | { readonly kind: 'boolean'; readonly value: boolean }
  | { readonly kind: 'array'; readonly items: readonly ParsedValue[] }
  | { readonly kind: 'object'; readonly props: ReadonlyMap<string, ParsedValue> }
  | { readonly kind: 'spread'; readonly text: string }
  | { readonly kind: 'unknown'; readonly text: string };

const featuresFileSuffix = '.features.ts';
const kebabCasePattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

interface ReaderScope {
  readonly table: StringTable;
  readonly bindings: ReadonlyMap<string, EvaluatedString>;
  readonly arrays: ReadonlyMap<string, ts.ArrayLiteralExpression>;
  readonly objects: ReadonlyMap<string, ts.ObjectLiteralExpression>;
}

function readShorthand(name: string, scope: ReaderScope): ParsedValue {
  const binding = scope.bindings.get(name);
  if (binding) return { kind: 'string', value: binding.value, ref: binding.refs[0] };
  const array = scope.arrays.get(name);
  if (array) return { kind: 'array', items: readArrayItems(array.elements, scope) };
  const object = scope.objects.get(name);
  if (object) return readValue(object, scope);
  return { kind: 'unknown', text: name };
}

function readArrayItems(elements: readonly ts.Expression[], scope: ReaderScope): ParsedValue[] {
  const items: ParsedValue[] = [];
  for (const element of elements) {
    if (ts.isSpreadElement(element) && ts.isIdentifier(element.expression)) {
      const local = scope.arrays.get(element.expression.text);
      if (local) {
        items.push(...readArrayItems(local.elements, scope));
        continue;
      }
    }
    items.push(readValue(element, scope));
  }
  return items;
}

function readValue(node: ts.Expression, scope: ReaderScope): ParsedValue {
  const expression = unwrapExpression(node);
  const evaluated = evaluateStringExpression(expression, scope.table, scope.bindings);
  if (evaluated) return { kind: 'string', value: evaluated.value, ref: evaluated.refs[0] };
  if (expression.kind === ts.SyntaxKind.TrueKeyword) return { kind: 'boolean', value: true };
  if (expression.kind === ts.SyntaxKind.FalseKeyword) return { kind: 'boolean', value: false };
  if (ts.isArrayLiteralExpression(expression)) {
    return { kind: 'array', items: readArrayItems(expression.elements, scope) };
  }
  if (ts.isObjectLiteralExpression(expression)) {
    const props = new Map<string, ParsedValue>();
    for (const property of expression.properties) {
      if (ts.isSpreadAssignment(property)) {
        return { kind: 'spread', text: property.getText() };
      }
      if (ts.isShorthandPropertyAssignment(property)) {
        props.set(property.name.text, readShorthand(property.name.text, scope));
        continue;
      }
      if (!ts.isPropertyAssignment(property)) continue;
      const name = getPropertyName(property.name);
      if (name === undefined) continue;
      props.set(name, readValue(property.initializer, scope));
    }
    return { kind: 'object', props };
  }
  return { kind: 'unknown', text: expression.getText() };
}

function collectScope(sourceFile: ts.SourceFile, table: StringTable): ReaderScope {
  const bindings = new Map<string, EvaluatedString>();
  const arrays = new Map<string, ts.ArrayLiteralExpression>();
  const objects = new Map<string, ts.ObjectLiteralExpression>();
  for (const { name, initializer } of topLevelDeclarations(sourceFile)) {
    if (!initializer) continue;
    const evaluated = evaluateStringExpression(initializer, table, bindings);
    if (evaluated) {
      bindings.set(name, evaluated);
      continue;
    }
    if (ts.isArrayLiteralExpression(initializer)) arrays.set(name, initializer);
    if (ts.isObjectLiteralExpression(initializer)) objects.set(name, initializer);
  }
  return { table, bindings, arrays, objects };
}

class FeatureReader {
  readonly errors: string[] = [];

  constructor(
    private readonly location: string,
    private readonly props: ReadonlyMap<string, ParsedValue>
  ) {}

  private fail(message: string) {
    this.errors.push(`${this.location}: ${message}`);
  }

  private get(name: string, required = true): ParsedValue | undefined {
    const value = this.props.get(name);
    if (!value && required) this.fail(`missing field '${name}'`);
    if (value?.kind === 'spread') {
      this.fail(
        `field '${name}' uses a spread (${value.text}) the parser cannot follow; write the fields out`
      );
      return undefined;
    }
    return value;
  }

  boolean(name: string, fallback: boolean): boolean {
    const value = this.get(name, false);
    if (!value) return fallback;
    if (value.kind !== 'boolean') {
      this.fail(`field '${name}' must be true or false`);
      return fallback;
    }
    return value.value;
  }

  has(name: string): boolean {
    return this.props.has(name);
  }

  string(name: string, required = true): string | undefined {
    return this.resolvedString(name, required)?.value;
  }

  resolvedString(name: string, required = true): ResolvedString | undefined {
    const value = this.get(name, required);
    if (!value) return undefined;
    if (value.kind !== 'string') {
      this.fail(`field '${name}' must be a string`);
      return undefined;
    }
    return { value: value.value, ref: value.ref };
  }

  resolvedStrings(name: string): ResolvedString[] {
    const value = this.get(name);
    if (!value) return [];
    if (value.kind !== 'array') {
      this.fail(`field '${name}' must be an array of strings`);
      return [];
    }
    const items: ResolvedString[] = [];
    value.items.forEach((item, index) => {
      if (item.kind !== 'string') {
        this.fail(`field '${name}[${index}]' must be a string`);
        return;
      }
      items.push({ value: item.value, ref: item.ref });
    });
    return items;
  }

  strings(name: string): string[] {
    return this.resolvedStrings(name).map(item => item.value);
  }

  oneOf<T extends string>(name: string, options: readonly T[]): T | undefined {
    const value = this.string(name);
    if (value === undefined) return undefined;
    const match = options.find(option => option === value);
    if (!match) this.fail(`field '${name}' must be one of ${options.join(', ')}, got '${value}'`);
    return match;
  }

  objects(name: string): FeatureReader[] {
    const value = this.get(name);
    if (!value) return [];
    if (value.kind !== 'array') {
      this.fail(`field '${name}' must be an array of objects`);
      return [];
    }
    const readers: FeatureReader[] = [];
    value.items.forEach((item, index) => {
      if (item.kind !== 'object') {
        this.fail(`field '${name}[${index}]' must be an object`);
        return;
      }
      readers.push(new FeatureReader(`${this.location} ${name}[${index}]`, item.props));
    });
    return readers;
  }

  object(name: string): FeatureReader | undefined {
    const value = this.get(name);
    if (!value) return undefined;
    if (value.kind !== 'object') {
      this.fail(`field '${name}' must be an object`);
      return undefined;
    }
    return new FeatureReader(`${this.location} ${name}`, value.props);
  }

  collect(children: readonly FeatureReader[]) {
    for (const child of children) this.errors.push(...child.errors);
  }
}

function readAnchor(reader: FeatureReader): FeatureAnchor | undefined {
  const anchor = reader.object('anchor');
  if (!anchor) return undefined;
  const kind = anchor.oneOf('kind', featureAnchorKinds);
  const objects = kind === 'selectors' ? anchor.strings('objects') : [];
  const handlers = kind === 'rpc' ? anchor.strings('handlers') : [];
  reader.collect([anchor]);
  if (!kind) return undefined;
  if (kind === 'selectors') return { kind, objects };
  if (kind === 'rpc') return { kind, handlers };
  return { kind };
}

function readOptionalStrings(reader: FeatureReader, name: string): string[] {
  return reader.has(name) ? reader.strings(name) : [];
}

function readParams(reader: FeatureReader): FeatureParam[] {
  const params: FeatureParam[] = [];
  const readers = reader.objects('params');
  for (const param of readers) {
    const name = param.string('name');
    const example = param.string('example');
    if (name !== undefined && example !== undefined) params.push({ name, example });
  }
  reader.collect(readers);
  return params;
}

function readEntryPoints(reader: FeatureReader): FeatureEntryPoint[] {
  const points: FeatureEntryPoint[] = [];
  const readers = reader.objects('entry');
  for (const point of readers) {
    const kind: FeatureEntryKind | undefined = point.oneOf('kind', featureEntryKinds);
    const steps = point.strings('steps');
    const method = point.string('method', false);
    if (kind) points.push({ kind, steps, method });
  }
  reader.collect(readers);
  return points;
}

function readFeature(
  file: string,
  label: string,
  group: string,
  line: number,
  props: ReadonlyMap<string, ParsedValue>
): { feature?: ParsedFeature; errors: string[] } {
  const reader = new FeatureReader(`${label}:${line}`, props);
  const id = reader.string('id') ?? '';
  if (id && !kebabCasePattern.test(id))
    reader.errors.push(`${label}:${line}: id '${id}' must be kebab-case`);
  const anchor = readAnchor(reader);
  const routes = reader.resolvedStrings('routes');
  const startRoute = reader.resolvedString('startRoute', false);
  const open = readOptionalStrings(reader, 'open');
  const deepLinkable = reader.boolean('deepLinkable', true);
  const params = readParams(reader);
  const entry = readEntryPoints(reader);
  const gate = reader.oneOf('gate', featureGates);
  const flags = reader.strings('flags');
  const preconditions = reader.object('preconditions');
  const session = preconditions?.oneOf('session', featureSessions);
  const network = preconditions?.string('network', false);
  const accountType = preconditions?.string('accountType', false);
  const mocks = preconditions?.strings('mocks') ?? [];
  const selectors = reader.object('selectors');
  const ready = selectors?.resolvedString('ready', false);
  const others = selectors?.resolvedStrings('others') ?? [];
  const actions = reader.strings('actions');
  const specs = reader.strings('specs');
  const description = reader.string('description');
  if (preconditions) reader.collect([preconditions]);
  if (selectors) reader.collect([selectors]);

  if (
    reader.errors.length > 0 ||
    !anchor ||
    !gate ||
    !session ||
    !selectors ||
    description === undefined
  ) {
    return { errors: reader.errors };
  }

  return {
    errors: [],
    feature: {
      file,
      line,
      group,
      id,
      anchor,
      routes,
      startRoute,
      open,
      deepLinkable,
      params,
      entry,
      gate,
      flags,
      preconditions: { session, network, accountType, mocks },
      selectors: { ready, others },
      actions,
      specs,
      description,
    },
  };
}

function findFeatureArrays(sourceFile: ts.SourceFile): ts.ArrayLiteralExpression[] {
  return topLevelDeclarations(sourceFile)
    .filter(declaration => declaration.exported)
    .map(declaration => declaration.initializer)
    .filter(initializer => initializer !== undefined)
    .filter(ts.isArrayLiteralExpression);
}

export function parseFeaturesSource(
  file: string,
  text: string,
  table: StringTable
): FeaturesParseResult {
  const sourceFile = parseSourceFile(file, text);
  const group = path.basename(file).replace(featuresFileSuffix, '');
  const label = toRepoRelative(file);
  const features: ParsedFeature[] = [];
  const errors: string[] = [];
  const arrays = findFeatureArrays(sourceFile);
  if (arrays.length === 0) errors.push(`${label}: no exported feature array found`);
  const scope = collectScope(sourceFile, table);

  for (const array of arrays) {
    for (const element of array.elements) {
      const line = getLine(sourceFile, element);
      const value = readValue(element, scope);
      if (value.kind === 'spread') {
        errors.push(
          `${label}:${line}: feature uses a spread (${value.text}) the parser cannot follow; write the fields out`
        );
        continue;
      }
      if (value.kind !== 'object') {
        errors.push(`${label}:${line}: each feature must be an object literal`);
        continue;
      }
      const result = readFeature(file, label, group, line, value.props);
      errors.push(...result.errors);
      if (result.feature) features.push(result.feature);
    }
  }

  return { features, errors };
}
