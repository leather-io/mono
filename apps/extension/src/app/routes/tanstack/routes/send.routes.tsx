import { createRoute } from '@tanstack/react-router';

import { RouteUrls } from '@shared/route-urls';

import { BroadcastErrorSheet } from '@app/components/broadcast-error-dialog/broadcast-error-dialog';
import { EditNonceSheet } from '@app/features/dialogs/edit-nonce-dialog/edit-nonce-dialog';
import { StacksHighFeeWarningContainer } from '@app/features/stacks-high-fee-warning/stacks-high-fee-warning-container';
import { BroadcastError } from '@app/pages/send/broadcast-error/broadcast-error';
import { ChooseCryptoAsset } from '@app/pages/send/choose-crypto-asset/choose-crypto-asset';
import { SendBtcDisabled } from '@app/pages/send/choose-crypto-asset/send-btc-disabled';
import { RecipientAccountsSheet } from '@app/pages/send/send-crypto-asset-form/components/recipient-accounts-dialog/recipient-accounts-dialog';
import { SendBitcoinAssetContainer } from '@app/pages/send/send-crypto-asset-form/family/bitcoin/components/send-bitcoin-asset-container';
import { BtcChooseFee } from '@app/pages/send/send-crypto-asset-form/form/btc/btc-choose-fee';
import { BtcSendForm } from '@app/pages/send/send-crypto-asset-form/form/btc/btc-send-form';
import { BtcSendFormConfirmation } from '@app/pages/send/send-crypto-asset-form/form/btc/btc-send-form-confirmation';
import { Sip10TokenSendForm } from '@app/pages/send/send-crypto-asset-form/form/sip10/sip10-token-send-form';
import { StacksSendFormConfirmation } from '@app/pages/send/send-crypto-asset-form/form/stacks/stacks-send-form-confirmation';
import { StxSendForm } from '@app/pages/send/send-crypto-asset-form/form/stx/stx-send-form';
import { BtcSentSummary } from '@app/pages/send/sent-summary/btc-sent-summary';
import { StacksChainTxSummaryRoute } from '@app/pages/send/sent-summary/stacks/stacks-chain-tx-summary.route';

import { rootRoute } from '../root-route';
import {
  createLedgerBitcoinTxSigningRoutes,
  createLedgerStacksTxSigningRoutes,
} from './ledger.routes';

const chooseCryptoAssetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.SendCryptoAsset,
  component: ChooseCryptoAsset,
});

const sendBitcoinContainerRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'send-bitcoin-container',
  component: SendBitcoinAssetContainer,
});

const btcSendFormRoute = createRoute({
  getParentRoute: () => sendBitcoinContainerRoute,
  path: '/send/btc',
  component: BtcSendForm,
});

const recipientAccountsBtcRoute = createRoute({
  getParentRoute: () => btcSendFormRoute,
  path: RouteUrls.SendCryptoAssetFormRecipientAccounts,
  component: RecipientAccountsSheet,
});

const sendBtcDisabledRoute = createRoute({
  getParentRoute: () => sendBitcoinContainerRoute,
  path: RouteUrls.SendBtcDisabled,
  component: SendBtcDisabled,
});

const sendBtcErrorRoute = createRoute({
  getParentRoute: () => sendBitcoinContainerRoute,
  path: RouteUrls.SendBtcError,
  component: BroadcastError,
});

const btcSendConfirmationRoute = createRoute({
  getParentRoute: () => sendBitcoinContainerRoute,
  path: RouteUrls.SendBtcConfirmation,
  component: BtcSendFormConfirmation,
});

const btcChooseFeeRoute = createRoute({
  getParentRoute: () => sendBitcoinContainerRoute,
  path: RouteUrls.SendBtcChooseFee,
  component: BtcChooseFee,
});

const btcSentSummaryRoute = createRoute({
  getParentRoute: () => sendBitcoinContainerRoute,
  path: '/sent/btc/$txId',
  component: BtcSentSummary,
});

const stxSendFormRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/send/stx',
  component: function StxSendFormWithHighFeeWarning() {
    return (
      <StacksHighFeeWarningContainer>
        <StxSendForm />
      </StacksHighFeeWarningContainer>
    );
  },
});

const stxBroadcastErrorRoute = createRoute({
  getParentRoute: () => stxSendFormRoute,
  path: 'confirm/broadcast-error',
  component: BroadcastErrorSheet,
});

const stxEditNonceRoute = createRoute({
  getParentRoute: () => stxSendFormRoute,
  path: RouteUrls.EditNonce,
  component: EditNonceSheet,
});

const stxRecipientAccountsRoute = createRoute({
  getParentRoute: () => stxSendFormRoute,
  path: RouteUrls.SendCryptoAssetFormRecipientAccounts,
  component: RecipientAccountsSheet,
});

const stxSendConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/send/stx/confirm',
  component: StacksSendFormConfirmation,
});

const sip10SendFormRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/send/$symbol/$contractId',
  component: function Sip10SendFormWithHighFeeWarning() {
    return (
      <StacksHighFeeWarningContainer>
        <Sip10TokenSendForm />
      </StacksHighFeeWarningContainer>
    );
  },
});

const sip10BroadcastErrorRoute = createRoute({
  getParentRoute: () => sip10SendFormRoute,
  path: 'confirm/broadcast-error',
  component: BroadcastErrorSheet,
});

const sip10EditNonceRoute = createRoute({
  getParentRoute: () => sip10SendFormRoute,
  path: RouteUrls.EditNonce,
  component: EditNonceSheet,
});

const sip10RecipientAccountsRoute = createRoute({
  getParentRoute: () => sip10SendFormRoute,
  path: RouteUrls.SendCryptoAssetFormRecipientAccounts,
  component: RecipientAccountsSheet,
});

const sip10ConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/send/$symbol/$contractId/confirm',
  component: StacksSendFormConfirmation,
});

const stxSentSummaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sent/$symbol/$txid',
  component: StacksChainTxSummaryRoute,
});

export const sendRoutes = [
  chooseCryptoAssetRoute,
  sendBitcoinContainerRoute.addChildren([
    btcSendFormRoute.addChildren([
      createLedgerBitcoinTxSigningRoutes(btcSendFormRoute),
      recipientAccountsBtcRoute,
    ]),
    sendBtcDisabledRoute,
    sendBtcErrorRoute,
    btcSendConfirmationRoute,
    btcChooseFeeRoute.addChildren([createLedgerBitcoinTxSigningRoutes(btcChooseFeeRoute)]),
    btcSentSummaryRoute,
  ]),
  stxSendFormRoute.addChildren([
    stxBroadcastErrorRoute,
    stxEditNonceRoute,
    stxRecipientAccountsRoute,
  ]),
  stxSendConfirmationRoute.addChildren([
    createLedgerStacksTxSigningRoutes(stxSendConfirmationRoute),
  ]),
  sip10SendFormRoute.addChildren([
    sip10BroadcastErrorRoute,
    sip10EditNonceRoute,
    sip10RecipientAccountsRoute,
  ]),
  sip10ConfirmationRoute.addChildren([createLedgerStacksTxSigningRoutes(sip10ConfirmationRoute)]),
  stxSentSummaryRoute,
];
