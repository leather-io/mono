import { isValidElement } from 'react';
import { type RouteMatch, createRoutesFromElements, matchRoutes } from 'react-router';

import { describe, expect, test, vi } from 'vitest';

import { swapRoutes } from './swap.routes';

const h = vi.hoisted(() => ({
  BitcoinLedgerContainer() {
    return null;
  },
  StacksLedgerContainer() {
    return null;
  },
  SwapReview() {
    return null;
  },
}));

vi.mock('@app/pages/swap/swap-container', () => ({ SwapContainer: () => null }));
vi.mock('@app/routes/account-gate', () => ({ AccountGate: () => null }));
vi.mock('./swap-form', () => ({ SwapForm: () => null }));
vi.mock('./swap-review', () => ({ SwapReview: h.SwapReview }));

vi.mock(
  '@app/features/ledger/flows/bitcoin-tx-signing/ledger-bitcoin-sign-tx-container',
  async () => {
    const { createElement } = await import('react');
    const { Route } = await import('react-router');
    return {
      ledgerBitcoinTxSigningRoutes: createElement(
        Route,
        { element: createElement(h.BitcoinLedgerContainer) },
        createElement(Route, { path: 'connect-your-ledger', element: null })
      ),
    };
  }
);

vi.mock(
  '@app/features/ledger/flows/stacks-tx-signing/ledger-sign-stacks-tx-container',
  async () => {
    const { createElement } = await import('react');
    const { Route } = await import('react-router');
    return {
      ledgerStacksTxSigningRoutes: createElement(
        Route,
        { element: createElement(h.StacksLedgerContainer) },
        createElement(Route, { path: 'connect-your-ledger', element: null })
      ),
    };
  }
);

const routes = createRoutesFromElements(swapRoutes);

function matchSwapUrl(pathname: string): RouteMatch[] {
  const matches = matchRoutes(routes, pathname);
  if (!matches) throw new Error(`No route matched ${pathname}`);
  return matches;
}

function rendersComponent(matches: RouteMatch[], component: () => null) {
  return matches.some(
    match => isValidElement(match.route.element) && match.route.element.type === component
  );
}

describe('swapRoutes', () => {
  test('mounts the stacks ledger container under the stacks review segment', () => {
    const matches = matchSwapUrl('/swap/stacks/STX/aeUSDC/review/stacks/connect-your-ledger');

    expect(rendersComponent(matches, h.SwapReview)).toBe(true);
    expect(rendersComponent(matches, h.StacksLedgerContainer)).toBe(true);
    expect(rendersComponent(matches, h.BitcoinLedgerContainer)).toBe(false);
  });

  test('mounts the bitcoin ledger container under the bitcoin review segment', () => {
    const matches = matchSwapUrl('/swap/bitcoin/BTC/sBTC/review/bitcoin/connect-your-ledger');

    expect(rendersComponent(matches, h.SwapReview)).toBe(true);
    expect(rendersComponent(matches, h.BitcoinLedgerContainer)).toBe(true);
    expect(rendersComponent(matches, h.StacksLedgerContainer)).toBe(false);
  });

  test('redirects a bare chain segment back to the review', () => {
    const matches = matchSwapUrl('/swap/stacks/STX/aeUSDC/review/stacks');

    expect(matches.at(-1)?.route.index).toBe(true);
    expect(rendersComponent(matches, h.StacksLedgerContainer)).toBe(false);
  });

  test('does not mount a ledger container on the review itself', () => {
    const matches = matchSwapUrl('/swap/stacks/STX/aeUSDC/review');

    expect(rendersComponent(matches, h.SwapReview)).toBe(true);
    expect(rendersComponent(matches, h.StacksLedgerContainer)).toBe(false);
    expect(rendersComponent(matches, h.BitcoinLedgerContainer)).toBe(false);
  });
});
