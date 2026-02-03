import { Outlet, Route } from 'react-router';

import { RouteUrls } from '@shared/route-urls';

import { ledgerBitcoinTxSigningRoutes } from '@app/features/ledger/flows/bitcoin-tx-signing/ledger-bitcoin-sign-tx-container';
import { ledgerStacksTxSigningRoutes } from '@app/features/ledger/flows/stacks-tx-signing/ledger-sign-stacks-tx-container';
import { AccountGate } from '@app/routes/account-gate';

import { Swap } from './swap';
import { SwapReview } from './swap-review';

// Routes mirror the old Swap version for backwards compatibility with existing
// references and web app interop.
// The 'chain' path is unnecessary in the new version but kept for this reason.
function toRoutePattern(route: string) {
  return route.replace('{chain}', ':chain');
}

export const swapRoutes = (
  <Route
    element={
      <AccountGate>
        <Outlet />
      </AccountGate>
    }
  >
    <Route path={toRoutePattern(RouteUrls.Swap)} element={<Swap />} />
    <Route path={toRoutePattern(RouteUrls.SwapReview)} element={<SwapReview />}>
      {ledgerBitcoinTxSigningRoutes}
      {ledgerStacksTxSigningRoutes}
    </Route>
  </Route>
);
