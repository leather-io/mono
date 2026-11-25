import { AppRoutes } from '@/shared/app-routes';
import { ApproverSelectors } from '@/shared/selectors/approver.selectors';
import { BrowserSelectors } from '@/shared/selectors/browser.selectors';
import { HomeSelectors } from '@/shared/selectors/home.selectors';
import { SharedSelectors } from '@/shared/selectors/shared.selectors';

import type { MobileFeatureEntry } from './mobile-feature-entry';

const messageRoutingSpec = 'apps/mobile/src/features/browser/browser/message-routing.spec.ts';

export const browserFeatures = [
  {
    id: 'browser',
    anchor: { kind: 'route' },
    routes: [AppRoutes.Browser],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Tap the "Browser" tab (HomeSelectors.BrowserTab); the WebView loads https://leather.io/explorer',
          'Tap the hostname bar (BrowserSelectors.UrlButton) to focus the search input; the search panel with the input (BrowserSelectors.SearchInput) and the "Explore", "Connections" and "Recents" buttons slides up with the keyboard',
          'Type a URL or a search term and submit',
        ],
      },
      {
        kind: 'nav',
        steps: [
          'Any in-app link that calls useOpenUrl (Settings > Help, the Home "Learn" cards, activity rows, the Connections and Recently viewed cards) dismisses every pushed screen and navigates to /browser?url=<url>',
        ],
      },
      {
        kind: 'deepLink',
        steps: [
          'Open leather://browser?url=https://app.example.com (the same /browser?url= href useOpenUrl navigates to; the screen reads url with useLocalSearchParams)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: {
      ready: BrowserSelectors.UrlButton,
      others: [
        HomeSelectors.BrowserTab,
        BrowserSelectors.BrowserScreen,
        BrowserSelectors.BackButton,
        BrowserSelectors.SearchInput,
        BrowserSelectors.ClearSearchButton,
        BrowserSelectors.ExploreButton,
        BrowserSelectors.ConnectionsButton,
        BrowserSelectors.RecentsButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'The Browser tab (app/(tabs)/browser.tsx, BrowserSelectors.BrowserScreen; "Browser" in the tab bar, HomeSelectors.BrowserTab). Nothing in it reads a wallet, so it works signed out; dApp requests that need an account are the approver entries. The search state starts at https://leather.io/explorer and goToUrl runs formatURL (utils.tsx): a string starting with "http" is kept, a bare domain gets "https://", anything else becomes a DuckDuckGo search. With the url search param set (use-open-url.ts navigates to /browser?url=<url> without encoding it, after dismissing any pushed screen) the screen tracks in_app_browser_opened and loads it. browser.tsx renders the WebView with the injected @leather.io/provider/mobile script; http(s) URLs load, an Android intent URL opens its fallback URL and every other scheme goes to Linking.openURL, and window.open targets load in the same WebView. Every finished navigation syncs the search state to the page URL, captures a screenshot and dispatches userAddsApp({ origin, name, screenshot, status: "recently_visited" }); the apps store is keyed by origin with addOne, so a known origin keeps its first screenshot, name and status. Overscrolling more than 150 points calls browserSheetRef.current?.close(), but browserSheetRef is attached to no sheet, so that does nothing. The bottom bar shows the loading gradient while the page loads and the navigation bar: a back chevron (BrowserSelectors.BackButton, disabled when the WebView cannot go back) and the current hostname (BrowserSelectors.UrlButton), which focuses the input. The search panel follows the keyboard and sits 200 points lower until it is half open, so the input and the toolbar are only usable while the keyboard is up. The input (BrowserSelectors.SearchInput, placeholder "Type URL or search") has a clear button (BrowserSelectors.ClearSearchButton) while it holds text; submitting loads the text when it formats to an http(s) URL, else shows the error toast "Wrong URL". The toolbar has "Explore" (BrowserSelectors.ExploreButton, loads https://leather.io/explorer), "Connections" (BrowserSelectors.ConnectionsButton, navigates to /app-connections) and "Recents" (BrowserSelectors.RecentsButton, navigates to /app-recently-viewed). Messages from the page go through browser-message-routing: getInfo and supportedMethods are answered inline and the rest open the browser-approver-sheet. Pages load live.',
  },
  {
    id: 'app-connections',
    anchor: { kind: 'route' },
    routes: [AppRoutes.AppConnections],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Tap the "Browser" tab (HomeSelectors.BrowserTab)',
          'Tap the hostname bar (BrowserSelectors.UrlButton) to bring up the search panel',
          'Tap "Connections" (BrowserSelectors.ConnectionsButton)',
        ],
      },
      { kind: 'deepLink', steps: ['Open leather://app-connections'] },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: BrowserSelectors.ConnectionsScreen,
      others: [
        BrowserSelectors.LinkCard,
        BrowserSelectors.LinkCardRemoveButton,
        BrowserSelectors.ConnectionsEmptyState,
        SharedSelectors.BackButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'The "Connections" screen (app/app-connections.tsx, BrowserSelectors.ConnectionsScreen) lists the apps with status "connected" (apps.read.ts) in reverse store order, newest first. An app is stored as "recently_visited" by the Browser on its first finished navigation and becomes "connected", with the accountId "<fingerprint>/<accountIndex>", only when the user approves getAddresses or stx_getAddresses (userConnectsApp); a connected app no longer appears in Recently viewed. With none, the empty state (BrowserSelectors.ConnectionsEmptyState) shows the UFO sticker and "You will find the apps you are connected to here". Each row (link-card.tsx, BrowserSelectors.LinkCard, the same id on every row) shows the icon and name from getAppDetails (a predefined dApp matching the parent hostname, else the favicon and the stored page title) with the origin below; tapping it opens the origin in the Browser tab, and the close icon (BrowserSelectors.LinkCardRemoveButton) dispatches userRemovesApp, which deletes the app from the store, and toasts "Disconnected". Back goes to the previous screen, or to / without history; the NetworkBadge shows off mainnet. The list is local state only.',
  },
  {
    id: 'app-recently-viewed',
    anchor: { kind: 'route' },
    routes: [AppRoutes.AppRecentlyViewed],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Tap the "Browser" tab (HomeSelectors.BrowserTab)',
          'Tap the hostname bar (BrowserSelectors.UrlButton) to bring up the search panel',
          'Tap "Recents" (BrowserSelectors.RecentsButton)',
        ],
      },
      { kind: 'deepLink', steps: ['Open leather://app-recently-viewed'] },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: {
      ready: BrowserSelectors.RecentlyViewedScreen,
      others: [
        BrowserSelectors.ScreenshotCard,
        BrowserSelectors.ScreenshotCardRemoveButton,
        BrowserSelectors.RecentlyViewedEmptyState,
        SharedSelectors.BackButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'The "Recently viewed" screen (app/app-recently-viewed.tsx, BrowserSelectors.RecentlyViewedScreen; the toolbar button reads "Recents") lists the apps with status "recently_visited" in reverse store order. Every origin the Browser finishes loading is added once with its page title and a screenshot; an origin connected through getAddresses or stx_getAddresses moves to Connections instead. With none, the empty state (BrowserSelectors.RecentlyViewedEmptyState) shows the flower sticker and "You will find the apps you recently viewed here". Each card (screenshot-card.tsx, BrowserSelectors.ScreenshotCard, the same id on every card) shows the getAppDetails icon and name, a close icon (BrowserSelectors.ScreenshotCardRemoveButton) that dispatches userRemovesApp without a toast, and the stored screenshot; tapping it opens the origin in the Browser tab. Back goes to the previous screen, or to / without history. Nothing here needs a wallet; a card needs one page loaded in the Browser first.',
  },
  {
    id: 'rpc-get-info',
    anchor: { kind: 'rpc', handlers: ['getInfo'] },
    routes: [],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'getInfo',
        steps: [
          'Load any http(s) page in the Browser tab and let it finish loading',
          'From the top frame call window.LeatherProvider.request("getInfo") through the injected @leather.io/provider/mobile',
          'The promise resolves at once with { platform: "mobile", version: "<nativeApplicationVersion>/<nativeBuildVersion>", supportedMethods: [...] }; no sheet opens',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [messageRoutingSpec],
    description:
      'Answered without UI: resolveBrowserRpcRequest (message-routing.ts) returns { type: "get-info" } when the message passes the origin check and parses as getInfo, and browser.tsx posts createGetInfoResponse(request) (utils.tsx) through sendResult: { platform: "mobile", version: "<nativeApplicationVersion>/<nativeBuildVersion>", supportedMethods } with the same names rpc-supported-methods returns, the endpoint keys of packages/rpc (stxCallContract, btcAddAccount), not the wire method strings. It needs no wallet. message-routing.spec.ts asserts that getInfo from the main frame resolves to "get-info" and that getInfo from a cross-origin subframe is dropped; the response builder is not covered.',
  },
  {
    id: 'rpc-supported-methods',
    anchor: { kind: 'rpc', handlers: ['supportedMethods'] },
    routes: [],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'supportedMethods',
        steps: [
          'Load any http(s) page in the Browser tab and let it finish loading',
          'From the top frame call window.LeatherProvider.request("supportedMethods") through the injected provider',
          'The promise resolves at once with { documentation: "https://leather.gitbook.io/developers", methods: [{ name, docsUrl }] }; no sheet opens',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [messageRoutingSpec],
    description:
      'Answered without UI, like rpc-get-info: resolveBrowserRpcRequest returns { type: "supported-methods" } and browser.tsx posts createSupportedMethodsResponse(request) (utils.tsx): { documentation: "https://leather.gitbook.io/developers", methods }, where methods is every endpoint key of packages/rpc minus stxGetNetworks, stxUpdateProfile, open and openSwap, each with the same docsUrl. The names are the endpoint export keys (getAddresses, signPsbt, stxCallContract, btcAddAccount, ...) rather than the wire methods, and btcAddAccount and stxAddAccount are listed although browser-approver.tsx has no case for btc_addAccount or stx_addAccount (they open an empty approver sheet, see browser-approver-sheet). It needs no wallet. message-routing.spec.ts asserts that supportedMethods from the main frame resolves to "supported-methods"; the response is not covered.',
  },
  {
    id: 'browser-message-routing',
    anchor: { kind: 'behavior' },
    routes: [],
    params: [],
    entry: [
      {
        kind: 'rpc',
        steps: [
          'Load a page in the Browser tab and post a JSON-RPC message through the injected provider (window.LeatherProvider.request(...)), from the top frame or from an iframe',
          'Same-origin http(s) frames with a request that parses are answered inline (getInfo, supportedMethods) or open the approver sheet; anything else is dropped without a response',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [messageRoutingSpec],
    description:
      'WebView onMessage (browser.tsx) passes the message data, the posting frame URL and the top-frame origin (null before the first navigation event) to resolveBrowserRpcRequest (message-routing.ts). The message is dropped when the top-frame origin is null, the frame URL does not parse, its protocol is not http: or https:, or its origin differs from the top-frame origin; otherwise the frame origin is the verified origin. It is also dropped when the data is not JSON or no endpoint request schema of packages/rpc parses it. getInfo and supportedMethods resolve to their inline answers (rpc-get-info, rpc-supported-methods); every other request resolves to { type: "present", request, origin } and browser.tsx presents the browser-approver-sheet. A dropped message gets no response, so the dApp promise stays pending. message-routing.spec.ts covers the origin check (same-origin main frame and subframe accepted; cross-origin subframe, look-alike suffix host, userinfo pointing at another host, different port or scheme, about: and data: URLs, invalid or empty URLs and a null top origin rejected) and the routing (a cross-origin sendTransfer or stx_callContract dropped, a main-frame sendTransfer presented with the top origin, getInfo and supportedMethods answered for the main frame, getInfo from a cross-origin subframe dropped, non-JSON data dropped); the unparseable-request path is not covered.',
  },
  {
    id: 'browser-approver-sheet',
    anchor: {
      kind: 'selectors',
      objects: ['ApproverSelectors.CancelButton', 'BrowserSelectors.ApproverSheet'],
    },
    routes: [],
    startRoute: AppRoutes.Browser,
    open: [],
    params: [],
    entry: [
      {
        kind: 'rpc',
        steps: [
          'Load the dApp in the Browser tab and wait for the page to finish loading, so the origin is in the apps store',
          'Call any method other than getInfo or supportedMethods through window.LeatherProvider.request(...) from the top frame; the full-height approver sheet slides up over the browser',
          'Cancel (ApproverSelectors.CancelButton) answers with error code 4001 "User rejected request" and closes the sheet',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: BrowserSelectors.ApproverSheet,
      others: [
        ApproverSelectors.CancelButton,
        ApproverSelectors.ApproveButton,
        ApproverSelectors.RetryButton,
        ApproverSelectors.CloseButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'The host every browser approver renders in (features/browser/approver-sheet/approver-sheet.tsx, mounted by browser.tsx on approverSheetRef): present(request, origin) stores both and presents a full-height sheet, waiting 500 ms first when the sheet has not fully closed, and dismiss() clears them. While both are set it renders a box (BrowserSelectors.ApproverSheet) with browser-approver.tsx, which returns null when the apps store has no entry for the origin (the Browser adds one only after a navigation finishes loading) and otherwise switches on request.method: getAddresses, signPsbt, sendTransfer and signMessage (the rpc-* entries) and the stx_* methods (the rpc-stx-* entries). sendTransfer and the stx signing methods read the account from the connected app, stx_callContract and stx_deployContract from params.address when set, and throw "App is not connected" for an app that never approved getAddresses. Any other method that parses (btc_addAccount, stx_addAccount, stx_getNetworks, stx_updateProfile, open, openSwap) hits the default branch, an empty box with no buttons. The approvers share approver-buttons/index.tsx: "Cancel" (ApproverSelectors.CancelButton) with "Approve" or a custom label (ApproverSelectors.ApproveButton), "Retry" (ApproverSelectors.RetryButton) after a failed approve, the "Submitting..." and "Submitted" states, and "Close window" (ApproverSelectors.CloseButton) in the submitted-details state; each renders only in its state. Cancel posts the error { code: 4001, message: "User rejected request" } for the request id and dismisses; approvers post their result through sendResult, which injects window.onMessageFromRN(<response>) into the WebView and dismisses the sheet. The sheet passes no onDismiss, so closing it any other way (the Android back button) sends no response and leaves the dApp promise pending.',
  },
] as const satisfies readonly MobileFeatureEntry[];
