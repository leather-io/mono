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
    preconditions: { session: 'signed-in', mocks: [] },
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
      'The Home tab with a current account (app/(tabs)/(index)/index.tsx renders home-with-account-screen.tsx when settings hold a currentAccount, else the home-no-wallet variant). The header shows the account avatar and name, plus the wallet name with more than one wallet (AccountSelectors.AccountHeader; disabled with a single account, otherwise it opens the account-selector-sheet), the privacy eye (HomeSelectors.PrivacyButton, "Hide balances" or "Show balances") and the "Settings" gear (HomeSelectors.SettingsButton, navigates to /settings). Below, "Total balance" with the NetworkBadge (HomeSelectors.NetworkBadge, only off mainnet, opens /settings/networks), "Locked STX" only while the account is stacking, and the action buttons (account-actions.tsx): "Send" opens the send-select-asset sheet, "Receive" the receive-select-asset sheet, "Buy" and "Sell" the ramp-sheet only with release_onramper_buy / release_onramper_sell on, and "Swap" the swap-form only with swap on; the question-mark labels open the description-sheet. The "Tokens" and "Collectibles" tabs carry no test ids. On Tokens, an account whose activity loaded empty shows the "Get your first token" banner and the "Learn" section instead of the "Available" balance and its slider button (HomeSelectors.ManageTokensButton, opens the manage-tokens-sheet). Every token row has the dynamic id HomeSelectors.TokenBalanceItem + "-" + ticker (tokenBalanceItem-BTC, tokenBalanceItem-STX, tokenBalanceItem-<SIP-10 symbol>) and opens token-details; the BTC and STX rows show a "Buy" button opening the ramp-sheet instead of a balance while the asset has no activity (deposit-token-cell.tsx). The SIP-10 rows are sorted by sortSip10Balances, and on mainnet a zero USDCx balance gets a "Bridge" row that opens the Stacks bridge URL (assets-list.tsx). "Trending tokens" renders only when the trending query returns rows. The Collectibles tab shows SIP-9 tiles, which open token-details only with collectible_details on. The tab bar has "Home", "Activity" and "Browser" (HomeSelectors.HomeTab, ActivityTab, BrowserTab); tapping the focused Home tab on a nested route dismisses to /, otherwise it scrolls to top (tab-button.tsx). Balances, activity, collectibles and trending tokens are fetched live. smoke-tests.yaml asserts "All accounts" before tapping the gear, a string nothing has rendered since the single-account home, so it fails at its first assertion; the unit specs cover the SIP-10 ordering and the USDCx bridge row.',
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
      'Home without a current account (home-without-account-screen.tsx, the CurrentAccountLoader fallback of the Home tab): the header shows the Leather logomark, the NetworkBadge (HomeSelectors.NetworkBadge, only off mainnet, opens /settings/networks) and the "Settings" gear (HomeSelectors.SettingsButton, navigates to /settings); the privacy button renders only when wallets exist. The body is one card titled "Add account" (create-wallet-card.tsx, HomeSelectors.CreateWalletCard) that presents the add-wallet-sheet. smoke-tests-ci.yaml waits up to 30 s for "Add account", taps the gear and asserts "SETTINGS"; smoke-tests.yaml first asserts "All accounts", which nothing renders.',
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
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: ActivitySelectors.ActivityScreen,
      others: [ActivitySelectors.ActivityItem, ActivitySelectors.EmptyState],
    },
    actions: [],
    specs: [],
    description:
      'The Activity tab (app/(tabs)/activity.tsx); both variants carry ActivitySelectors.ActivityScreen. With a current account it renders the "Activity" title and activity-list.tsx fed by useActivity (activity.query.ts, the shared activity query mapped with the network and fiat currency preferences): skeleton rows while loading, one row per activity (ActivitySelectors.ActivityItem; a row with a link opens it in the browser, swaps read "Swapping", "Swap failed" or "Swapped"), pull to refresh, and the empty state "Make your first transaction to get started" (ActivitySelectors.EmptyState) when the list is empty or the query errored. Without an account only the title and the empty state render. ActivityItem needs an account with transactions and EmptyState renders only without; the data is fetched live for the current account addresses.',
  },
  {
    id: 'token-details',
    anchor: { kind: 'route' },
    routes: [AppRoutes.TokenDetails],
    params: [{ name: 'assetId', example: 'nativeBtc|BTC' }],
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
    preconditions: { session: 'signed-in', mocks: [] },
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
      'Detail screen for one asset (app/(tabs)/(index)/[assetId]/index.tsx), chosen by the assetId param "<protocol>|<id>" (deserializeAssetId throws on an unknown protocol, and the screen throws without a current account). nativeBtc, nativeStx and sip10 render token.tsx (TokenSelectors.TokenDetailsScreen): the token title with the NetworkBadge (off mainnet only), the icon, available and fiat balances, the action buttons ("Send" opens send-form for the asset, "Receive" receive-select-asset for Bitcoin and receive-asset-details for Stacks and SIP-10, "Buy" / "Sell" the ramp-sheet behind release_onramper_buy / release_onramper_sell, "Swap" the swap-form for swappable assets behind swap), "Description" with "Read more" / "Read less", a "Token Details" table ("Name", "Price", "24 Hour Change", "Layer") and the asset activity under "Activity" (ActivitySelectors.ActivityItem rows). Bitcoin (bitcoin-token-details.tsx) shows Swap only with swap_sbtc_bridging on and adds a "Balances" card with "Native Segwit" and "Taproot" rows (TokenSelectors.AddressListItem): the row opens receive-asset-details for that address type and the underlined address copies it. Stacks has no address list. SIP-10 shows the skeleton until the balance loads and the error fallback when it errors or the asset is missing. SIP-9 renders collectible.tsx instead (TokenSelectors.CollectibleDetailsScreen, never TokenDetailsScreen) with the BNS details for a BNS-V2 name or "Collectible Info", stats, description and "Attributes"; from Home it is only reachable with collectible_details on. Back (SharedSelectors.BackButton) goes to the previous screen, or to / without history (a cold deep link); tapping the Home tab dismisses to /. Balances, prices and activity are fetched live.',
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
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: AccountSelectors.SelectorSheetHeader,
      others: [AccountSelectors.SelectorSheetAccountCard],
    },
    actions: [],
    specs: [],
    description:
      'The account selector (account-selector-sheet.tsx), a full-height sheet mounted by the Home screen with an account; the header that opens it is disabled with a single account. The top (AccountSelectors.SelectorSheetHeader) is the portfolio header: "Portfolio" (opens the description-sheet "Your total tokens across all your accounts.") and the total balance. Below it one card per account that is not hidden (AccountSelectors.SelectorSheetAccountCard on every card, so Maestro picks one by index) with the wallet name, account name, balance, address and the icons of connected apps, the current account outlined. Tapping a card closes the sheet and changes the current account. Each avatar carries SharedSelectors.DefaultAccountIcon + "_" + icon (defaultAccountIcon_<icon>).',
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
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: TokenSelectors.ManageTokensSheetTitle,
      others: [HomeSelectors.TokenSwitchItem],
    },
    actions: [],
    specs: [sortSip10BalancesSpec, searchSip10BalancesSpec],
    description:
      'The "Manage tokens" sheet (manage-tokens.sheet.tsx), a full-height sheet mounted by the Home screen and presented from the "Available" balance row. A spinner shows while the SIP-10 balances (hidden assets included) or the visibility settings load; then the title (TokenSelectors.ManageTokensSheetTitle), a "Search tokens" input filtering by name or symbol, "Failed to load tokens" on error or "No tokens found" when nothing matches, and one switch row per SIP-10 token plus USDCx with the dynamic id HomeSelectors.TokenSwitchItem + "-" + symbol (tokenSwitchItem-<ticker>). Tapping a row flips the switch optimistically and changes the asset visibility on Home. The token list is fetched live. The unit specs cover the sort order and the search match.',
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
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: AccountSelectors.AddAccountSheetExistingWalletButton,
      others: [AccountSelectors.AddAccountSheetNewWalletButton],
    },
    actions: [],
    specs: [],
    description:
      'The "Add account" sheet (add-account-sheet.tsx), mounted globally on addAccountSheetRef (global-sheet-provider.tsx). It offers "Add to existing wallet" / "Choose existing wallet" (AccountSelectors.AddAccountSheetExistingWalletButton: navigates to /settings/wallet and closes) and "Add to new wallet" / "Generate new Secret Key for self-custody" (AccountSelectors.AddAccountSheetNewWalletButton: presents the add-wallet-sheet and closes). Nothing calls addAccountSheetRef.current?.present(), so no tap path opens it today; the "Add account" text the smoke flows wait for is the home-no-wallet card, not this sheet.',
  },
] as const satisfies readonly MobileFeatureEntry[];
