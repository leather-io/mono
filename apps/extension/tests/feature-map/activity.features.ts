import { ActivitySelectors } from '@tests/selectors/activity.selectors';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import { RouteUrls } from '@shared/route-urls';

import type { ExtensionFeatureEntry } from './extension-feature-entry';

const manageTransactionSpec =
  'apps/extension/tests/specs/manage-transaction/manage-transaction.spec.ts';
const rbfBtcSpec = 'apps/extension/tests/specs/manage-transaction/rbf-btc.spec.ts';

const stacksActionMocks = [
  'setupMockApis',
  'mockUnhandledRequests',
  'mockTestAccountStacksTxsRequestsWithPendingTx',
  'mockStacksRawTx',
  'mockStacksPendingTransaction',
  'mockStacksBroadcastTransaction',
] as const;

export const activityFeatures = [
  {
    id: 'increase-btc-fee',
    anchor: { kind: 'route' },
    deepLinkable: false,
    routes: [RouteUrls.IncreaseBtcFee],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Before sign-in register mockPendingBitcoinTransactions(page, [tx]) (esplora, read by usePendingBitcoinTxByTxid), mockLeatherBitcoinTransactions(context, [leatherTxFromEsplora(tx)]) (the activity row) and mockMixedUtxoRequests(page, utxos) (the inputs), as rbf-btc.spec.ts does',
          'On the Activity tab a pending BTC transaction the wallet sent shows an inline "Increase fee" button with no test id (increase-fee-button.tsx; the rbf-btc spec clicks it by text); there is no row menu for BTC',
          'Clicking it navigates to /increase-fee/btc with the transaction in route state and the sheet opens',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: {
      session: 'signed-in',
      mocks: ['setupMockApis', 'mockUnhandledRequests'],
    },
    selectors: {
      ready: ActivitySelectors.TransactionActionBalance,
      others: [
        ActivitySelectors.TransactionActionFeeInput,
        ActivitySelectors.TransactionSubmitAction,
        SendCryptoAssetSelectors.TaprootUtxoWarningDialog,
      ],
    },
    actions: ['HomePage.clickActivityTab', 'HomePage.setBitcoinIncreasedFeeRate'],
    specs: [rbfBtcSpec],
    description:
      'Replace-by-fee sheet for a pending Bitcoin transaction the wallet sent. It shows a "Balance:" caption with the available plus outbound BTC (ActivitySelectors.TransactionActionBalance; the fee validation closes over it, so HomePage.setBitcoinIncreasedFeeRate waits for it) and a "sats/vB" fee-rate input (ActivitySelectors.TransactionActionFeeInput); "Submit" ("Confirm on Ledger" for a Ledger wallet, transaction-actions.tsx) rebuilds and broadcasts the replacement, showing the taproot UTXO warning (SendCryptoAssetSelectors.TaprootUtxoWarningDialog, "I understand, continue") only when taproot inputs are spent. Success shows a "Fee increased successfully" toast and navigates to /activity; a failure shows an error toast and navigates to / (use-btc-increase-fee.ts). Only pending transactions the wallet sent get the inline button (activity-row-actions.tsx checks initiatedByUser), and only when usePendingBitcoinTxByTxid finds the esplora tx, so inbound and confirmed rows have none. With only the listed mocks there is no pending BTC row: rbf-btc.spec.ts registers mockPendingBitcoinTransactions, mockLeatherBitcoinTransactions and mockMixedUtxoRequests with tx data before sign-in (see the entry steps), and its two submit tests register mockBitcoinMainnetBroadcast(page) for Submit. "This transaction can\'t be sped up in Leather." renders when the route is opened without the transaction in route state, for example by deep link or reload (increase-btc-fee-dialog.tsx). The route is a sibling of the Home route inside the same header and content layout, without an AccountGate; closing it navigates to /.',
  },
  {
    id: 'increase-stacks-fee',
    anchor: { kind: 'route' },
    routes: [RouteUrls.IncreaseStacksFee, RouteUrls.BroadcastError],
    params: [
      {
        name: 'txid',
        example: '0x2fd347fd2f775db6bec23e566a1d1d4914f10502f6a0d44692e93aa80cf047e4',
      },
    ],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On the Activity tab open the menu of a pending Stacks transaction (ActivitySelectors.ActivityItemMenuBtn)',
          'Click "Increase fee" (ActivitySelectors.ActivityItemMenuIncreaseFee)',
        ],
      },
      { kind: 'deepLink', steps: ['Open #/increase-fee/stacks/<txid> for a pending transaction'] },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...stacksActionMocks] },
    selectors: {
      ready: ActivitySelectors.TransactionActionFeeInput,
      others: [
        ActivitySelectors.TransactionActionSheet,
        ActivitySelectors.TransactionSubmitAction,
        SharedComponentsSelectors.BroadcastErrorTitle,
      ],
    },
    actions: ['HomePage.clickActivityTab', 'HomePage.setStacksTransactionActionFee'],
    specs: [manageTransactionSpec],
    description:
      'Sheet that rebroadcasts a pending Stacks transaction with a higher fee. The sheet\'s content has the data-testid ActivitySelectors.TransactionActionSheet suffixed with -increase-fee, which HomePage.setStacksTransactionActionFee uses to scope the fee input. "Submit" stays disabled until the fee exceeds the original (stacks-transaction-action-sheet.tsx). A sponsored transaction gets the toast "The fee of a sponsored transaction is paid by its sponsor and cannot be increased" and is not broadcast (use-stacks-transaction-action.ts). Success navigates to /activity with a "Fee increased successfully" toast (use-stacks-broadcast-transaction.tsx); a failed broadcast renders the nested broadcast-error page. An unknown txid shows a "Transaction not found" toast and returns home; closing the sheet navigates to /. manage-transaction.spec.ts also registers mockLeatherBitcoinTransactions(context, []) before sign-in to empty the Bitcoin side of the feed. Mounted inside the home layout without an AccountGate.',
  },
  {
    id: 'cancel-stacks-transaction',
    anchor: { kind: 'route' },
    routes: [RouteUrls.CancelStacksTransaction],
    params: [
      {
        name: 'txid',
        example: '0x2fd347fd2f775db6bec23e566a1d1d4914f10502f6a0d44692e93aa80cf047e4',
      },
    ],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On the Activity tab open the menu of a pending Stacks transaction (ActivitySelectors.ActivityItemMenuBtn)',
          'Click "Cancel transaction" (ActivitySelectors.ActivityItemMenuCancelTransaction)',
        ],
      },
      {
        kind: 'deepLink',
        steps: ['Open #/cancel-transaction/stacks/<txid> for a pending transaction'],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...stacksActionMocks] },
    selectors: {
      ready: ActivitySelectors.TransactionActionFeeInput,
      others: [ActivitySelectors.TransactionActionSheet, ActivitySelectors.TransactionSubmitAction],
    },
    actions: ['HomePage.clickActivityTab', 'HomePage.setStacksTransactionActionFee'],
    specs: [manageTransactionSpec],
    description:
      'Sheet that replaces a pending Stacks transaction with a 1 micro-STX transfer to the burn address, memo "_cancel transaction", at the same nonce and the fee entered here, so the original is dropped (use-stacks-transaction-action.ts). Same component as the increase-fee sheet with the -cancel suffix on its test id. The fee field defaults to the original fee plus 1 micro-STX and "Submit" stays disabled until the fee exceeds the original (stacks-transaction-action-sheet.tsx). Success shows "Transaction cancelled successfully" and navigates to /activity. A failed broadcast calls navigate with the relative path broadcast-error (use-stacks-broadcast-transaction.tsx), which resolves to /cancel-transaction/stacks/:txid/broadcast-error; the router only defines that child under /increase-fee/stacks/:txid (app-routes.tsx), so the failure lands on the home not-found content instead of an error page. manage-transaction.spec.ts also registers mockLeatherBitcoinTransactions(context, []) before sign-in to empty the Bitcoin side of the feed. Mounted inside the home layout without an AccountGate; closing it navigates to /.',
  },
] as const satisfies readonly ExtensionFeatureEntry[];
