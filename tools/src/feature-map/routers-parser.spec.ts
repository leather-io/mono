import { describe, expect, test } from 'vitest';

import {
  type RoutedRoute,
  createImportResolver,
  distinctMountedPaths,
  parseRouters,
} from './routers-parser.js';

const table = new Map([
  [
    'RouteUrls',
    new Map([
      ['Home', '/'],
      ['Activity', '/activity'],
      ['Sell', '/sell'],
      ['SendForm', '/send/:symbol'],
      ['RecipientAccounts', 'recipient-accounts'],
      ['EditNonce', 'edit-tx-nonce'],
      ['Swap', '/swap/{chain}/:base/:quote?'],
      ['RpcCallContract', '/stx-call-contract'],
      ['FeeEditor', 'edit-fee'],
      ['IncreaseFee', '/increase-fee/:txid'],
      ['BroadcastError', 'broadcast-error'],
      ['SignBip322', '/sign-bip322-message'],
      ['StxConfirmation', '/send/stx/confirm'],
      ['Settings', '/settings'],
    ]),
  ],
]);

const appRoutes = `
export function SuspenseLoadingSpinner() {
  return <Spinner />;
}

const sheetRoute = <Route path={RouteUrls.RecipientAccounts} element={<Sheet />} />;

export function useAppRoutes() {
  const { releaseOnramperSell } = useFlags();
  return createRoutesFromElements(
    <Route element={<Container />}>
      <Route path="/*" element={<AccountGate><Home /></AccountGate>} />
      {releaseOnramperSell && (
        <Route path={RouteUrls.Sell} element={<AccountGate><SellPage /></AccountGate>} />
      )}
      <Route path={RouteUrls.SendForm.replace(':symbol', 'btc')} element={<BtcForm />}>
        {sheetRoute}
      </Route>
      <Route path={RouteUrls.SendForm.replace(':symbol', 'stx')} element={<StxForm />}>
        {sheetRoute}
        <Route path={RouteUrls.EditNonce} element={<EditNonce />} />
      </Route>
      <Route path={\`\${RouteUrls.SendForm.replace(':symbol', 'stx')}/confirm\`} element={<Confirm />} />
      <Route path="/nowhere" element={<Nowhere onDone={() => navigate(RouteUrls.Settings)} />} />
      <Route path={\`\${RouteUrls.IncreaseFee}/\${RouteUrls.BroadcastError}\`} element={<Err />} />
      <Route element={<AccountGate><SwapContainer /></AccountGate>}>
        <Route path={toRoutePattern(RouteUrls.Swap)} element={<SwapForm />} />
      </Route>
      {rpcCallContractRoutes}
    </Route>
  );
}
`;

const factory = `
export function generateRpcRoutes({ path, element }: Args) {
  return (
    <Route path={path} element={<AccountGate><LedgerStacksGate>{element}</LedgerStacksGate></AccountGate>}>
      <Route index element={element} />
      <Route path={RouteUrls.FeeEditor} element={<FeeEditor />} />
    </Route>
  );
}
`;

const callContractRoutes = `
export const rpcCallContractRoutes = generateRpcRoutes({
  path: RouteUrls.RpcCallContract,
  element: (
    <Suspense fallback={<SuspenseLoadingSpinner />}>
      <CallContract />
    </Suspense>
  ),
});
`;

const homeRoutes = `
export function Home() {
  const navigate = useNavigate();
  return (
    <Tabs>
      <Route index element={<Tokens />} />
      <Route path={RouteUrls.Activity} element={<ActivityList />} />
      <Route path="*" element={<NotFound onGoHome={() => navigate(RouteUrls.Home)} />} />
    </Tabs>
  );
}
`;

function parseFixture() {
  return parseRouters(
    [
      { file: 'app-routes.tsx', text: appRoutes },
      { file: 'factory.routes.tsx', text: factory },
      { file: 'call-contract.routes.tsx', text: callContractRoutes },
      { file: 'home.tsx', text: homeRoutes },
    ],
    table,
    'RouteUrls'
  );
}

function routesByKey(routes: readonly RoutedRoute[], key: string) {
  return routes.filter(route => route.keys.includes(key));
}

