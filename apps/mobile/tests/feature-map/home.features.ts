import { AppRoutes } from '@/shared/app-routes';
import { AccountSelectors } from '@/shared/selectors/account.selectors';
import { ActivitySelectors } from '@/shared/selectors/activity.selectors';
import { HomeSelectors } from '@/shared/selectors/home.selectors';
import { SharedSelectors } from '@/shared/selectors/shared.selectors';
import { TokenSelectors } from '@/shared/selectors/token.selectors';

import type { MobileFeatureEntry } from './mobile-feature-entry';

const smokeTestsFlow = 'apps/mobile/maestro/flows/smoke-tests.yaml';
const smokeTestsCiFlow = 'apps/mobile/maestro/flows/smoke-tests-ci.yaml';
const sortSip10BalancesSpec =
  'apps/mobile/src/features/balances/assets/utils/sort-sip10-balances.spec.ts';
const withUsdcxBridgeSpec =
  'apps/mobile/src/features/balances/assets/utils/with-usdcx-bridge.spec.ts';
const searchSip10BalancesSpec =
  'apps/mobile/src/features/balances/assets/utils/search-sip10-balances.spec.ts';

export const homeFeatures = [
  {
    id: 'home',
    anchor: { kind: 'route' },
    routes: [AppRoutes.Home],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Launch the app with a wallet; Home is the first tab (HomeSelectors.HomeTab). From any nested Home screen tap the Home tab again to dismiss back to /',
        ],
      },
      { kind: 'deepLink', steps: ['Open leather://'] },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: AccountSelectors.AccountHeader,
      others: [
        HomeSelectors.SettingsButton,
        HomeSelectors.PrivacyButton,
        HomeSelectors.ManageTokensButton,
        HomeSelectors.TokenBalanceItem,
        HomeSelectors.NetworkBadge,
        HomeSelectors.HomeTab,
        HomeSelectors.ActivityTab,
        HomeSelectors.BrowserTab,
      ],
    },
    actions: [],
    specs: [smokeTestsFlow, sortSip10BalancesSpec, withUsdcxBridgeSpec],
    description:
      'The Home tab with a current account: app/(tabs)/(index)/index.tsx renders CurrentAccountLoader, which shows components/home/home-with-account-screen.tsx when settings hold a currentAccount and the home-no-wallet variant otherwise. The header (components/home/account-screen-header.tsx) shows the account header on the left (features/account/components/account-header.tsx: avatar, account name and, with more than one wallet, the wallet name; AccountSelectors.AccountHeader, disabled when there is only one account, otherwise it opens account-selector-sheet) and HeaderActions on the right (components/screen/screen-header/components/header-actions.tsx): the privacy eye (HomeSelectors.PrivacyButton, label "Hide balances" or "Show balances", toggles the privacy mode preference) and the "Settings" gear (HomeSelectors.SettingsButton, navigates to /settings, the settings entry). Below, features/account/account-details.tsx shows "Total balance" with the NetworkBadge (HomeSelectors.NetworkBadge, only off mainnet, opens /settings/networks), "Locked STX" only while the account is stacking, and the action buttons (features/account/components/account-actions.tsx through components/action-buttons.tsx): "Send" opens the global send sheet (send-select-asset), "Receive" the receive sheet with all assets (receive-select-asset), "Buy" and "Sell" the ramp sheet (ramp-sheet) only with release_onramper_buy / release_onramper_sell on, and "Swap" the swap sheet (swap-form) only with swap on. The question-mark labels open the global description sheet. components/home/components/asset-tabs.tsx switches between "Tokens" and "Collectibles" (no test ids). On Tokens, when the activity query succeeds with no activity the "Get your first token" banner and the "Learn" section (CMS items or the defaults "Getting Started with Leather", "What is sBTC?", "Learn more about stacking", each opening its URL) show; otherwise "Available" balance shows with the slider button (HomeSelectors.ManageTokensButton) that opens manage-tokens-sheet. The Bitcoin and Stacks rows (features/balances/bitcoin|stacks/*-deposit-token-cell.tsx via features/token/components/deposit-token-cell.tsx) show a "Buy" button opening ramp-sheet when the asset has no activity and the balance otherwise; every token row is a TokenCell with the dynamic id HomeSelectors.TokenBalanceItem + "-" + ticker (tokenBalanceItem-BTC, tokenBalanceItem-STX, tokenBalanceItem-<sip10 symbol>), and tapping one navigates to token-details. features/balances/assets/assets-list.tsx lists the SIP-10 balances sorted by sortSip10Balances, and on mainnet inserts a USDCx row with a "Bridge" button (opens the Stacks bridge URL) when the USDCx balance is zero and USDCx is visible. "Trending tokens" (components/home/components/trending-tokens.tsx) renders only when the trending query returns rows. The Collectibles tab (features/token/collectibles-list.tsx) shows SIP-9 tiles, a loading grid, an error fallback or the empty content; tiles open token-details only with collectible_details on. The tab bar (features/navigation/tab-layout.tsx, tab-button.tsx) has "Home", "Activity" and "Browser" (HomeSelectors.HomeTab/ActivityTab/BrowserTab); tapping the focused Home tab on a nested route calls router.dismissTo("/(tabs)/(index)"), otherwise it scrolls to top. Balances, activity, collectibles and trending tokens are fetched live. smoke-tests.yaml asserts "All accounts" before tapping homeSettingsButton and asserting "SETTINGS", but "All accounts" is rendered nowhere in apps/mobile/src since the single-account home, so that flow fails at its first assertion. The unit specs cover the token-list ordering and the USDCx bridge row. legacy-flows/accounts-page.yaml asserted tokenBalanceItem-BTC and tokenBalanceItem-STX on the old account page.',
  },
  {
    id: 'home-no-wallet',
    anchor: { kind: 'selectors', objects: ['HomeSelectors.CreateWalletCard'] },
    routes: [],
    startRoute: AppRoutes.Home,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: ['Launch the app with no wallet (fresh install or after removing every wallet)'],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: {
      ready: HomeSelectors.CreateWalletCard,
      others: [HomeSelectors.SettingsButton, HomeSelectors.NetworkBadge],
    },
    actions: [],
    specs: [smokeTestsCiFlow, smokeTestsFlow],
    description:
      'Home without a current account (components/home/home-without-account-screen.tsx, the CurrentAccountLoader fallback in app/(tabs)/(index)/index.tsx): the header shows the Leather logomark with the NetworkBadge (features/settings/network-badge.tsx, HomeSelectors.NetworkBadge, rendered only when the network preference is not mainnet; tapping it opens /settings/networks) and HeaderActions with only the "Settings" gear (HomeSelectors.SettingsButton, navigates to /settings, the settings entry); the privacy button renders only when wallets exist. The body is one card (features/account/components/create-wallet-card.tsx, HomeSelectors.CreateWalletCard) titled "Add account" that presents the global add-wallet sheet (add-wallet-sheet). smoke-tests-ci.yaml waits up to 30 s for "Add account", taps homeSettingsButton and asserts "SETTINGS"; smoke-tests.yaml taps the same gear but first asserts "All accounts", which no source renders.',
  },
  {
    id: 'activity',
    anchor: { kind: 'route' },
    routes: [AppRoutes.Activity],
    params: [],
    entry: [
      { kind: 'nav', steps: ['Tap the "Activity" tab (HomeSelectors.ActivityTab)'] },
      { kind: 'deepLink', steps: ['Open leather://activity'] },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: ActivitySelectors.ActivityScreen,
      others: [ActivitySelectors.ActivityItem, ActivitySelectors.EmptyState],
    },
    actions: [],
    specs: [],
    description:
      'The Activity tab (app/(tabs)/activity.tsx) wraps two variants in CurrentAccountLoader, both carrying ActivitySelectors.ActivityScreen. With a current account, components/activity/activity-with-account.screen.tsx calls useActivity (queries/activity/activity.query.ts, createActivityQueryConfig from @leather.io/queries mapped through createActivityView with the network and fiat currency preferences) and renders features/activity/activity-list.tsx under the "Activity" title: skeleton rows while loading, the activity rows (features/activity/activity-item.tsx, ActivitySelectors.ActivityItem; a row with an activity link opens it in the browser, swaps show "Swapping", "Swap failed" or "Swapped"), pull to refresh, and the empty state (features/activity/activity-empty.tsx, ActivitySelectors.EmptyState, "Make your first transaction to get started") when the list is empty or the query errored. Without an account, components/activity/activity-without-account-screen.tsx shows only the "Activity" title and the empty state. ActivityItem renders only for an account with transactions and EmptyState only without; the data is fetched live for the current account addresses. No flow or spec covers it.',
  },
  {
    id: 'token-details',
    anchor: { kind: 'route' },
    routes: [AppRoutes.TokenDetails],
    params: [{ name: 'assetId', example: 'nativeBtc|BTC' }],
    deepLinkable: true,
    entry: [
      {
        kind: 'nav',
        steps: [
          'On the Home tab tap a token row (HomeSelectors.TokenBalanceItem + "-" + ticker, e.g. tokenBalanceItem-BTC)',
          'For a collectible, with collectible_details on, switch to "Collectibles" and tap a tile',
        ],
      },
      {
        kind: 'deepLink',
        steps: [
          'Open leather://nativeBtc%7CBTC (nativeStx|STX for Stacks, sip10|<contract>::<token> for a SIP-10, sip9|<contract>::<asset>|<tokenId> for a SIP-9) with a current account',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: TokenSelectors.TokenDetailsScreen,
      others: [
        TokenSelectors.AddressListItem,
        TokenSelectors.CollectibleDetailsScreen,
        ActivitySelectors.ActivityItem,
        HomeSelectors.NetworkBadge,
        SharedSelectors.BackButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'Token details (app/(tabs)/(index)/[assetId]/index.tsx) deserializes assetId (deserializeAssetId in packages/utils: "<protocol>|<id>", throwing on an unknown protocol), calls assertExistence(currentAccount) (so a deep link without a current account throws), tracks token_details_viewed or collectible_details_viewed (hooks/use-token-tracking.ts) and switches on the protocol. nativeBtc, nativeStx and sip10 render features/token/token.tsx (TokenSelectors.TokenDetailsScreen): a header with the token title and the NetworkBadge (off mainnet only), the icon, available and fiat balances, ActionButtons ("Send" opens send-form for the asset, "Receive" receive-select-asset for Bitcoin and receive-asset-details for Stacks and SIP-10, "Buy"/"Sell" ramp-sheet behind release_onramper_buy / release_onramper_sell, "Swap" swap-form for swappable assets behind swap), "Description" with "Read more"/"Read less" when the token has one, a "Token Details" table ("Name", "Price", "24 Hour Change", "Layer") and the asset activity list (ActivitySelectors.ActivityItem rows under "Activity"). Bitcoin (features/token/bitcoin/bitcoin-token-details.tsx) shows Swap only with swap_sbtc_bridging on and adds a "Balances" card with "Native Segwit" and "Taproot" rows (TokenSelectors.AddressListItem, features/token/components/address-list.tsx): the row opens receive-asset-details for that address type and the underlined address copies it. Stacks (features/token/stacks/stacks-token-details.tsx) has no address list. SIP-10 (sip10-token-details.tsx) shows the token loading skeleton until the balance loads and the error fallback when the balance errors or the asset is missing. SIP-9 (sip9-details.tsx) renders features/token/collectible.tsx (TokenSelectors.CollectibleDetailsScreen instead of TokenDetailsScreen) with BnsDetails for BNS-V2 names or Sip9TokenDetails ("Collectible Info", optional stats, description and "Attributes"), the collectible skeleton while loading and the error fallback otherwise; from Home it is only reachable with collectible_details on (features/token/collectibles-list.tsx). The header back button (SharedSelectors.BackButton) calls router.back(), or navigates to / when there is no history (a cold deep link); tapping the Home tab dismisses to /. Balances, prices and activity are fetched live. No flow or spec covers it.',
  },
  {
    id: 'account-selector-sheet',
    anchor: {
      kind: 'selectors',
      objects: [
        'AccountSelectors.SelectorSheetHeader',
        'AccountSelectors.SelectorSheetAccountCard',
      ],
    },
    routes: [],
    startRoute: AppRoutes.Home,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On the Home tab tap the account name and avatar in the header (AccountSelectors.AccountHeader); it is disabled with a single account',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: AccountSelectors.SelectorSheetHeader,
      others: [AccountSelectors.SelectorSheetAccountCard],
    },
    actions: [],
    specs: [],
    description:
      'The account selector (features/account/account-selector/account-selector-sheet.tsx and .layout.tsx), a full-height sheet mounted by the Home screen with an account. It needs at least two accounts: AccountHeader sets disabled when the account list has one entry. The top (AccountSelectors.SelectorSheetHeader) is the PortfolioHeader: "Portfolio" (opens the description sheet "Your total tokens across all your accounts.") and the total balance. Below it one AccountCard per account that is not hidden (AccountSelectors.SelectorSheetAccountCard on every card; Maestro picks one by index), each showing the wallet name, account name, balance, address and the icons of connected apps, with the current account outlined. Tapping a card closes the sheet and changes the current account. The layout passes iconTestID={defaultIconTestId(icon)} (SharedSelectors.DefaultAccountIcon + "_" + icon), which AccountCard applies to the avatar, so each card carries a defaultAccountIcon_<icon> id. No flow or spec covers it; legacy-flows/accounts-drawer.yaml opened the old accounts drawer by tapping "My accounts".',
  },
  {
    id: 'manage-tokens-sheet',
    anchor: {
      kind: 'selectors',
      objects: ['TokenSelectors.ManageTokensSheetTitle', 'HomeSelectors.TokenSwitchItem'],
    },
    routes: [],
    startRoute: AppRoutes.Home,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On the Home tab, with an account that has activity (else the first-token banner replaces the row), tap the slider icon next to "Available" (HomeSelectors.ManageTokensButton)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: TokenSelectors.ManageTokensSheetTitle,
      others: [HomeSelectors.TokenSwitchItem],
    },
    actions: [],
    specs: [sortSip10BalancesSpec, searchSip10BalancesSpec],
    description:
      'The manage-tokens sheet (features/balances/manage-tokens.sheet.tsx), a full-height sheet mounted by the Home screen and presented from AvailableAccountBalance (features/account/components/available-account-balance.tsx). A spinner shows while the SIP-10 balances (including hidden assets) or the visibility settings load; then "Manage tokens" (TokenSelectors.ManageTokensSheetTitle), a "Search tokens" input filtering by name or symbol, "Failed to load tokens" on error or "No tokens found" when nothing matches, and one switch row per SIP-10 token plus USDCx (features/token/components/token-switch.tsx), id HomeSelectors.TokenSwitchItem + "-" + symbol (tokenSwitchItem-<ticker>). Tapping a row flips the switch optimistically and calls changeAssetVisibility, which shows or hides the token in the Home list. The token list is fetched live. The unit specs cover the sort order and the search match; no flow covers the sheet.',
  },
  {
    id: 'add-account-sheet',
    anchor: {
      kind: 'selectors',
      objects: ['AccountSelectors.AddAccountSheetExistingWalletButton'],
    },
    routes: [],
    startRoute: AppRoutes.Home,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'No control presents it: addAccountSheetRef.current?.present() has no caller in apps/mobile/src, so the sheet is unreachable from the UI',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: AccountSelectors.AddAccountSheetExistingWalletButton,
      others: [AccountSelectors.AddAccountSheetNewWalletButton],
    },
    actions: [],
    specs: [],
    description:
      'The "Add account" sheet (features/account/sheets/add-account-sheet.tsx), mounted globally in app/_layout.tsx on addAccountSheetRef from core/global-sheet-provider.tsx. It offers "Add to existing wallet" / "Choose existing wallet" (AccountSelectors.AddAccountSheetExistingWalletButton: navigates to /settings/wallet and closes) and "Add to new wallet" / "Generate new Secret Key for self-custody" (AccountSelectors.AddAccountSheetNewWalletButton: presents add-wallet-sheet and closes). Nothing in apps/mobile/src calls addAccountSheetRef.current?.present(), so no tap path opens it today; the "Add account" text the smoke flows wait for is the home-no-wallet card, not this sheet. No flow or spec covers it.',
  },
] as const satisfies readonly MobileFeatureEntry[];
