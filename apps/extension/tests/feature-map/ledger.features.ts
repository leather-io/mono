import { CoreAssetSelectors } from '@tests/selectors/mocked-tokens.selectors';

import type { ExtensionFeatureEntry } from './extension-feature-entry';

const defaultMocks = ['setupMockApis', 'mockUnhandledRequests'] as const;

export const ledgerFeatures = [
  {
    id: 'ledger-flow',
    anchor: { kind: 'behavior' },
    routes: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'With a Ledger wallet click "Connect Bitcoin" or "Connect Stacks" on the asset row (CoreAssetSelectors.ConnectLedgerBitcoin, CoreAssetSelectors.ConnectLedgerStacks), press a verify button in the receive dialog, or approve a transaction or message signature',
          'LedgerFlowProvider (apps/extension/src/app/features/ledger/flow) opens the Ledger sheet over the current screen without changing the URL and walks the steps the flow reports; Escape or the close button cancels the flow',
          'In a request popup the pairing step sends the user to a full-screen tab ("Open Leather in full screen") because popup windows cannot show the WebHID chooser',
        ],
      },
    ],
    gate: 'account',
    flags: [],
    preconditions: {
      session: 'signed-in',
      accountType: 'ledger',
      mocks: [...defaultMocks],
    },
    selectors: {
      others: [CoreAssetSelectors.ConnectLedgerBitcoin, CoreAssetSelectors.ConnectLedgerStacks],
    },
    actions: ['OnboardingPage.signInWithLedgerAccount', 'HomePage.goToReceiveDialog'],
    specs: [
      'apps/extension/tests/specs/ledger/ledger.spec.ts',
      'apps/extension/tests/specs/ledger/ledger-rpc-pairing.spec.ts',
    ],
    description:
      "The Ledger device flow moved off URL routes onto a dialog host. LedgerFlowHost (flow/ledger-flow-host.tsx) dispatches on the request kind: sign-bitcoin-tx, sign-stacks-tx, sign-stacks-message, request-keys, verify-address, confirm-btc-policy-address, connect-start, unsupported-browser and pair-device; unsupported-browser replaces connect-start when WebHID is unavailable. Steps rendered by the sheet (LedgerStep in flow/ledger-flow.types.ts): connect, checking-app-version, awaiting-device-operation, outdated-stacks-app, choose-address-standard, device-busy, connection-error, pair-device, connection-success, payload-invalid, operation-rejected and disconnected. None of the step components carries a data-testid, so the specs assert on copy and a verify run cannot wait for it; signed-in Ledger specs seed the wallet with OnboardingPage.signInWithLedgerAccount and never reach a real device. HomePage.goToReceiveDialog opens the receive dialog whose verify buttons start verify-address. The \"Connect Bitcoin\" and \"Connect Stacks\" rows (connect-ledger-asset-item-fallback.tsx) render on Home only for a Ledger wallet that lacks that chain's keys (makeLedgerTestAccountWalletState(['stacks']) or (['bitcoin']) in ledger.spec). ledger.spec registers mockMainnetTestAccountStacksConfirmedTxsRequests before seeding so the Activity tab shows confirmed Stacks transactions; ledger-rpc-pairing.spec does not.",
  },
] as const satisfies readonly ExtensionFeatureEntry[];
