import { ConnectSelectors } from '@tests/selectors/connect.selectors';
import { RouteUrls } from '~/route-urls';

import type { WebFeatureEntry } from './web-feature-entry';

const modeFixtureSpec = 'apps/web/tests/mode-fixture.spec.ts';
const bitcoinStakingSpec = 'apps/web/tests/bitcoin-staking.spec.ts';

export const homeFeatures = [
  {
    id: 'index-redirect',
    anchor: { kind: 'route' },
    routes: [RouteUrls.Index],
    params: [],
    entry: [
      {
        kind: 'deepLink',
        steps: [
          'Open / (the mode fixture does page.goto("/") and waits for the wallet button in the /staking header)',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'uninstalled', network: 'mainnet', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [modeFixtureSpec, bitcoinStakingSpec],
    description:
      'The root index route (pages/index.route.tsx) renders nothing: its meta() emits <meta http-equiv="refresh" content="0;url=/staking"> and its component calls navigate("/staking", { replace: true }) in an effect, so every visit to / lands on the staking overview. app.tsx also navigates any client-side route change whose pathname is "/" to /staking with replace. On the testnet network the NetworkGate in root.tsx replaces the App tree, so only the meta refresh runs and /staking then shows the "Not available on testnet" gate. Every spec built on the mode fixture passes through this redirect because the fixture asserts the header wallet button on the page it lands on.',
  },
  {
    id: 'not-found',
    anchor: { kind: 'route' },
    routes: [RouteUrls.NotFound],
    params: [{ name: '*', example: 'nowhere' }],
    entry: [
      { kind: 'deepLink', steps: ['Open any path no other route matches, for example /nowhere'] },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'uninstalled', network: 'mainnet', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [],
    description:
      'The catch-all route (pages/error/error-not-found.route.tsx, meta title "404 · Page Not Found – Leather") renders NotFound: a centred "Oops! It seems like you took a wrong turn" heading and a "Return home" outline button linking to /staking (stakingPaths.index). It only catches unmatched URLs; a loader that throws a 404 (an unknown pool slug, the playground in production, a missing post) renders the root ErrorBoundary instead (ssr-error-boundary entry). The stacking redirect sends /stacking/liquid/lisa to /staking/liquid/lisa, which no route matches, so that legacy link ends here. No test id and no spec.',
  },
  {
    id: 'ssr-error-boundary',
    anchor: { kind: 'behavior' },
    routes: [],
    params: [],
    entry: [
      {
        kind: 'deepLink',
        steps: [
          'Open /staking/pool/not-a-pool: the pool loaders throw data("Pool not found: not-a-pool", { status: 404 }) and the root ErrorBoundary renders "404" with that message',
          'Or open /playground on the production deploy, where the playground layout loader throws data("Not found", { status: 404 })',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'uninstalled', network: 'mainnet', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [],
    description:
      'root.tsx exports ErrorBoundary, which renders ErrorPage → ErrorLayout (features/error/error-layout.tsx) inside the normal Layout chrome (nav, footer, NetworkGate). For a route error response (isRouteErrorResponse) the heading is "404" when the status is 404 and "Error" otherwise, the body is error.data, then "The requested page could not be found." for a 404 or the statusText, then "An unexpected error occurred."; the error is reported to Sentry. Any other thrown value shows "Oops!" and "An unexpected error occurred."; when import.meta.env.DEV the second line is replaced by the error message and a stack <pre> is added. Throwers: the three pool loaders (pool-staking*.route.tsx) for a slug outside stakingPoolSlugSchema, playground.layout.tsx when playgroundEnabled is false (CLOUDFLARE_ENV === "production"), post.route.tsx ("Post not found", a plain Error with cause 404, so it renders as "Oops!") and help-center.route.tsx ("Categories not found"). On the server entry.server.tsx handleError reports unaborted request errors to Sentry and a streaming error sets the response status to 500. No spec covers it.',
  },
  {
    id: 'network-gate',
    anchor: { kind: 'behavior' },
    routes: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Open /multisig, click the "Change network" button in the header and pick "Testnet" (the only control that writes a non-mainnet value), then open /staking or any non-multisig route',
          'The gate shows "Not available on testnet" with a "Switch to mainnet" button that sets the network back and reveals the page',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'uninstalled', network: 'testnet', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [],
    description:
      'NetworkGate (layouts/network-gate/network-gate.tsx) wraps the route content in root.tsx, for the normal shell and the bare playground canvas alike. routeSupportsNetwork (network-support.ts) allows everything on mainnet and only paths equal to or under /multisig on any other network, so on testnet every other route renders a centred "Not available on testnet" heading, "This page doesn\'t support testnet." and a solid "Switch to mainnet" button calling setNetworkName("mainnet"). The network lives in the jotai networkNameAtom persisted under the localStorage key "network" (default "mainnet", store/stacks-network.ts); the multisig NetworkModeSwitcher and the gate\'s own "Switch to mainnet" button are the only UI that changes it, and multisig follows it through useMultisigNetworks (mainnet or the testnet pair). Bitcoin Staking reads pox-5 state from the chain pinned in data/pox5-network-config.ts (mainnet) regardless of this selector.',
  },
  {
    id: 'wallet-connect',
    anchor: { kind: 'behavior' },
    routes: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On any page with the Page.Header (staking, sBTC, portfolio, changelog, help center) the header shows "Install" with no wallet detected, "Connect" once a provider is detected and the truncated STX address once connected',
          'Click "Connect": in mock mode the mock wallet dialog opens for getAddresses and "Resolve" connects; with a real wallet @stacks/connect requests getAddresses (payment, ordinals and stacks addresses), forcing the wallet picker on /staking routes',
          'The connected dropdown offers "Switch account" (runs connect again), "Open extension" (Leather only) and "Sign out"',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'mock-installed', network: 'mainnet', mocks: ['successHandlers'] },
    selectors: { others: [ConnectSelectors.MockWalletResolveButton] },
    actions: [],
    specs: [modeFixtureSpec, bitcoinStakingSpec],
    description:
      'useLeatherConnect (store/addresses.ts) derives status from the addresses atom persisted under the localStorage key "addresses" and from provider detection (isAnyWalletInstalled in utils/utils.ts: window.LeatherProvider, XverseProviders, btc_providers, wbip_providers or webbtc_stx_providers, polled for 2 seconds after mount): "missing" renders InstallLeatherButton ("Install", opens the Chrome store), "detected" renders "Connect" and "connected" renders ActiveAccountButtonLayout with the truncated STX address. connect() calls connectWallet (utils/wallet.ts): in mock mode it is leather.getAddresses() through the mock provider; otherwise it revokes a previous non-Leather wallet session (wallet_disconnect with a 2 second timeout; a selected Leather provider is left alone), marks Leather as the selected provider unless the page is under /staking (allowWalletSelect), and calls request("getAddresses") from @stacks/connect. A result without an STX address opens the missing-stacks-account dialog; a user rejection is silent; another error toasts "Couldn\'t connect wallet. Please try again.". On success the addresses are stored, and for Leather on mainnet completeZealyConnectTask POSTs the STX address to https://api.leather.io/v1/quests/connect-earn/complete (leatherZealyQuestConnectEarnHandler mocks it and the fixture waits for that response). The mode fixture builds its "mock-connected" storage once per worker by clicking "Connect" then "Resolve" and copying localStorage, so a mock-connected spec starts with "addresses" already set and the mock STX address SP32YZPY7SEF52D2R4AD103SCDP4E7ATVBF1CTEST (createMockGetAddressesResponse). disconnect() clears the addresses and, outside mock mode, revokes a non-Leather session the same way and clears the @stacks/connect selected provider.',
  },
  {
    id: 'install-leather-dialog',
    anchor: { kind: 'selectors', objects: ['ConnectSelectors.InstallLeatherDialog'] },
    routes: [],
    startRoute: RouteUrls.Staking,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'With no wallet provider detected (uninstalled mode) open /staking and click "Start earning" on a pool row of the Stacks staking pools table',
          'The sheet opens over the page without changing the URL; the X button closes it',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'uninstalled', network: 'mainnet', mocks: [] },
    selectors: { ready: ConnectSelectors.InstallLeatherDialog, others: [] },
    actions: [],
    specs: [],
    description:
      'InstallDialog (features/install-dialog/install-dialog.tsx) is mounted once in the root Layout and shows while the showInstallLeatherDialog atom is true. It is a Sheet titled "Install Leather" with "Please install Leather wallet extension to proceed" and a row showing the Leather logo, "Leather" / "leather.io" and an "Install" button that opens LEATHER_EXTENSION_CHROME_STORE_URL. The only opener is StartStakingButton (pages/bitcoin-staking/components/start-staking-button.tsx) in the "missing" extension state; the header "Install" button and the sBTC "Install Leather to bridge" buttons open the store directly instead. The test id sits on the sheet body, not the Sheet root. No spec opens it.',
  },
  {
    id: 'mock-wallet-dialog',
    anchor: {
      kind: 'selectors',
      objects: [
        'ConnectSelectors.MockWalletDialog',
        'ConnectSelectors.MockWalletResolveButton',
        'ConnectSelectors.MockWalletRejectButton',
      ],
    },
    routes: [],
    startRoute: RouteUrls.Staking,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'In mock-installed mode click "Connect" in the header (getAddresses), or in mock-connected mode confirm a stake, update, unstake or claim (stx_callContract)',
          'The sheet opens over the current screen; "Resolve" answers with the canned response and "Reject" answers with an RPC error; the X button closes it leaving the request pending',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'mock-installed', network: 'mainnet', mocks: ['successHandlers'] },
    selectors: {
      ready: ConnectSelectors.MockWalletDialog,
      others: [ConnectSelectors.MockWalletResolveButton, ConnectSelectors.MockWalletRejectButton],
    },
    actions: [],
    specs: [bitcoinStakingSpec, modeFixtureSpec],
    description:
      'The stand-in for the extension popup in mock mode. When localStorage "leather-mock-mode" is "true", utils/leather-sdk.ts installs mockWalletProvider as window.LeatherProvider and builds the SDK client on mockLeatherProvider; every request dispatches a mockRequest event (mocks/extension/event-bus.ts) and MockLeatherDialog (features/mock-dialog/mock-dialog.tsx, mounted once in the root Layout) opens a Sheet headed with the RPC method name and two JSON blocks, "Request" and "Response". The response is createMockGetAddressesResponse for getAddresses and stx_getAddresses, { txid: 0x1111…11 (32 bytes), transaction: "" } for stx_callContract and {} for any other method, which is why the multisig sign-in cannot complete through it. "Resolve" dispatches that response and closes; "Reject" dispatches an error { message: "Mock error", code: -32603 }, which mockWalletProvider.request turns into a thrown "Mock Leather error: Mock error". The specs click the buttons by role name ("Resolve", "Reject"). The fixture enables mock mode by seeding "leather-mock-mode" before navigation; the "Mock mode on"/"Mock mode off" toggle (components/mock-mode-toggle.tsx, mounted by Page.Header but rendered as a fixed pill in the bottom-right corner) is shown when LEATHER_SHOW_MOCK_MODE_TOGGLE is "true" or mock mode is already on, and toggling it starts the MSW worker on enable or stops it on disable, then reloads.',
  },
  {
    id: 'missing-stacks-account-dialog',
    anchor: { kind: 'selectors', objects: ['ConnectSelectors.MissingStacksAccountDialog'] },
    routes: [],
    startRoute: RouteUrls.Staking,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'With a real wallet whose getAddresses result has no STX entry (a Leather Ledger wallet without Stacks keys, or another wallet), click "Connect" in the header',
          'After the connect animation delay the sheet opens; closing it leaves the wallet disconnected',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'mock-installed', network: 'mainnet', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [],
    description:
      'NoStacksAccountsWarningDialog (features/sign-in-button/sign-in-button.tsx) renders next to the header SignInButton, so it is absent under /multisig where the sign-in slot replaces that button. It opens when useLeatherConnect().connect() receives addresses without an STX symbol: the hook revokes the session or clears the addresses, waits 750 ms for the extension animation and sets showMissingStacksKeysDialog to "leather" or "generic". The sheet reads "Unable to connect" and "Your wallet does not have a Stacks account available."; for Leather it adds an "Open Leather" link (leather.open fullpage) followed by "with your Ledger device ready, and select Connect Stacks from the home screen", otherwise "Open your wallet and enable a Stacks account, then try connecting again". The mock getAddresses response always includes an STX address, so no fixture mode and no spec reaches it; it carries no ready selector because the stated session cannot show it. The test id (ConnectSelectors.MissingStacksAccountDialog) sits on the sheet body.',
  },
] as const satisfies readonly WebFeatureEntry[];
