import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import { RouteUrls } from '@shared/route-urls';

import type { ExtensionFeatureEntry } from './extension-feature-entry';

const defaultMocks = ['setupMockApis', 'mockUnhandledRequests'] as const;

export const fundFeatures = [
  {
    id: 'fund',
    anchor: { kind: 'route' },
    routes: [RouteUrls.Fund],
    params: [{ name: 'chain', example: 'bitcoin' }],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On home click "Buy" (HomePageSelectors.FundAccountBtn), shown only with a BTC or STX account, on mainnet and with no policy; in a full-page tab it navigates to the route, in the popup it opens the route in a full-page tab and closes the popup. Below the md breakpoint, whenever both Buy and Sell are shown, home shows a "Buy & Sell" button with no test id instead, whose sheet has Buy and Sell rows without test ids (fund-buttons.tsx, fund-sheet.tsx)',
        ],
      },
      {
        kind: 'nav',
        steps: [
          'When the BTC or STX row has no recorded activity (on mainnet, without a policy) click its "Buy" button (CoreAssetSelectors.BtcAssetBuyButton, CoreAssetSelectors.StxAssetBuyButton); it opens /fund/bitcoin or /fund/stacks, from the popup it opens a full-page tab and closes the popup (asset-list/utils.ts)',
        ],
      },
      {
        kind: 'nav',
        steps: [
          'Token details "Buy" (TokenDetailsSelectors.TokenDetailsBuyButton); from the popup it opens the route in a full-page tab',
        ],
      },
      { kind: 'deepLink', steps: ['Open #/fund, #/fund/bitcoin or #/fund/stacks'] },
    ],
    gate: 'account',
    flags: [],
    preconditions: {
      session: 'signed-in',
      network: 'mainnet',
      mocks: [...defaultMocks],
    },
    selectors: {
      ready: SharedComponentsSelectors.HeaderBackBtn,
      others: [],
    },
    actions: ['HomePage.goToFundChooseCurrencyPage'],
    specs: ['apps/extension/tests/specs/fund/fund.spec.ts'],
    description:
      'Embeds the Onramper buy widget in an iframe titled "Onramper Widget". FundPage reads the chain param and passes the native segwit BTC address when it is absent or "bitcoin" and the STX address when it is absent or "stacks" (fund.tsx). The asset-row Buy substitutes the param with the asset chain; the home "Buy" button and the token-details "Buy" button open "/fund" with no param, so the widget gets both addresses (fund-buttons.tsx, token-details-actions.tsx). The route is always mounted. Before the iframe renders, OnramperWidget posts the unsigned parameters to the Leather API signing route /v1/onramp/widget-signature (mocked by mockLeatherApiRequests) and shows a LoadingSpinner while it waits; a failed request shows an error Callout "Couldn\'t load checkout" with a "Try again" button that requests a fresh signature (onramper-widget.tsx). The iframe src carries the Signature V2 fields sigV2, sigV2Timestamp, sigV2Nonce, sigV2Fields and endUserIpHash and no signature. The widget content is third party, so a repro can only assert the URL, the iframe src and the header: the ready selector, SharedComponentsSelectors.HeaderBackBtn, renders on every PageHeader screen, so pair it with the /fund URL as fund.spec.ts does; the iframe has no test id. The header back button navigates home (onBackLocation). HomePage.goToFundChooseCurrencyPage only clicks the home Buy button and waits for nothing; fund.spec.ts clicks the asset-row Buy buttons directly. Its empty-wallet tests register mockEmptyStacksPrincipalBalancesRequest and mockMainnetTestAccountEmptyUtxosRequests so the BTC and STX rows have no activity and show their Buy buttons.',
  },
  {
    id: 'sell',
    anchor: { kind: 'route' },
    routes: [RouteUrls.Sell],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On home click "Sell" (HomePageSelectors.SellBtn), shown only on mainnet without a policy; in the popup it opens the route in a full-page tab and closes the popup. It is a standalone button at the md breakpoint and above or whenever Buy is hidden; below md with Buy also shown it is the Sell row (no test id) of the "Buy & Sell" sheet (fund-buttons.tsx)',
        ],
      },
      { kind: 'deepLink', steps: ['Open #/sell'] },
    ],
    gate: 'account',
    flags: [],
    preconditions: {
      session: 'signed-in',
      network: 'mainnet',
      mocks: [...defaultMocks],
    },
    selectors: {
      ready: SharedComponentsSelectors.HeaderBackBtn,
      others: [],
    },
    actions: [],
    specs: ['apps/extension/tests/specs/fund/fund.spec.ts'],
    description:
      'Embeds the Onramper widget in sell mode with both the BTC and STX addresses prefilled. Like fund, it shows a LoadingSpinner while the Leather API signs the parameters and an error Callout "Couldn\'t load checkout" with a "Try again" button when signing fails (onramper-widget.tsx). The route is always mounted. The ready selector, SharedComponentsSelectors.HeaderBackBtn, renders on every PageHeader screen, so pair it with the /sell URL; the iframe has no test id.',
  },
] as const satisfies readonly ExtensionFeatureEntry[];
