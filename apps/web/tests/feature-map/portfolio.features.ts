import { ConnectSelectors } from '@tests/selectors/connect.selectors';
import { RouteUrls } from '~/route-urls';

import type { WebFeatureEntry } from './web-feature-entry';

export const portfolioFeatures = [
  {
    id: 'portfolio',
    anchor: { kind: 'route' },
    routes: [RouteUrls.Portfolio],
    params: [],
    entry: [
      { kind: 'nav', steps: ['Click "Portfolio" in the left navigation'] },
      { kind: 'deepLink', steps: ['Open /portfolio'] },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'mock-connected', network: 'mainnet', mocks: ['successHandlers'] },
    selectors: { others: [] },
    actions: [],
    specs: [],
    description:
      'The portfolio page (pages/portfolio/portfolio.route.tsx, meta title "Portfolio – Leather"), client-only with PortfolioPageSkeleton as the SSR fallback. While the wallet status is not "connected" PortfolioPage renders the layout in dummyDataMode (dummyPortfolioAssets and dummyTotalBalance behind the blurred, inert ConnectOverlayBackdrop) with the WalletConnectionModal on top (portfolio-connect-card entry). Once connected it shows Page.Header "Portfolio" with the "Activity" ghost button (ActivityButton, rendered only when connected) that opens the "Activity" sheet listing the account activity, "Overview" with PortfolioSummary ("Total balance", "$–.––" until useTotalPortfolioBalance resolves) and the PortfolioChart, and "Tokens <count>" with the PortfolioTable of BTC, STX and SIP-10 balances sorted by quote value (useBtcAccountBalance, useStxAccountBalance, useSip10AccountBalance). In mock-connected mode the balances come from the Hiro and Leather API handlers in successHandlers for the mock STX address. No test ids on the connected layout and no spec.',
  },
  {
    id: 'portfolio-connect-card',
    anchor: { kind: 'selectors', objects: ['ConnectSelectors.ConnectCard'] },
    routes: [],
    startRoute: RouteUrls.Portfolio,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Open /portfolio without a connected wallet (uninstalled or mock-installed mode); the card is shown over the blurred dummy portfolio and cannot be dismissed',
          'Click "Connect" to run the wallet connect flow (in mock mode the mock wallet dialog opens) or "Install" to open the Chrome store',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'mock-installed', network: 'mainnet', mocks: ['successHandlers'] },
    selectors: {
      ready: ConnectSelectors.ConnectCard,
      others: [ConnectSelectors.MockWalletResolveButton],
    },
    actions: [],
    specs: [],
    description:
      'WalletConnectionModal (pages/portfolio/components/wallet-connection-modal.tsx) renders a ConnectOverlay with the shared ConnectCard (components/connect-card/connect-card.tsx, test id connect-card on the card itself) titled "Get started with Leather" / "Connect Leather to access your portfolio" with two ConnectActionRows: "Connect" ("Connect Leather to reveal your portfolio") whose button calls useLeatherConnect().connect(), and "Install" ("Add Leather extension to your browser") whose button opens LEATHER_EXTENSION_CHROME_STORE_URL. It has no close control: it disappears when the status becomes "connected". The same ConnectCard component is the multisig onboarding card, so the connect-card test id also matches on /multisig/onboarding. No spec.',
  },
] as const satisfies readonly WebFeatureEntry[];
