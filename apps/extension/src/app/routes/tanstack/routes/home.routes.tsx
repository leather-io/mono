import { createRoute } from '@tanstack/react-router';

import { RouteUrls } from '@shared/route-urls';

import { Content } from '@app/components/layout/layouts/content.layout';
import { SwitchAccountLayout } from '@app/components/layout/layouts/switch-account.layout';
import { HomeHeader } from '@app/features/container/headers/home.header';
import { CancelStacksTransactionSheet } from '@app/features/dialogs/transaction-action-dialog/cancel-stacks-transaction-sheet';
import { IncreaseBtcFeeSheet } from '@app/features/dialogs/transaction-action-dialog/increase-btc-fee-dialog';
import { IncreaseStacksTransactionFeeSheet } from '@app/features/dialogs/transaction-action-dialog/increase-stacks-fee-sheet';
import { RetrieveTaprootToNativeSegwit } from '@app/features/retrieve-taproot-to-native-segwit/retrieve-taproot-to-native-segwit';
import { TokenDetails } from '@app/features/token/token-details';
import { Home } from '@app/pages/home/home';
import { BroadcastError } from '@app/pages/send/broadcast-error/broadcast-error';
import { SendInscriptionContainer } from '@app/pages/send/ordinal-inscription/components/send-inscription-container';
import { SendInscriptionChooseFee } from '@app/pages/send/ordinal-inscription/send-inscription-choose-fee';
import { SendInscriptionForm } from '@app/pages/send/ordinal-inscription/send-inscription-form';
import { SendInscriptionReview } from '@app/pages/send/ordinal-inscription/send-inscription-review';
import { SendInscriptionSummary } from '@app/pages/send/ordinal-inscription/sent-inscription-summary';
import { AccountGate } from '@app/routes/account-gate';

import { rootRoute } from '../root-route';
import {
  createLedgerBitcoinTxSigningRoutes,
  createLedgerRequestBitcoinKeysRoutes,
  createLedgerRequestStacksKeysRoutes,
  createLedgerStacksTxSigningRoutes,
} from './ledger.routes';

export const homeLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'home-layout',
  component: function HomeLayout() {
    return (
      <AccountGate>
        <HomeHeader />
        <Content>
          <SwitchAccountLayout />
        </Content>
      </AccountGate>
    );
  },
});

export const homeRoute = createRoute({
  getParentRoute: () => homeLayoutRoute,
  path: '/',
  component: Home,
});

const activityRoute = createRoute({
  getParentRoute: () => homeLayoutRoute,
  path: RouteUrls.Activity,
  component: Home,
});

const collectiblesRoute = createRoute({
  getParentRoute: () => homeLayoutRoute,
  path: RouteUrls.Collectibles,
  component: Home,
});

const sendOrdinalInscriptionRoute = createRoute({
  getParentRoute: () => homeLayoutRoute,
  path: RouteUrls.SendOrdinalInscription,
  component: SendInscriptionContainer,
});

const sendInscriptionFormRoute = createRoute({
  getParentRoute: () => sendOrdinalInscriptionRoute,
  path: '/',
  component: SendInscriptionForm,
});

const sendInscriptionChooseFeeRoute = createRoute({
  getParentRoute: () => sendOrdinalInscriptionRoute,
  path: RouteUrls.SendOrdinalInscriptionChooseFee,
  component: SendInscriptionChooseFee,
});

const sendInscriptionReviewRoute = createRoute({
  getParentRoute: () => sendOrdinalInscriptionRoute,
  path: RouteUrls.SendOrdinalInscriptionReview,
  component: SendInscriptionReview,
});

const sendInscriptionSummaryRoute = createRoute({
  getParentRoute: () => sendOrdinalInscriptionRoute,
  path: RouteUrls.SendOrdinalInscriptionSent,
  component: SendInscriptionSummary,
});

const sendInscriptionErrorRoute = createRoute({
  getParentRoute: () => sendOrdinalInscriptionRoute,
  path: RouteUrls.SendOrdinalInscriptionError,
  component: BroadcastError,
});

const retrieveTaprootFundsHomeRoute = createRoute({
  getParentRoute: () => homeLayoutRoute,
  path: RouteUrls.RetrieveTaprootFunds,
  component: RetrieveTaprootToNativeSegwit,
});

const increaseStacksFeeRoute = createRoute({
  getParentRoute: () => homeLayoutRoute,
  path: '/increase-fee/stacks/$txid',
  component: IncreaseStacksTransactionFeeSheet,
});

const cancelStacksTransactionRoute = createRoute({
  getParentRoute: () => homeLayoutRoute,
  path: '/cancel-transaction/stacks/$txid',
  component: CancelStacksTransactionSheet,
});

const increaseStacksFeeBroadcastErrorRoute = createRoute({
  getParentRoute: () => homeLayoutRoute,
  path: '/increase-fee/stacks/$txid/broadcast-error',
  component: BroadcastError,
});

const increaseBtcFeeRoute = createRoute({
  getParentRoute: () => homeLayoutRoute,
  path: RouteUrls.IncreaseBtcFee,
  component: IncreaseBtcFeeSheet,
});

export const tokenDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/token/$',
  component: function TokenDetailsGated() {
    return (
      <AccountGate>
        <TokenDetails />
      </AccountGate>
    );
  },
});

export const homeRoutes = homeLayoutRoute.addChildren([
  activityRoute,
  collectiblesRoute,
  homeRoute,
  createLedgerStacksTxSigningRoutes(homeLayoutRoute),
  createLedgerBitcoinTxSigningRoutes(homeLayoutRoute),
  createLedgerRequestBitcoinKeysRoutes(homeLayoutRoute),
  createLedgerRequestStacksKeysRoutes(homeLayoutRoute),
  sendOrdinalInscriptionRoute.addChildren([
    createLedgerBitcoinTxSigningRoutes(sendOrdinalInscriptionRoute),
    sendInscriptionFormRoute,
    sendInscriptionChooseFeeRoute.addChildren([
      createLedgerBitcoinTxSigningRoutes(sendInscriptionChooseFeeRoute),
    ]),
    sendInscriptionReviewRoute,
    sendInscriptionSummaryRoute,
    sendInscriptionErrorRoute,
  ]),
  retrieveTaprootFundsHomeRoute,
  increaseStacksFeeRoute.addChildren([createLedgerStacksTxSigningRoutes(increaseStacksFeeRoute)]),
  cancelStacksTransactionRoute.addChildren([
    createLedgerStacksTxSigningRoutes(cancelStacksTransactionRoute),
  ]),
  increaseStacksFeeBroadcastErrorRoute,
  increaseBtcFeeRoute.addChildren([createLedgerBitcoinTxSigningRoutes(increaseBtcFeeRoute)]),
]);
