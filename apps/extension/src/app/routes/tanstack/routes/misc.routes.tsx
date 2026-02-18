import { createRoute } from '@tanstack/react-router';

import { RouteUrls } from '@shared/route-urls';

import { useFlags } from '@app/features/feature-flags';
import { FundPage } from '@app/pages/fund/fund';
import { LegacyAccountAuth } from '@app/pages/legacy-account-auth/legacy-account-auth';
import { NotFoundPage } from '@app/pages/not-found/not-found';
import { RequestError } from '@app/pages/request-error/request-error';
import { SellPage } from '@app/pages/sell/sell';
import { UnauthorizedRequest } from '@app/pages/unauthorized-request/unauthorized-request';
import { AccountGate } from '@app/routes/account-gate';
import { Navigate } from '@app/routes/compat';

import { rootRoute } from '../root-route';
import { createLedgerJwtSigningRoutes } from './ledger.routes';

const fundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.Fund,
  component: function FundGated() {
    const { releaseOnramperBuy } = useFlags();
    if (!releaseOnramperBuy) return <Navigate to={RouteUrls.Home} />;
    return (
      <AccountGate>
        <FundPage />
      </AccountGate>
    );
  },
});

const sellRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.Sell,
  component: function SellGated() {
    const { releaseOnramperSell } = useFlags();
    if (!releaseOnramperSell) return <Navigate to={RouteUrls.Home} />;
    return (
      <AccountGate>
        <SellPage />
      </AccountGate>
    );
  },
});

const unauthorizedRequestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.UnauthorizedRequest,
  component: UnauthorizedRequest,
});

const requestErrorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.RequestError,
  component: function RequestErrorGated() {
    return (
      <AccountGate>
        <RequestError />
      </AccountGate>
    );
  },
});

const chooseAccountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.ChooseAccount,
  component: function ChooseAccountGated() {
    return (
      <AccountGate>
        <LegacyAccountAuth />
      </AccountGate>
    );
  },
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFoundPage,
});

export const miscRoutes = [
  fundRoute,
  sellRoute,
  unauthorizedRequestRoute,
  requestErrorRoute,
  chooseAccountRoute.addChildren([createLedgerJwtSigningRoutes(chooseAccountRoute)]),
  notFoundRoute,
];
