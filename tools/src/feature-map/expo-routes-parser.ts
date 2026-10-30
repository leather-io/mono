import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import { compareStrings } from '../utils/compare.js';
import { type ExpoRouterConfig } from './app-config.js';
import { type RouteReference, type RoutedRoute, type RouterModel } from './routers-parser.js';
import { type StringTable, listFiles, parseSourceFile } from './ts-ast.js';

const screenFileExtensions = ['.tsx', '.ts', '.jsx', '.js'] as const;
const layoutFileName = '_layout';
const indexSegment = 'index';
const specFilePattern = /\.spec\.[jt]sx?$/;
const groupSegmentPattern = /^\(.*\)$/;
const reservedPrefixes = ['_', '+'] as const;
const rootPath = '/';

interface ExpoRoutePath {
  readonly routeName: string;
  readonly mountedPath: string;
}

type LayoutReader = (file: string) => string | undefined;

function extensionOf(file: string): string | undefined {
  return screenFileExtensions.find(extension => file.endsWith(extension));
}

export function isExpoScreenFile(file: string): boolean {
  const base = path.basename(file);
  const extension = extensionOf(base);
  if (extension === undefined || specFilePattern.test(base)) return false;
  const name = base.slice(0, -extension.length);
  return !reservedPrefixes.some(prefix => name.startsWith(prefix));
}

export function expoRoutePath(appDir: string, file: string): ExpoRoutePath {
  const relative = path.relative(appDir, file).split(path.sep).join('/');
  const extension = extensionOf(relative) ?? '';
  const segments = relative.slice(0, relative.length - extension.length).split('/');
  if (segments[segments.length - 1] === indexSegment) segments.pop();
  const urlSegments = segments.filter(segment => !groupSegmentPattern.test(segment));
  return { routeName: segments.join('/'), mountedPath: `${rootPath}${urlSegments.join('/')}` };
}

function layoutFilesFor(appDir: string, file: string): string[] {
  const relativeDir = path.relative(appDir, path.dirname(file));
  const segments = relativeDir === '' ? [] : relativeDir.split(path.sep);
  const layouts: string[] = [];
  for (let depth = 0; depth <= segments.length; depth += 1) {
    const dir = path.join(appDir, ...segments.slice(0, depth));
    for (const extension of screenFileExtensions) {
      layouts.push(path.join(dir, `${layoutFileName}${extension}`));
    }
  }
  return layouts;
}

function collectJsxTagNames(sourceFile: ts.SourceFile): string[] {
  const tags: string[] = [];
  function visit(node: ts.Node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      tags.push(node.tagName.getText(sourceFile));
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return tags;
}

export function collectLayoutGates(
  sourceFile: ts.SourceFile,
  gateComponents: Readonly<Record<string, string>>
): string[] {
  const gates: string[] = [];
  for (const tag of collectJsxTagNames(sourceFile)) {
    const gate = gateComponents[tag];
    if (gate !== undefined && !gates.includes(gate)) gates.push(gate);
  }
  return gates;
}

function gatesFor(
  appDir: string,
  file: string,
  readLayout: LayoutReader,
  gateComponents: Readonly<Record<string, string>>,
  cache: Map<string, readonly string[]>
): string[] {
  const gates: string[] = [];
  for (const layout of layoutFilesFor(appDir, file)) {
    const cached = cache.get(layout);
    if (cached) {
      gates.push(...cached);
      continue;
    }
    const text = readLayout(layout);
    const found =
      text === undefined ? [] : collectLayoutGates(parseSourceFile(layout, text), gateComponents);
    cache.set(layout, found);
    gates.push(...found);
  }
  return gates;
}

function keysWithValue(table: StringTable, objectName: string, value: string): string[] {
  const values = table.get(objectName);
  if (!values) return [];
  return [...values.entries()].filter(([, candidate]) => candidate === value).map(([key]) => key);
}

export function parseExpoRoutes(
  config: ExpoRouterConfig,
  screenFiles: readonly string[],
  readLayout: LayoutReader,
  table: StringTable,
  objectName: string
): RouterModel {
  const cache = new Map<string, readonly string[]>();
  const routes: RoutedRoute[] = screenFiles.map(file => {
    const { routeName, mountedPath } = expoRoutePath(config.appDir, file);
    return {
      file,
      line: 1,
      keys: keysWithValue(table, objectName, mountedPath),
      path: routeName,
      mountedPath,
      gates: gatesFor(config.appDir, file, readLayout, config.gateComponents, cache),
      flags: [],
      parentKeys: [],
      isIndex: false,
    };
  });
  routes.sort(
    (a, b) => compareStrings(a.mountedPath, b.mountedPath) || compareStrings(a.file, b.file)
  );

  const references = new Map<string, RouteReference[]>();
  for (const route of routes) {
    for (const key of route.keys) {
      const list = references.get(key) ?? [];
      list.push({ key, file: route.file, line: route.line });
      references.set(key, list);
    }
  }
  return { routes, references, unresolved: [] };
}

function readFromDisk(file: string): string | undefined {
  return existsSync(file) ? readFileSync(file, 'utf8') : undefined;
}

export function parseExpoRouteFiles(
  config: ExpoRouterConfig,
  table: StringTable,
  objectName: string
): RouterModel {
  const files = listFiles(config.appDir, isExpoScreenFile);
  return parseExpoRoutes(config, files, readFromDisk, table, objectName);
}
