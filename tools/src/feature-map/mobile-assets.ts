import ts from 'typescript';

import { type RpcHandler } from './test-assets.js';
import { getLine, parseSourceFile } from './ts-ast.js';

const rpcMethodProperty = 'method';
const rpcRequestProperty = 'request';

export function collectCallStringArguments(
  sourceFile: ts.SourceFile,
  calleeNames: readonly string[]
): string[] {
  const texts: string[] = [];
  function visit(node: ts.Node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      calleeNames.includes(node.expression.text)
    ) {
      const argument = node.arguments[0];
      if (argument && ts.isStringLiteral(argument) && !texts.includes(argument.text)) {
        texts.push(argument.text);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return texts;
}

export function loadFeatureFlagHookKeys(file: string, hooks: readonly string[]): string[] {
  return collectCallStringArguments(parseSourceFile(file), hooks);
}

interface EndpointAccess {
  readonly name: string;
  readonly line: number;
}

export function collectEndpointAccesses(sourceFile: ts.SourceFile): EndpointAccess[] {
  const accesses: EndpointAccess[] = [];
  function visit(node: ts.Node) {
    if (
      ts.isPropertyAccessExpression(node) &&
      ts.isIdentifier(node.expression) &&
      (node.name.text === rpcMethodProperty || node.name.text === rpcRequestProperty)
    ) {
      accesses.push({ name: node.expression.text, line: getLine(sourceFile, node) });
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return accesses;
}

export function loadRpcDispatchHandlers(
  files: readonly string[],
  endpoints: ReadonlyMap<string, string>
): Map<string, RpcHandler> {
  const handlers = new Map<string, RpcHandler>();
  for (const file of files) {
    for (const access of collectEndpointAccesses(parseSourceFile(file))) {
      const method = endpoints.get(access.name);
      if (method === undefined || handlers.has(method)) continue;
      handlers.set(method, { name: method, file, line: access.line, methods: [method] });
    }
  }
  return handlers;
}
