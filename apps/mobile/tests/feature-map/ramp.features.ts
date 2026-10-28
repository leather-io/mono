import { AppRoutes } from '@/shared/app-routes';
import { RampSelectors } from '@/shared/selectors/ramp.selectors';

import type { MobileFeatureEntry } from './mobile-feature-entry';

export const rampFeatures = [
  {
    id: 'ramp-sheet',
    anchor: { kind: 'selectors', objects: ['RampSelectors.WebView'] },
    routes: [],
    startRoute: AppRoutes.Home,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On the Home tab tap "Buy" (needs release_onramper_buy) or "Sell" (needs release_onramper_sell) in the action buttons (features/account/components/account-actions.tsx via components/action-buttons.tsx; no test ids); both open the sheet without an asset',
        ],
      },
      {
        kind: 'nav',
        steps: [
          'On token-details tap "Buy" (release_onramper_buy) or "Sell" (release_onramper_sell) (features/token/token.tsx); the sheet opens for that asset',
        ],
      },
      {
        kind: 'nav',
        steps: [
          'On the Home tab, on the Bitcoin or Stacks row of an account with no activity for that asset, tap "Buy" (features/token/components/deposit-token-cell.tsx); this button is not behind a flag',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: ['release_onramper_buy', 'release_onramper_sell'],
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: RampSelectors.WebView,
      others: [],
    },
    actions: [],
    specs: [],
    description:
      'The global buy/sell sheet, mounted in app/_layout.tsx whenever settings hold a currentAccount and presented through useGlobalSheets().rampSheetRef.current?.present(mode, asset?) with mode "buy" or "sell" (core/global-sheet-provider.tsx). features/ramp/ramp-sheet.tsx is a FullHeightSheet with no header that keeps mode and asset in state, renders features/ramp/ramp.tsx only once a mode is set, and clears both on dismiss. ramp.tsx is a react-native-webview WebView (RampSelectors.WebView, background ink.background-primary, offset by the top safe area plus 44) loading `${widgetHost}?${params}`: getOnramperEnv (shared/environment.ts) asserts and reads EXPO_PUBLIC_ONRAMPER_API_KEY, EXPO_PUBLIC_ONRAMPER_SIGNING_SECRET and EXPO_PUBLIC_ONRAMPER_WIDGET_HOST, so a build without them throws when the sheet renders; getOnramperIframeParams (@leather.io/features, onramper/onramper-params.ts) receives the theme from themeDerivedFromThemePreference (darkMode, themeName and Leather colour tokens), the mode, the native segwit payer address of the current account when there is no asset or the asset chain is bitcoin, the Stacks signer address when there is no asset or the chain is stacks (so the wallets, onlyCryptos and onlyCryptoNetworks params cover BTC and STX from Home, only BTC from Bitcoin, and only stx_stacks from Stacks or a SIP-10 token), LEATHER_PORTFOLIO_URL as both success and failure redirect, redirectAtCheckout true, USD defaults (25 to buy, 0.0005 BTC to sell), hideTopBar and a signature of the wallets string with the signing secret. On Home and token details "Buy" renders only with release_onramper_buy (useOnramperBuyFlag) and "Sell" only with release_onramper_sell (useOnramperSellFlag) in components/action-buttons.tsx, while the deposit-token-cell "Buy" ignores both flags. Everything inside is the third-party Onramper widget (no Leather test ids); a reproduction needs network access to the Onramper widget host and the EXPO_PUBLIC_ONRAMPER_* variables, and nothing is mocked. No flow or spec covers it.',
  },
] as const satisfies readonly MobileFeatureEntry[];