describe(parseRouters.name, () => {
  const model = parseFixture();

  test('resolves member, replace and template paths with their keys', () => {
    expect(routesByKey(model.routes, 'Sell')[0]?.mountedPath).toBe('/sell');
    expect(routesByKey(model.routes, 'SendForm').map(route => route.mountedPath)).toEqual([
      '/send/btc',
      '/send/stx',
    ]);
    const errorRoute = routesByKey(model.routes, 'BroadcastError').find(
      route => route.file === 'app-routes.tsx'
    );
    expect(errorRoute?.keys).toEqual(['IncreaseFee', 'BroadcastError']);
    expect(errorRoute?.mountedPath).toBe('/increase-fee/:txid/broadcast-error');
  });

  test('mounts spliced local routes under each parent', () => {
    const sheets = routesByKey(model.routes, 'RecipientAccounts');
    expect(sheets.map(route => route.mountedPath)).toEqual([
      '/send/btc/recipient-accounts',
      '/send/stx/recipient-accounts',
    ]);
    expect(sheets[0]?.parentKeys).toEqual(['SendForm']);
    expect(distinctMountedPaths(sheets).size).toBe(2);
  });

  test('derives gates from the element and from pathless ancestors', () => {
    expect(routesByKey(model.routes, 'Sell')[0]?.gates).toEqual(['account']);
    expect(routesByKey(model.routes, 'Swap')[0]?.gates).toEqual(['account']);
    expect(routesByKey(model.routes, 'Swap')[0]?.mountedPath).toBe('/swap/:chain/:base/:quote?');
    expect(routesByKey(model.routes, 'EditNonce')[0]?.gates).toEqual([]);
  });

  test('records the flag guarding a conditional route', () => {
    expect(routesByKey(model.routes, 'Sell')[0]?.flags).toEqual(['releaseOnramperSell']);
    expect(routesByKey(model.routes, 'SendForm')[0]?.flags).toEqual([]);
  });

  test('instantiates route factories at their call sites', () => {
    const parent = routesByKey(model.routes, 'RpcCallContract')[0];
    expect(parent?.file).toBe('factory.routes.tsx');
    expect(parent?.gates).toEqual(['account', 'ledgerStacks']);
    const feeEditor = routesByKey(model.routes, 'FeeEditor')[0];
    expect(feeEditor?.mountedPath).toBe('/stx-call-contract/edit-fee');
    expect(feeEditor?.parentKeys).toEqual(['RpcCallContract']);
    expect(model.unresolved).toEqual([]);
  });

  test('keeps index routes and nested home tabs', () => {
    const index = model.routes.filter(route => route.isIndex);
    expect(index.map(route => route.mountedPath)).toEqual(['/*', '/stx-call-contract']);
    expect(routesByKey(model.routes, 'Activity')[0]?.mountedPath).toBe('/activity');
  });

  test('walks a component rendered by a route as its descendant routes', () => {
    const activity = routesByKey(model.routes, 'Activity')[0];
    expect(activity?.file).toBe('home.tsx');
    expect(activity?.gates).toEqual(['account']);
    expect(activity?.parentKeys).toEqual(['Home']);
    expect(model.routes.filter(route => route.file === 'home.tsx')).toHaveLength(3);
  });

  test('ignores components referenced only from element attributes', () => {
    expect(routesByKey(model.routes, 'Sell')[0]?.parentKeys).toEqual([]);
    expect(routesByKey(model.routes, 'Sell')[0]?.gates).toEqual(['account']);
    expect(routesByKey(model.routes, 'EditNonce')[0]?.gates).toEqual([]);
  });

  test('credits a mounted path to the key whose value it equals', () => {
    const confirm = routesByKey(model.routes, 'StxConfirmation')[0];
    expect(confirm?.mountedPath).toBe('/send/stx/confirm');
    expect(confirm?.keys).toEqual(['StxConfirmation']);
    expect(routesByKey(model.routes, 'SendForm').map(route => route.mountedPath)).toEqual([
      '/send/btc',
      '/send/stx',
    ]);
  });

  test('credits the splat root route to the key whose value is the root', () => {
    const home = routesByKey(model.routes, 'Home')[0];
    expect(home?.file).toBe('app-routes.tsx');
    expect(home?.mountedPath).toBe('/*');
  });

  test('references come from mounted routes, not from navigate or Navigate usages', () => {
    expect(model.references.get('Home')?.[0]?.file).toBe('app-routes.tsx');
    expect(model.references.has('Activity')).toBe(true);
    expect(model.references.has('Settings')).toBe(false);
  });

  test('reports path expressions it cannot resolve', () => {
    const broken = parseRouters(
      [{ file: 'broken.tsx', text: '<Route path={computePath()} element={<X />} />' }],
      table,
      'RouteUrls'
    );
    expect(broken.routes).toEqual([]);
    expect(broken.unresolved).toEqual([{ file: 'broken.tsx', line: 1, text: 'computePath()' }]);
  });
});

describe('self-gating lazy routes', () => {
  const lazyRouter = `
export function RpcRoutes() {
  return (
    <Route element={<Container />}>
      <Route
        path={RouteUrls.SignBip322}
        lazy={async () => {
          const { SignBip322Route } = await import('@app/pages/sign-bip322/sign-bip322');
          return { Component: SignBip322Route };
        }}
      />
      <Route path={RouteUrls.Sell} lazy={async () => {
        const { SellRoute } = await import('./sell');
        return { Component: SellRoute };
      }} />
    </Route>
  );
}
`;
  const bip322Page = `
export function SignBip322Route() {
  return (
    <AccountGate>
      <SignBip322 />
    </AccountGate>
  );
}
`;
  const sellPage = `
export function SellRoute() {
  return <SellPage />;
}
`;
  const files = new Map([
    ['/virtual/src/app/pages/sign-bip322/sign-bip322.tsx', bip322Page],
    ['/virtual/src/app/routes/sell.tsx', sellPage],
  ]);
  const imports = createImportResolver({ '@app/': '/virtual/src/app/' }, file => files.get(file));

  test('reads the gate a lazily imported page wraps itself in', () => {
    const model = parseRouters(
      [{ file: '/virtual/src/app/routes/rpc-routes.tsx', text: lazyRouter }],
      table,
      'RouteUrls',
      imports
    );
    expect(routesByKey(model.routes, 'SignBip322')[0]?.gates).toEqual(['account']);
    expect(routesByKey(model.routes, 'Sell')[0]?.gates).toEqual([]);
  });

  test('leaves the gates alone when the lazy module cannot be resolved', () => {
    const model = parseRouters(
      [{ file: '/virtual/src/app/routes/rpc-routes.tsx', text: lazyRouter }],
      table,
      'RouteUrls'
    );
    expect(routesByKey(model.routes, 'SignBip322')[0]?.gates).toEqual([]);
  });
});
