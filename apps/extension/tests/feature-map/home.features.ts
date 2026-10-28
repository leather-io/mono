import { ActivitySelectors } from '@tests/selectors/activity.selectors';
import { BondsSelectors } from '@tests/selectors/bonds.selectors';
import { CollectiblesSelectors } from '@tests/selectors/collectibles.selectors';
import { HomePageSelectors } from '@tests/selectors/home.selectors';
import {
  CoreAssetSelectors,
  MockedTokensSelectors,
} from '@tests/selectors/mocked-tokens.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';
import { UpdateAvailableSelectors } from '@tests/selectors/update-available.selectors';

import { RouteUrls } from '@shared/route-urls';

import type { ExtensionFeatureEntry } from './extension-feature-entry';

const homeTabsSpec = 'apps/extension/tests/specs/home-tabs/home-tabs.spec.ts';
const policyAccountSurfacesSpec =
  'apps/extension/tests/specs/policy-surfaces/policy-account-surfaces.spec.ts';
const policyAccountsSpec = 'apps/extension/tests/specs/switch-account/policy-accounts.spec.ts';
const defaultMocks = ['setupMockApis', 'mockUnhandledRequests'] as const;

export const homeFeatures = [
  {
    id: 'home-tokens',
    anchor: { kind: 'route' },
    routes: [RouteUrls.Home],
    params: [],
    entry: [
      {
        kind: 'deepLink',
        steps: ['Open the extension popup, or #/ in a full-page tab, with an unlocked wallet'],
      },
      { kind: 'nav', steps: ['From the Collectibles or Activity tab click the "Tokens" tab'] },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: HomePageSelectors.HomePageContainer,
      others: [
        HomePageSelectors.AssetList,
        HomePageSelectors.AvailableBalance,
        SharedComponentsSelectors.AccountCardBalanceText,
        HomePageSelectors.SendCryptoAssetBtn,
        HomePageSelectors.ReceiveCryptoAssetBtn,
        HomePageSelectors.SwapBtn,
        HomePageSelectors.ManageTokensBtn,
        HomePageSelectors.TokensTabBtn,
        HomePageSelectors.CollectiblesTabBtn,
        HomePageSelectors.ActivityTabBtn,
        HomePageSelectors.NetworkSwitcher,
        CoreAssetSelectors.BtcAsset,
        CoreAssetSelectors.StxAsset,
        CoreAssetSelectors.UsdcxAsset,
        CoreAssetSelectors.BtcAssetBuyButton,
        CoreAssetSelectors.StxAssetBuyButton,
        CoreAssetSelectors.UsdcxAssetBridgeButton,
        HomePageSelectors.TrendingToken,
        BondsSelectors.BondCallout,
        BondsSelectors.LockedBalanceCard,
        SettingsSelectors.SettingsMenuBtn,
        SettingsSelectors.SigningAccountCard,
      ],
    },
    actions: [
      'OnboardingPage.signInWithTestAccount',
      'HomePage.waitForHomePageReady',
      'HomePage.clickTokensTab',
      'HomePage.goToReceiveDialog',
      'HomePage.goToManageTokensPage',
      'HomePage.goBackFromManageTokens',
      'HomePage.switchAccount',
    ],
    specs: [
      'apps/extension/tests/specs/tokens/tokens-tab.spec.ts',
      homeTabsSpec,
      'apps/extension/tests/specs/receive/receive.spec.ts',
      'apps/extension/tests/specs/trending-tokens/trending-tokens.spec.ts',
      'apps/extension/tests/specs/fund/fund.spec.ts',
      'apps/extension/tests/specs/manage-tokens/manage-tokens.spec.ts',
      policyAccountsSpec,
      policyAccountSurfacesSpec,
    ],
    description:
      'The default home screen: the account card (total balance, and the network badge (HomePageSelectors.NetworkSwitcher) shown off mainnet, or always when the badge-always-on setting is enabled; network-switcher.tsx) and the action row. At the md breakpoint and above the row has "Send" and "Receive" buttons; below it a single "Transfer" button, which carries the ReceiveCryptoAssetBtn test id, opens a sheet with both (transfer-buttons.tsx). The Buy and Sell buttons and their narrow-viewport "Buy & Sell" sheet belong to the fund and sell entries. "Swap" renders disabled with a tooltip when the account has no Stacks key, the network is a testnet or a policy account is active (account-actions.tsx, use-swap-availability.ts). The Tokens tab lists BTC, STX and USDCx plus held SIP-10 tokens, and clicking a row opens /token/*. The BTC and STX rows show a "Buy" button when they have no recorded activity, the releaseOnramperBuy flag is on, the network is mainnet and no policy is active (asset-list/utils.ts); in the popup it opens /fund/<chain> in a full-page tab and closes the popup. A zero-balance USDCx row on mainnet shows "Bridge" (CoreAssetSelectors.UsdcxAssetBridgeButton), which opens the Stacks bridge in a new tab; SIP-10 rows get neither. When the account has activity the tab header shows an "Available" balance (HomePageSelectors.AvailableBalance) and a sliders icon button with no text (HomePageSelectors.ManageTokensBtn) that navigates to /manage-tokens; when the activity feed is empty the header is replaced by a "Get your first token" banner and both are absent (tokens.tsx, first-token-banner.tsx). Below the list, the "Trending tokens" section (releaseTrendingTokens, on in the E2E LaunchDarkly mock; cards carry the HomePageSelectors.TrendingToken prefix and open token details, trending-tokens.spec.ts) and the tokens-learn section render; above it the OrdinalsRunesSunsetCallout and AeusdcRetirementCallout. Home also renders the PromoBanner, a FeedbackButton in full-page mode only, the bond callout (BondsSelectors.BondCallout, "Your bond has unlocked" or "Your bond unlocks in N days", only with a matured or ending-soon bond position) and, under the total balance, the locked-balance card (BondsSelectors.LockedBalanceCard, only when the locked balance is above zero) that navigates to /all-balances (home.tsx, account-card.tsx, bond-callout.tsx); no mock in tests/mocks provides bond positions or a locked balance, so neither renders in E2E. policy-account-surfaces.spec.ts signs in with an active Stacks policy and mockStacksPolicyData(page, address), which adds the policy address\'s NFT holdings and receive activity (the SIP-10 rows come from the any-address balance mocks inside setupMockApis); policy-accounts.spec.ts switches to a Bitcoin or Stacks policy and asserts that a Bitcoin policy hides the Collectibles tab. The receive sheet opens from the Receive action without a route (receive-dialog entry).',
  },
  {
    id: 'home-activity',
    anchor: { kind: 'route' },
    routes: [RouteUrls.Activity],
    params: [],
    entry: [
      { kind: 'nav', steps: ['On home click the "Activity" tab'] },
      { kind: 'deepLink', steps: ['Open #/activity with an unlocked wallet'] },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: ActivitySelectors.ActivityList,
      others: [
        HomePageSelectors.ActivityTabBtn,
        ActivitySelectors.ActivityItemMenuBtn,
        ActivitySelectors.ActivityItemMenuIncreaseFee,
        ActivitySelectors.ActivityItemMenuCancelTransaction,
      ],
    },
    actions: ['HomePage.clickActivityTab'],
    specs: [
      'apps/extension/tests/specs/activity/activity-list.spec.ts',
      'apps/extension/tests/specs/activity/sbtc-deposit-activity.spec.ts',
      homeTabsSpec,
      'apps/extension/tests/specs/manage-transaction/manage-transaction.spec.ts',
      'apps/extension/tests/specs/manage-transaction/rbf-btc.spec.ts',
      policyAccountSurfacesSpec,
    ],
    description:
      'The Activity tab nested under Home (the tab bar stays visible). Lists Bitcoin and Stacks transactions grouped under a date header, with inbound amounts prefixed "+" and outgoing ones by a minus sign and change excluded; transactions the wallet neither sent nor received are dropped. Clicking a row opens the transaction in the block explorer; an empty feed shows "No activity yet" (no test id). ActivitySelectors.ActivityList wraps the loading, error and empty states as well, so it renders before data arrives; assert on row text or "No activity yet" instead (activity-list.layout.tsx). Only a pending transaction the wallet sent gets an action (activity-row-actions.tsx): a Stacks one gets a menu labelled "Options" (ActivitySelectors.ActivityItemMenuBtn) with "Increase fee" (/increase-fee/stacks/:txid) and "Cancel transaction"; a Bitcoin one gets an inline "Increase fee" button with no test id that navigates to /increase-fee/btc, only when usePendingBitcoinTxByTxid finds the esplora tx, and no cancel action. A failed sBTC deposit gets a "Reclaim" link in place of row actions and the explorer click; pending and accepted deposits show "Pending deposit" / "Pending mint" captions (sbtc-deposit-overlay.ts, activity-row.tsx). The specs drive the Bitcoin side of the feed with mockLeatherBitcoinTransactions(context, txs) registered before sign-in (activity-list.spec.ts, sbtc-deposit-activity.spec.ts, rbf-btc.spec.ts), sbtc-deposit-activity.spec.ts adds mockSbtcDeposits(context, fixture) for the deposit status and mockLeatherBitcoinTransactionByTxId(context, tx) for a standalone row whose funding tx is not in the feed, and rbf-btc.spec.ts adds mockPendingBitcoinTransactions(page, txs) for the BTC "Increase fee" button. The pending Stacks menu needs the stacksActionMocks of activity.features.ts plus mockLeatherBitcoinTransactions(context, []) (manage-transaction.spec.ts). policy-account-surfaces.spec.ts shows the Stacks policy address activity through mockStacksPolicyData(page, address). The AccountGate wrapping Home applies to the nested route.',
  },
  {
    id: 'home-collectibles',
    anchor: { kind: 'route' },
    routes: [RouteUrls.Collectibles],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: ['On home click the "Collectibles" tab (hidden for bitcoin-only policy accounts)'],
      },
      { kind: 'deepLink', steps: ['Open #/collectibles with an unlocked wallet'] },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: CollectiblesSelectors.CollectiblesEmpty,
      others: [
        HomePageSelectors.CollectiblesTabBtn,
        CollectiblesSelectors.CollectibleCardSip9,
        CollectiblesSelectors.ManageCollectiblesBtn,
        CollectiblesSelectors.RefreshCollectibles,
      ],
    },
    actions: ['HomePage.clickCollectiblesTab'],
    specs: [homeTabsSpec, policyAccountSurfacesSpec, policyAccountsSpec],
    description:
      'The Collectibles tab nested under Home: Stacks NFTs and BNS names for the current account. With holdings, the grid shows an "Amount" count and an icon button (aria-label "Manage collectibles", CollectiblesSelectors.ManageCollectiblesBtn) that opens a dropdown whose only item is "Refresh" (CollectiblesSelectors.RefreshCollectibles); without holdings neither renders (collectibles.layout.tsx). The empty state (CollectiblesSelectors.CollectiblesEmpty, "Get your first NFT") offers "Register .btc domain" and "Discover Stacks NFTs", which open new tabs, and "Receive Stacks NFT", which opens the STX receive QR sheet (collectibles-empty.tsx). A failed load shows the "Unable to load collectibles" warning callout. setupMockApis returns no NFT holdings, so the listed mocks render the empty state; CollectibleCardSip9, ManageCollectiblesBtn and RefreshCollectibles need holdings, which only policy-account-surfaces.spec.ts provides by signing in with an active Stacks policy and mockStacksPolicyData(page, address). policy-accounts.spec.ts asserts the tab is hidden for a Bitcoin policy. The AccountGate wrapping Home applies to the nested route.',
  },
  {
    id: 'manage-tokens',
    anchor: { kind: 'route' },
    routes: [RouteUrls.ManageTokens],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On the home Tokens tab click the sliders icon button (HomePageSelectors.ManageTokensBtn, no text; only shown when the account has activity)',
        ],
      },
      { kind: 'deepLink', steps: ['Open #/manage-tokens with an unlocked wallet'] },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: HomePageSelectors.ManageTokensAssetsList,
      others: [MockedTokensSelectors.Sip10TokenTestId, SharedComponentsSelectors.HeaderBackBtn],
    },
    actions: ['HomePage.goToManageTokensPage', 'HomePage.goBackFromManageTokens'],
    specs: [
      'apps/extension/tests/specs/manage-tokens/manage-tokens.spec.ts',
      'apps/extension/tests/specs/tokens/tokens-tab.spec.ts',
    ],
    description:
      'Toggle list of the tokens shown on the home Tokens tab. Core assets (BTC, STX, USDCx) cannot be toggled and are absent from the list; each manageable SIP-10 token has a switch whose data-testid is the token id, and toggling one off removes it from the asset list until toggled back on. An account with nothing manageable shows "No tokens found"; manage-tokens.spec.ts reaches that state by registering mockEmptyStacksBalancesRequest, mockEmptyStacksBalancesV2Request and mockEmptyLeatherApiUtxosRequest before sign-in. The header back button goes to the previous page (navigate(-1)), which is home when opened from the Tokens tab.',
  },
  {
    id: 'receive-dialog',
    anchor: {
      kind: 'selectors',
      objects: [
        'HomePageSelectors.ReceiveAssetsTab',
        'HomePageSelectors.ReceiveCollectiblesTab',
        'HomePageSelectors.ReceiveBtcNativeSegwitQrCodeBtn',
        'HomePageSelectors.ReceiveBtcTaprootQrCodeBtn',
        'HomePageSelectors.ReceiveStxQrCodeBtn',
        'HomePageSelectors.ReceiveBtcNativeSegwitVerifyBtn',
        'HomePageSelectors.ReceiveBtcTaprootVerifyBtn',
        'HomePageSelectors.ReceiveStxVerifyBtn',
        'HomePageSelectors.ReceiveSheetVerifyAddressBtn',
      ],
    },
    routes: [],
    startRoute: RouteUrls.Home,
    open: ['HomePage.goToReceiveDialog'],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On home click "Receive" (HomePageSelectors.ReceiveCryptoAssetBtn); below the md breakpoint that test id sits on the "Transfer" button, whose sheet has the Receive row',
          'With Bitcoin keys and no policy the "Choose asset to receive" sheet opens with a Tokens tab (Bitcoin (BTC), Bitcoin Taproot, Stacks (STX), then one row per swappable SIP-10 asset sharing the Stacks address) and a Collectibles tab (Stacks NFT); the BTC, Taproot and STX rows have a copy button and a QR button that switches the sheet to that address with a QR code, the SIP-10 rows have a copy button only',
          'With a policy account the BTC or STX QR view opens directly; without Bitcoin keys the STX QR view opens directly (transfer-buttons.tsx onReceive)',
          'Row verify buttons need a Ledger wallet with keys for that chain and no policy; they start the Ledger address-verification flow. The BTC QR sheet\'s "Verify" footer button (HomePageSelectors.ReceiveSheetVerifyAddressBtn) also appears for a Ledger Bitcoin multisig and verifies the multisig address (receive-btc.tsx); the STX QR sheet excludes policies (receive-stx.tsx)',
        ],
      },
      {
        kind: 'nav',
        steps: [
          'Other openers call showReceive from useReceiveDialog: the token-details "Receive" pill (token-details-actions.tsx), the BTC token-details Native Segwit and Taproot address rows (both open the native segwit BTC QR view, bitcoin-token-details.tsx), the policy BTC row (policy-bitcoin-token-details.tsx) and the Collectibles empty-state "Receive Stacks NFT" row, which opens the STX QR view (collectibles-empty.tsx)',
        ],
      },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: HomePageSelectors.ReceiveAssetsTab,
      others: [
        HomePageSelectors.ReceiveCollectiblesTab,
        HomePageSelectors.ReceiveBtcNativeSegwitQrCodeBtn,
        HomePageSelectors.ReceiveBtcTaprootQrCodeBtn,
        HomePageSelectors.ReceiveStxQrCodeBtn,
        HomePageSelectors.ReceiveBtcNativeSegwitVerifyBtn,
        HomePageSelectors.ReceiveBtcTaprootVerifyBtn,
        HomePageSelectors.ReceiveStxVerifyBtn,
        HomePageSelectors.ReceiveSheetVerifyAddressBtn,
        SharedComponentsSelectors.AddressDisplayer,
      ],
    },
    actions: [
      'HomePage.goToReceiveDialog',
      'HomePage.getReceiveNativeSegwitAddress',
      'HomePage.getReceiveStxAddress',
    ],
    specs: [
      'apps/extension/tests/specs/receive/receive.spec.ts',
      homeTabsSpec,
      'apps/extension/tests/specs/ledger/ledger.spec.ts',
      'apps/extension/tests/specs/token-details/token-details.spec.ts',
      'apps/extension/tests/specs/onboarding/onboarding.spec.ts',
      'apps/extension/tests/specs/switch-account/multiwallet-integrity.spec.ts',
    ],
    description:
      'The receive sheet (apps/extension/src/app/pages/receive/receive-dialog.tsx), rendered by the app Container (container.tsx) and opened from the home Receive action and the other showReceive callers without a URL change; the collectibles-only variant of the sheet has no caller. The Tokens tab lists the native segwit, taproot and Stacks addresses of the current account, plus the swappable SIP-10 assets from useAlexSwappableAssets, each with copy-to-clipboard; the BTC, Taproot and STX rows also have a QR button that swaps the sheet for the full address and QR code (SharedComponentsSelectors.AddressDisplayer), the SIP-10 rows do not; the Collectibles tab lists the Stacks address for NFTs. The row verify buttons render only for a Ledger wallet with keys for that chain and no policy; the BTC QR sheet\'s "Verify" footer button (ReceiveSheetVerifyAddressBtn) also renders for a Ledger Bitcoin multisig, the STX one does not. Page objects read addresses through this dialog because clipboard reads are unreliable in Playwright.',
  },
  {
    id: 'feature-introducer',
    anchor: {
      kind: 'selectors',
      objects: [
        'SharedComponentsSelectors.FeatureIntroducerTryItOutBtn',
        'SharedComponentsSelectors.FeatureIntroducerCloseBtn',
      ],
    },
    routes: [],
    startRoute: RouteUrls.Home,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Open home with a wallet whose persisted settings do not list "multi-wallet-support" under seenFeatureIntros; the seeded test wallet state has seenFeatureIntros: [], so the sheet shows on every seeded sign-in and OnboardingPage.dismissFeatureIntroducer clicks "Try it out" right after sign-in',
          'The sheet opens over home; "Try it out" and the close button both only mark the feature seen, which dismisses it',
        ],
      },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: SharedComponentsSelectors.FeatureIntroducerTryItOutBtn,
      others: [SharedComponentsSelectors.FeatureIntroducerCloseBtn],
    },
    actions: ['OnboardingPage.dismissFeatureIntroducer'],
    specs: [],
    description:
      'One-time announcement sheet (apps/extension/src/app/features/feature-introducer) rendered by home for the multi-wallet feature. Visibility comes from useFeatureIntroducer(featureId), backed by the seenFeatureIntros list in the persisted settings slice, so it shows until dismissed once. Both buttons call markAsSeen and nothing else (multi-wallet-introducer.tsx). Every seeded sign-in helper dismisses it through dismissFeatureIntroducer, which clicks "Try it out", so no spec asserts on it and verify captures home after the dismissal; the close button has no spec coverage.',
  },
  {
    id: 'update-available-callout',
    anchor: { kind: 'selectors', objects: ['UpdateAvailableSelectors'] },
    routes: [],
    startRoute: RouteUrls.Home,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'The background update monitor stores the pending version in chrome.storage.session under extensionUpdateStorageKeys.pendingVersion when Chrome reports an update; a spec sets that key directly',
          'Once the wallet is unlocked, every screen that is not a request window shows the callout at the top of the page, above the header (the app container renders it before the route outlet), provided the pending version is newer than the running one and has not been dismissed (update-available-callout.tsx, update-available.utils.ts): "Update now" applies the update (software wallets are locked by the reload), "Later (installs automatically)" dismisses it for that version',
          'After the update the next load shows a one-time "Leather is updated to <version>" toast from extensionUpdateStorageKeys.appliedVersion in chrome.storage.local',
        ],
      },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: UpdateAvailableSelectors.UpdateAvailableCallout,
      others: [
        UpdateAvailableSelectors.UpdateAvailableCalloutUpdateNow,
        UpdateAvailableSelectors.UpdateAvailableCalloutLater,
      ],
    },
    actions: [],
    specs: ['apps/extension/tests/specs/update-available/update-available.spec.ts'],
    description:
      'Banner (apps/extension/src/app/features/update-available/update-available-callout.tsx) mounted by the app container on every route, ungated ones included, and shown once the wallet is unlocked outside request windows when a newer extension version is pending and has not been dismissed for that version (dismissals persist in settings.dismissedMessages keyed by version). Software wallets see the lock warning; Ledger-only wallets do not. Not reachable through verify: it needs the session storage key the update monitor writes.',
  },
] as const satisfies readonly ExtensionFeatureEntry[];
