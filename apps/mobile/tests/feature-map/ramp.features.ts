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
          'On the Home tab tap "Buy" (needs release_onramper_buy) or "Sell" (needs release_onramper_sell) in the action buttons (no test ids); both open the sheet without an asset',
        ],
      },
      {
        kind: 'nav',
        steps: [
          'On token-details tap "Buy" (release_onramper_buy) or "Sell" (release_onramper_sell); the sheet opens for that asset',
        ],
      },
      {
        kind: 'nav',
        steps: [
          'On the Home tab, on the Bitcoin or Stacks row of an account with no activity for that asset, tap "Buy" (deposit-token-cell.tsx); this button is not behind a flag',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: RampSelectors.WebView,
      others: [],
    },
    actions: [],
    specs: [],
    description:
      'The global buy and sell sheet (features/ramp/ramp-sheet.tsx), mounted in the root layout whenever settings hold a currentAccount and presented through rampSheetRef.current?.present(mode, asset?) with mode "buy" or "sell". It is a full-height sheet with no header that renders ramp.tsx only once a mode is set and clears both on dismiss. ramp.tsx is a WebView (RampSelectors.WebView) loading the Onramper widget host with the params from getOnramperIframeParams (@leather.io/features): the theme derived from the theme preference, the mode, the portfolio URL as both success and failure redirect, USD defaults (25 to buy, 0.0005 BTC to sell) and a signature of the wallets string with the signing secret. The wallet params carry the native segwit payer address when there is no asset or the asset is on Bitcoin and the Stacks signer address when there is no asset or the asset is on Stacks, so they cover BTC and STX from Home, only BTC from Bitcoin, and only STX from Stacks or a SIP-10 token. getOnramperEnv (shared/environment.ts) asserts EXPO_PUBLIC_ONRAMPER_API_KEY, EXPO_PUBLIC_ONRAMPER_SIGNING_SECRET and EXPO_PUBLIC_ONRAMPER_WIDGET_HOST, so a build without them throws when the sheet renders. On Home and token-details "Buy" renders only with release_onramper_buy (useOnramperBuyFlag) and "Sell" only with release_onramper_sell (useOnramperSellFlag), while the deposit-token-cell "Buy" ignores both flags. Everything inside is the third-party Onramper widget with no Leather test ids; a reproduction needs network access to the widget host and the EXPO_PUBLIC_ONRAMPER_* variables, and nothing is mocked.',
  },
] as const satisfies readonly MobileFeatureEntry[];
