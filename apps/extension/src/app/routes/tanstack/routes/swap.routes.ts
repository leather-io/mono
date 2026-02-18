import { createRoute } from '@tanstack/react-router';

import type { Blockchain } from '@leather.io/models';

import { RouteUrls } from '@shared/route-urls';

import { SwapAssetSheetBase } from '@app/pages/swap/components/swap-asset-sheet/swap-asset-sheet-base';
import { SwapAssetSheetQuote } from '@app/pages/swap/components/swap-asset-sheet/swap-asset-sheet-quote';
import { SwapError } from '@app/pages/swap/components/swap-error';
import { BitcoinSwapReview } from '@app/pages/swap/components/swap-review/bitcoin-swap-review';
import { StacksSwapReview } from '@app/pages/swap/components/swap-review/stacks-swap-review';
import { BitcoinSwapContainer } from '@app/pages/swap/containers/bitcoin-swap-container';
import { StacksSwapContainer } from '@app/pages/swap/containers/stacks-swap-container';
import { Swap } from '@app/pages/swap/swap';

import { rootRoute } from '../root-route';
import {
  createLedgerBitcoinTxSigningRoutes,
  createLedgerStacksTxSigningRoutes,
} from './ledger.routes';

function generateTanstackSwapRoutes(
  chain: Blockchain,
  container: () => React.JSX.Element,
  review: () => React.JSX.Element
) {
  const prefix = chain === 'bitcoin' ? 'btc-swap' : 'stx-swap';

  const containerRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: `${prefix}-container`,
    component: container,
  });

  const swapRoute = createRoute({
    getParentRoute: () => containerRoute,
    path: `/swap/${chain}/$base/$quote`,
    component: Swap,
  });

  const selectBaseRoute = createRoute({
    getParentRoute: () => swapRoute,
    path: RouteUrls.SwapAssetSelectBase,
    component: SwapAssetSheetBase,
  });

  const selectQuoteRoute = createRoute({
    getParentRoute: () => swapRoute,
    path: RouteUrls.SwapAssetSelectQuote,
    component: SwapAssetSheetQuote,
  });

  const swapErrorRoute = createRoute({
    getParentRoute: () => containerRoute,
    path: RouteUrls.SwapError,
    component: SwapError,
  });

  const reviewRoute = createRoute({
    getParentRoute: () => containerRoute,
    path: `/swap/${chain}/$base/$quote/review`,
    component: review,
  });

  return containerRoute.addChildren([
    swapRoute.addChildren([
      selectBaseRoute,
      selectQuoteRoute,
      createLedgerBitcoinTxSigningRoutes(swapRoute),
      createLedgerStacksTxSigningRoutes(swapRoute),
    ]),
    swapErrorRoute,
    reviewRoute.addChildren([
      createLedgerBitcoinTxSigningRoutes(reviewRoute),
      createLedgerStacksTxSigningRoutes(reviewRoute),
    ]),
  ]);
}

export const bitcoinSwapRoutes = generateTanstackSwapRoutes(
  'bitcoin',
  BitcoinSwapContainer,
  BitcoinSwapReview
);

export const stacksSwapRoutes = generateTanstackSwapRoutes(
  'stacks',
  StacksSwapContainer,
  StacksSwapReview
);
