import { Route, createHashRouter, createRoutesFromElements } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import * as Sentry from '@sentry/react';

import { RouteUrls } from '@shared/route-urls';

import { Content } from '@app/components/layout/layouts/content.layout';
import { SwitchAccountLayout } from '@app/components/layout/layouts/switch-account.layout';
import { LoadingSpinner } from '@app/components/loading-spinner';
import { Container } from '@app/features/container/container';
import { HomeHeader } from '@app/features/container/headers/home.header';
import { CancelStacksTransactionSheet } from '@app/features/dialogs/transaction-action-dialog/cancel-stacks-transaction-sheet';
import { IncreaseBtcFeeSheet } from '@app/features/dialogs/transaction-action-dialog/increase-btc-fee-dialog';
import { IncreaseStacksTransactionFeeSheet } from '@app/features/dialogs/transaction-action-dialog/increase-stacks-fee-sheet';
import { RouterErrorBoundary } from '@app/features/errors/app-error-boundary';
import { useFlags } from '@app/features/feature-flags';
import { ledgerBitcoinTxSigningRoutes } from '@app/features/ledger/flows/bitcoin-tx-signing/ledger-bitcoin-sign-tx-container';
import { ledgerJwtSigningRoutes } from '@app/features/ledger/flows/jwt-signing/ledger-sign-jwt.routes';
import { requestBitcoinKeysRoutes } from '@app/features/ledger/flows/request-bitcoin-keys/ledger-request-bitcoin-keys';
import { requestStacksKeysRoutes } from '@app/features/ledger/flows/request-stacks-keys/ledger-request-stacks-keys';
import { ledgerStacksTxSigningRoutes } from '@app/features/ledger/flows/stacks-tx-signing/ledger-sign-stacks-tx-container';
import { verifyBtcAddressRoutes } from '@app/features/ledger/flows/verify-address/ledger-verify-btc-address';
import { verifyStxAddressRoutes } from '@app/features/ledger/flows/verify-address/ledger-verify-stx-address';
import { UnsupportedBrowserLayout } from '@app/features/ledger/generic-steps';
import { ConnectLedgerStart } from '@app/features/ledger/generic-steps/connect-device/connect-ledger-start';
import { TokenDetails } from '@app/features/token/token-details';
import { AddWallet } from '@app/pages/add-wallet/add-wallet';
import { FundPage } from '@app/pages/fund/fund';
import { Home } from '@app/pages/home/home';
import { LegacyAccountAuth } from '@app/pages/legacy-account-auth/legacy-account-auth';
import { ManageTokensPage } from '@app/pages/manage-tokens/manage-tokens';
import { AddNetwork as CurrentAddNetwork } from '@app/pages/network/add-network';
import { EditNetwork as CurrentEditNetwork } from '@app/pages/network/edit-network';
import { SelectNetwork } from '@app/pages/network/select-network';
import { NotFoundPage } from '@app/pages/not-found/not-found';
import { BackUpSecretKeyPage } from '@app/pages/onboarding/back-up-secret-key/back-up-secret-key';
import { SignIn } from '@app/pages/onboarding/sign-in/sign-in';
import { WelcomePage } from '@app/pages/onboarding/welcome/welcome';
import { RequestError } from '@app/pages/request-error/request-error';
import { SellPage } from '@app/pages/sell/sell';
import { BroadcastError } from '@app/pages/send/broadcast-error/broadcast-error';
import { sendCryptoAssetFormRoutes } from '@app/pages/send/send-crypto-asset-form/send-crypto-asset-form.routes';
import { SettingsPage } from '@app/pages/settings/settings';
import {
  bitcoinSwapLegacyRoutes,
  stacksSwapLegacyRoutes,
} from '@app/pages/swap-legacy/swap.routes';
import { swapRoutes } from '@app/pages/swap/swap.routes';
import { SelectTheme } from '@app/pages/theme/select-theme';
import { UnauthorizedRequest } from '@app/pages/unauthorized-request/unauthorized-request';
import { Unlock } from '@app/pages/unlock';
import { ViewSecretKey } from '@app/pages/view-secret-key/view-secret-key';
import { AccountGate } from '@app/routes/account-gate';
import { SidePanelRequestLayout } from '@app/routes/components/side-panel-request-layout';
import { legacyRequestRoutes } from '@app/routes/request-routes';
import { rpcRequestRoutes } from '@app/routes/rpc-routes';

import { OnboardingGate } from './onboarding-gate';

export function SuspenseLoadingSpinner() {
  return <LoadingSpinner height="100vh" />;
}

export function AppRoutes() {
  const routes = useAppRoutes();
  return <RouterProvider router={routes} />;
}

const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouterV7(createHashRouter);

export const homePageModalRoutes = (
  <>
    {ledgerStacksTxSigningRoutes}
    {ledgerBitcoinTxSigningRoutes}
    {requestBitcoinKeysRoutes}
    {requestStacksKeysRoutes}
    {verifyBtcAddressRoutes}
    {verifyStxAddressRoutes}
    <Route path={RouteUrls.ConnectLedgerStart} element={<ConnectLedgerStart initialRoute="" />} />
    <Route path={RouteUrls.LedgerUnsupportedBrowser} element={<UnsupportedBrowserLayout />} />
  </>
);

