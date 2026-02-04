import { Outlet, Route } from 'react-router';

import { RouteUrls } from '@shared/route-urls';

import { ledgerBitcoinTxSigningRoutes } from '@app/features/ledger/flows/bitcoin-tx-signing/ledger-bitcoin-sign-tx-container';
import { ledgerStacksTxSigningRoutes } from '@app/features/ledger/flows/stacks-tx-signing/ledger-sign-stacks-tx-container';
import { SwapContainer } from '@app/pages/swap/swap-container';
import { AccountGate } from '@app/routes/account-gate';

import { SwapForm } from './swap-form';
import { SwapReview } from './swap-review';

// Routes mirror the old Swap version for backwards compatibility with existing
// references and web app interop.
// The paths will be replaced with a different format once the legacy version is phased out.
function toRoutePattern(route: string) {
  return route.replace('{chain}', ':chain');
}

export const swapRoutes = (
  <Route
    element={
      <AccountGate>
        <SwapContainer>
          <Outlet />
        </SwapContainer>
      </AccountGate>
    }
  >
    <Route path={toRoutePattern(RouteUrls.Swap)} element={<SwapForm />} />
    <Route path={toRoutePattern(RouteUrls.SwapReview)} element={<SwapReview />}>
      {ledgerBitcoinTxSigningRoutes}
      {ledgerStacksTxSigningRoutes}
    </Route>
  </Route>
);
