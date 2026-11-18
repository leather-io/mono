import ts from 'typescript';
import { describe, expect, test } from 'vitest';

import {
  collectClassMethods,
  collectDefinedEndpoints,
  collectExportedNames,
  collectFunctionCallees,
  collectHandlerEndpointNames,
  collectInterfaceProperties,
  collectStringConstObjects,
  evaluateStringExpression,
  parseSourceFile,
} from './ts-ast.js';

const routeUrlsSource = `
export const RouteUrls = {
  Home: '/',
  Swap: '/swap/{chain}/:base/:quote?',
  SendForm: '/send/:symbol',
  EditNonce: 'edit-tx-nonce',
} as const;
export type RouteUrls = (typeof RouteUrls)[keyof typeof RouteUrls];
`;

function tableFor(source: string) {
  return collectStringConstObjects(parseSourceFile('route-urls.ts', source));
}

function expressionOf(source: string) {
  const sourceFile = parseSourceFile('expr.tsx', `const value = ${source};`);
  const statement = sourceFile.statements[0];
  if (!statement || !ts.isVariableStatement(statement))
    throw new Error('fixture is not a variable');
  const initializer = statement.declarationList.declarations[0]?.initializer;
  if (!initializer) throw new Error('fixture has no initializer');
  return initializer;
}

describe(collectStringConstObjects.name, () => {
  test('collects string members of as-const objects', () => {
    const table = tableFor(routeUrlsSource);
    expect(table.get('RouteUrls')?.get('Home')).toBe('/');
    expect(table.get('RouteUrls')?.get('EditNonce')).toBe('edit-tx-nonce');
  });

  test('skips objects without string members', () => {
    const table = tableFor('export const config = { retries: 3 } as const;');
    expect(table.size).toBe(0);
  });
});

describe(evaluateStringExpression.name, () => {
  const table = tableFor(routeUrlsSource);

  test('resolves literals, member references and templates', () => {
    expect(evaluateStringExpression(expressionOf(`'/sell'`), table)).toEqual({
      value: '/sell',
      refs: [],
    });
    expect(evaluateStringExpression(expressionOf('RouteUrls.Home'), table)).toEqual({
      value: '/',
      refs: ['RouteUrls.Home'],
    });
    expect(
      evaluateStringExpression(
        expressionOf('`${RouteUrls.SendForm}/${RouteUrls.EditNonce}`'),
        table
      )
    ).toEqual({
      value: '/send/:symbol/edit-tx-nonce',
      refs: ['RouteUrls.SendForm', 'RouteUrls.EditNonce'],
    });
  });

  test('concatenates string expressions joined with plus', () => {
    expect(evaluateStringExpression(expressionOf("'a' + RouteUrls.Home + 'b'"), table)).toEqual({
      value: 'a/b',
      refs: ['RouteUrls.Home'],
    });
    expect(evaluateStringExpression(expressionOf("'a' + unknownValue"), table)).toBeUndefined();
  });

  test('resolves replace calls and toRoutePattern', () => {
    expect(
      evaluateStringExpression(expressionOf(`RouteUrls.SendForm.replace(':symbol', 'btc')`), table)
    ).toEqual({ value: '/send/btc', refs: ['RouteUrls.SendForm'] });
    expect(evaluateStringExpression(expressionOf('toRoutePattern(RouteUrls.Swap)'), table)).toEqual(
      {
        value: '/swap/:chain/:base/:quote?',
        refs: ['RouteUrls.Swap'],
      }
    );
  });

  test('resolves bound identifiers and rejects unknown expressions', () => {
    const bindings = new Map([['path', { value: '/stx-call-contract', refs: ['RouteUrls.Call'] }]]);
    expect(evaluateStringExpression(expressionOf('path'), table, bindings)).toEqual({
      value: '/stx-call-contract',
      refs: ['RouteUrls.Call'],
    });
    expect(evaluateStringExpression(expressionOf('path'), table)).toBeUndefined();
    expect(evaluateStringExpression(expressionOf('RouteUrls.Missing'), table)).toBeUndefined();
    expect(evaluateStringExpression(expressionOf('computePath()'), table)).toBeUndefined();
  });
});

describe(collectClassMethods.name, () => {
  test('lists public methods and arrow properties but not private members', () => {
    const sourceFile = parseSourceFile(
      'send.page.ts',
      `export class SendPage {
        constructor(readonly page: Page) {}
        async goBack() {}
        clickInfo = async () => {};
        private async waitForFees() {}
        readonly amount: Locator;
      }`
    );
    const methods = collectClassMethods(sourceFile).get('SendPage');
    expect([...(methods?.keys() ?? [])]).toEqual(['goBack', 'clickInfo']);
  });
});

describe(collectExportedNames.name, () => {
  test('lists exported functions and consts only', () => {
    const sourceFile = parseSourceFile(
      'mock-apis.ts',
      `export async function mockFees() {}
       export const mockUtxos = [];
       function helper() {}
       const local = 1;`
    );
    expect([...collectExportedNames(sourceFile).keys()]).toEqual(['mockFees', 'mockUtxos']);
  });
});

describe(collectInterfaceProperties.name, () => {
  test('lists the property names of the named interface', () => {
    const sourceFile = parseSourceFile(
      'flags.tsx',
      `interface FeatureFlags { releaseOnramperBuy: boolean; assetsRevamp: boolean }
       interface Other { nope: boolean }`
    );
    expect(collectInterfaceProperties(sourceFile, 'FeatureFlags')).toEqual([
      'releaseOnramperBuy',
      'assetsRevamp',
    ]);
    expect(collectInterfaceProperties(sourceFile, 'Missing')).toEqual([]);
  });
});

describe(collectDefinedEndpoints.name, () => {
  test('maps exported endpoint names to their method strings', () => {
    const sourceFile = parseSourceFile(
      'open.ts',
      `export const open = defineRpcEndpoint({ method: 'open', params: z.object({}) });
       export const other = somethingElse({ method: 'nope' });
       export const supportedMethods = defineRpcEndpoint({ method: 'supportedMethods' });`
    );
    expect(collectDefinedEndpoints(sourceFile, 'defineRpcEndpoint', 'method')).toEqual(
      new Map([
        ['open', 'open'],
        ['supportedMethods', 'supportedMethods'],
      ])
    );
  });
});

describe(collectHandlerEndpointNames.name, () => {
  test('lists the endpoint identifiers passed as <endpoint>.method', () => {
    const sourceFile = parseSourceFile(
      'open.ts',
      `export const openHandler = defineRpcRequestHandler(open.method, async () => {});
       const other = defineRpcRequestHandler('literal', async () => {});
       const nested = { handler: defineRpcRequestHandler(openSwap.method, () => {}) };`
    );
    expect(collectHandlerEndpointNames(sourceFile, 'defineRpcRequestHandler', 'method')).toEqual([
      'open',
      'openSwap',
    ]);
  });
});

describe(collectFunctionCallees.name, () => {
  test('lists the identifiers a named function declaration calls', () => {
    const sourceFile = parseSourceFile(
      'mock-apis.ts',
      `import { mockFees } from './mock-fees';
       export async function setupMockApis(page: Page) {
         await Promise.all([page.route('x', route => route.fulfill()), mockFees(page), mockFees(page)]);
       }
       export const other = () => mockOther();`
    );
    expect(collectFunctionCallees(sourceFile, 'setupMockApis')).toEqual({
      line: 2,
      callees: ['mockFees', 'mockFees'],
    });
    expect(collectFunctionCallees(sourceFile, 'other')).toBeUndefined();
  });
});