function useAppRoutes() {
  const { releaseOnramperBuy, releaseOnramperSell, swapRevamp } = useFlags();

  return sentryCreateBrowserRouter(
    createRoutesFromElements(
      <Route element={<Container />}>
        <Route key="error" errorElement={<RouterErrorBoundary />}>
          <Route
            element={
              <>
                <HomeHeader />
                <Content>
                  <SwitchAccountLayout />
                </Content>
              </>
            }
          >
            <Route
              path="/*"
              element={
                <AccountGate>
                  <Home />
                </AccountGate>
              }
            >
              {homePageModalRoutes}
            </Route>

            <Route
              path={RouteUrls.IncreaseStacksFee}
              element={<IncreaseStacksTransactionFeeSheet />}
            >
              {ledgerStacksTxSigningRoutes}
            </Route>
            <Route
              path={RouteUrls.CancelStacksTransaction}
              element={<CancelStacksTransactionSheet />}
            >
              {ledgerStacksTxSigningRoutes}
            </Route>
            <Route
              path={`${RouteUrls.IncreaseStacksFee}/${RouteUrls.BroadcastError}`}
              element={<BroadcastError />}
            />
            <Route path={RouteUrls.IncreaseBtcFee} element={<IncreaseBtcFeeSheet />}>
              {ledgerBitcoinTxSigningRoutes}
            </Route>

            {ledgerStacksTxSigningRoutes}
          </Route>
          {/* Page Routes */}

          <Route
            path={`${RouteUrls.IncreaseStacksFee}/${RouteUrls.BroadcastError}`}
            element={<BroadcastError />}
          />
          <Route path={RouteUrls.IncreaseBtcFee} element={<IncreaseBtcFeeSheet />}>
            {ledgerBitcoinTxSigningRoutes}
          </Route>

          {ledgerStacksTxSigningRoutes}

          <Route
            path={RouteUrls.AddNetwork}
            element={
              <AccountGate>
                <CurrentAddNetwork />
              </AccountGate>
            }
          />

          <Route
            path={RouteUrls.EditNetwork}
            element={
              <AccountGate>
                <CurrentEditNetwork />
              </AccountGate>
            }
          />

          {releaseOnramperBuy && (
            <Route
              path={RouteUrls.Fund}
              element={
                <AccountGate>
                  <FundPage />
                </AccountGate>
              }
            />
          )}

          {releaseOnramperSell && (
            <Route
              path={RouteUrls.Sell}
              element={
                <AccountGate>
                  <SellPage />
                </AccountGate>
              }
            />
          )}

          {sendCryptoAssetFormRoutes}

          <Route
            path={RouteUrls.TokenDetails}
            element={
              <AccountGate>
                <TokenDetails />
              </AccountGate>
            }
          />

          <Route path={RouteUrls.Unlock} element={<Unlock />} />
          <Route path={RouteUrls.UnauthorizedRequest} element={<UnauthorizedRequest />} />
          <Route
            path={RouteUrls.RequestError}
            element={
              <AccountGate>
                <RequestError />
              </AccountGate>
            }
          />

          {swapRevamp ? swapRoutes : bitcoinSwapLegacyRoutes}
          {swapRevamp ? swapRoutes : stacksSwapLegacyRoutes}

          {/* OnBoarding Routes */}
          <Route
            path={RouteUrls.Onboarding}
            element={
              <OnboardingGate>
                <WelcomePage />
              </OnboardingGate>
            }
          >
            <Route path={RouteUrls.ConnectLedgerStart} element={<ConnectLedgerStart />} />
            <Route
              path={RouteUrls.LedgerUnsupportedBrowser}
              element={<UnsupportedBrowserLayout />}
            />

            {requestBitcoinKeysRoutes}
            {requestStacksKeysRoutes}
          </Route>

          <Route
            path={RouteUrls.BackUpSecretKey}
            element={
              <OnboardingGate>
                <BackUpSecretKeyPage />
              </OnboardingGate>
            }
          />

          <Route
            path={RouteUrls.SignIn}
            element={
              <OnboardingGate>
                <SignIn />
              </OnboardingGate>
            }
          />
          <Route
            path={RouteUrls.AddWallet}
            element={
              <AccountGate>
                <AddWallet />
              </AccountGate>
            }
          />
          <Route
            path={RouteUrls.CreateWallet}
            element={
              <AccountGate>
                <BackUpSecretKeyPage />
              </AccountGate>
            }
          />
          <Route
            path={RouteUrls.ViewSecretKey}
            element={
              <AccountGate>
                <ViewSecretKey />
              </AccountGate>
            }
          />

          <Route
            path={RouteUrls.Settings}
            element={
              <AccountGate>
                <SettingsPage />
              </AccountGate>
            }
          />

          <Route
            path={RouteUrls.ManageTokens}
            element={
              <AccountGate>
                <ManageTokensPage />
              </AccountGate>
            }
          />

          <Route
            path={RouteUrls.SelectNetwork}
            element={
              <AccountGate>
                <SelectNetwork />
              </AccountGate>
            }
          />
          <Route
            path={RouteUrls.SelectTheme}
            element={
              <AccountGate>
                <SelectTheme />
              </AccountGate>
            }
          />

          {/* Popup Routes */}
          {/* ChooseAccount is a popup as shown only in popup when decodedAuthRequest in set-password  */}
          <Route element={<SidePanelRequestLayout />}>
            <Route
              path={RouteUrls.ChooseAccount}
              element={
                <AccountGate>
                  <LegacyAccountAuth />
                </AccountGate>
              }
            >
              {ledgerJwtSigningRoutes}
            </Route>
            {legacyRequestRoutes}
            {rpcRequestRoutes}
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <AccountGate>
              <NotFoundPage />
            </AccountGate>
          }
        />
      </Route>
    ),
    {
      future: {
        v7_relativeSplatPath: true,
        v7_startTransition: true,
        v7_fetcherPersist: true,
        v7_normalizeFormMethod: true,
        v7_partialHydration: true,
      },
    }
  );
}
