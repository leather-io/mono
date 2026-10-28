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
      'The Browser tab, app/(tabs)/browser.tsx (BrowserSelectors.BrowserScreen), the third trigger of features/navigation/tab-layout.tsx ("Browser", HomeSelectors.BrowserTab). Nothing in it reads a wallet or an account, and the tab bar is not gated, so it works with or without a wallet (signed-out is the minimal precondition; dApp requests that need an account are the approver entries). State lives in use-browser-search-state.ts: searchUrl and textUrl start at LEATHER_APPS_URL (https://leather.io/explorer) and goToUrl runs formatURL (features/browser/browser/utils.tsx): a string starting with "http" is kept, a bare domain (letters, digits, dots and dashes ending in a 2+ letter TLD) gets "https://", anything else becomes "https://duckduckgo.com/?q=<text>". When the url search param is set (useOpenUrl in use-open-url.ts navigates to `/browser?url=${url}` without encoding it, after router.dismissAll() when a pushed screen can be dismissed) the screen tracks the analytics event "in_app_browser_opened" with { url } and calls goToUrl. features/browser/browser/browser.tsx renders the WebView inside a ViewShot with the injected @leather.io/provider/mobile script (built with the literal branch "branch", version "version" and commitSha "sha"). onShouldStartLoadWithRequest lets http(s) URLs load, opens the decoded S.browser_fallback_url of an Android intent URL with expo-linking and blocks the load, and hands every other scheme to Linking.openURL. onOpenWindow (target=_blank, window.open) loads the target URL in the same WebView. Every finished navigation syncs the search state to the page URL, captures a 300x600 screenshot of the ViewShot (captureScreenshot, saved as <hostname>_screenshot.jpg in the document directory) and dispatches userAddsApp({ screenshot, name: page title, origin, status: "recently_visited" }); the apps entity adapter uses addOne keyed by origin, so a known origin keeps its first screenshot URI, name and status (the file at that URI is overwritten on every finished load of the hostname). Pull-to-refresh is enabled; overscrolling more than 150 points calls browserSheetRef.current?.close(), but browserSheetRef (core/global-sheet-provider.tsx) is never attached to a sheet, so that does nothing. The bottom bar (search-bar/search-bar.tsx) shows the loading gradient (features/account/components/browser-loading.tsx, visible while the WebView is loading), the navigation bar (search-bar/browser-navigation-bar.tsx: a back chevron, BrowserSelectors.BackButton, calling webView.goBack() and disabled when the WebView cannot go back, and the current hostname, BrowserSelectors.UrlButton, which focuses the input). The search panel (use-search-bar-animated-styles.ts) follows the keyboard: its opacity is the keyboard progress and it sits 200 points lower until the keyboard is half open, so the input and the toolbar are only usable while the keyboard is up. The input (search-input/generic-search-text-input.tsx, BrowserSelectors.SearchInput, placeholder "Type URL or search") has a clear button (BrowserSelectors.ClearSearchButton) while it holds text; submitting dismisses the keyboard and after 50 ms loads the text when isValidUrl (formatURL then an http: or https: protocol) holds, else shows the error toast "Wrong URL". The toolbar (search-bar/search-bar-toolbar.tsx, toolbar-button.tsx) has "Explore" (BrowserSelectors.ExploreButton: loads https://leather.io/explorer and hides the keyboard), "Connections" (BrowserSelectors.ConnectionsButton: navigates to /app-connections, app-connections) and "Recents" (BrowserSelectors.RecentsButton: navigates to /app-recently-viewed, app-recently-viewed). Messages from the page go through browser-message-routing; getInfo and supportedMethods are answered inline (rpc-get-info, rpc-supported-methods) and the rest open browser-approver-sheet. Pages load live. No Maestro flow or unit spec covers the screen; legacy-flows/settings-support.yaml asserted "GET SUPPORT" after Settings > Help opened the support page in it.',
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
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
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
      'app/app-connections.tsx (BrowserSelectors.ConnectionsScreen), titled "Connections", lists useApps("connected") (store/apps/apps.read.ts) in reverse store order, so the most recently added origin comes first. An app is stored as "recently_visited" by the Browser on its first finished navigation (store/apps/apps.write.ts userAddsApp, keyed by origin) and becomes "connected", with an accountId "<fingerprint>/<accountIndex>", only when the user approves getAddresses or stx_getAddresses (userConnectsApp, see rpc-get-addresses and the rpc-stx-* get-addresses entry); a connected app no longer appears in Recently viewed. With no connected app the empty state (BrowserSelectors.ConnectionsEmptyState) shows the UFO sticker and "You will find the apps you are connected to here". Each row is features/browser/browser/link-card.tsx: the icon and name come from getAppDetails (utils.tsx: a predefined dApp from utils/dapps whose parent hostname, the last two labels, matches gives its icon and title; otherwise a Favicon for the parent hostname and the stored page title), with the origin below. Tapping the row (BrowserSelectors.LinkCard, one per app with the same id) calls openUrl(app.origin), which dismisses pushed screens and loads the origin in the Browser tab; the close icon (BrowserSelectors.LinkCardRemoveButton) dispatches userRemovesApp, which deletes the app from the store (its connection and its recently visited entry), and shows the info toast "Disconnected". The header back arrow (SharedSelectors.BackButton) goes back, or to / when there is no history; the right side shows the NetworkBadge off mainnet. A row needs a dApp that was connected with getAddresses; the list is local state only. No Maestro flow or unit spec covers it.',
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
      'app/app-recently-viewed.tsx (BrowserSelectors.RecentlyViewedScreen), titled "Recently viewed" (the toolbar button that opens it says "Recents"), lists useApps("recently_visited") in reverse store order. Every origin the Browser finishes loading is added once with status "recently_visited", its page title and a screenshot; an origin that was connected through getAddresses or stx_getAddresses moves to Connections instead. With none the empty state (BrowserSelectors.RecentlyViewedEmptyState) shows the flower sticker and "You will find the apps you recently viewed here". Each card is features/browser/browser/screenshot-card.tsx (BrowserSelectors.ScreenshotCard, one per app with the same id): the getAppDetails icon and name (utils.tsx), a close icon (BrowserSelectors.ScreenshotCardRemoveButton) that dispatches userRemovesApp without a toast, and the stored screenshot, 40% of the window wide and 300 points tall. Tapping a card calls openUrl(app.origin) (use-open-url.ts), which dismisses pushed screens and navigates to /browser?url=<origin>. The header back arrow (SharedSelectors.BackButton) goes back, or to / when there is no history. Nothing here needs a wallet; a card needs one page loaded in the Browser first. No Maestro flow or unit spec covers it.',
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
      'Answered without UI. features/browser/browser/message-routing.ts resolveBrowserRpcRequest returns { type: "get-info" } when the message passes the origin check and getInfo.request (packages/rpc/src/methods/get-info.ts, method "getInfo", no params) parses it; browser.tsx then calls sendResult(createGetInfoResponse(request)), which injects window.onMessageFromRN(<response>) into the WebView and calls approverSheetRef.dismiss(). createGetInfoResponse (features/browser/browser/utils.tsx) builds a success response with the request id and the result { platform: "mobile", version: `${Application.nativeApplicationVersion}/${Application.nativeBuildVersion}` from expo-application, supportedMethods: the names rpc-supported-methods returns }. Those names are the keys of the endpoints map in packages/rpc/src/index.ts (stxCallContract, btcAddAccount), not the wire method strings (stx_callContract, btc_addAccount). It needs no wallet. message-routing.spec.ts asserts that getInfo from the main frame resolves to "get-info" and that getInfo from a cross-origin subframe is dropped; the response builder is not covered.',
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
      'Answered without UI, like rpc-get-info: resolveBrowserRpcRequest (features/browser/browser/message-routing.ts) returns { type: "supported-methods" } when supportedMethods.request (packages/rpc/src/methods/supported-methods.ts, method "supportedMethods") parses the message, and browser.tsx posts createSupportedMethodsResponse(request) through sendResult. createSupportedMethodsResponse (features/browser/browser/utils.tsx) returns { documentation: LEATHER_GITBOOK_DEVS ("https://leather.gitbook.io/developers"), methods } where methods is Object.keys(endpoints) from packages/rpc/src/index.ts minus const unsupportedMethods = ["stxGetNetworks", "stxUpdateProfile", "open", "openSwap"], each with docsUrl LEATHER_GITBOOK_DEVS. The names are therefore the endpoint export keys (getAddresses, signPsbt, stxCallContract, stxSignMessage, btcAddAccount, stxAddAccount, getInfo, supportedMethods, ...) rather than the wire methods (stx_callContract), and btcAddAccount and stxAddAccount are listed although browser-approver.tsx has no case for btc_addAccount or stx_addAccount (they open an empty approver sheet, see browser-approver-sheet). It needs no wallet. message-routing.spec.ts asserts that supportedMethods from the main frame resolves to "supported-methods"; the response is not covered.',
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
      'WebView onMessage in features/browser/browser/browser.tsx passes nativeEvent.data, nativeEvent.url (the posting frame) and the top-frame origin (new URL(navState.url).origin, null before the first navigation event) to resolveBrowserRpcRequest (features/browser/browser/message-routing.ts). getVerifiedMessageOrigin returns null, and the message is dropped, when the top-frame origin is null, the frame URL does not parse, its protocol is not http: or https:, or its origin (scheme, host and port) differs from the top-frame origin; otherwise the frame origin is the verified origin. The data is then dropped when JSON.parse throws or when parseEndpointRequest (packages/rpc/src/index.ts: the first endpoints request schema that parses) returns nothing. A message that parses as getInfo resolves to { type: "get-info" } and one that parses as supportedMethods to { type: "supported-methods" } (rpc-get-info, rpc-supported-methods); every other request resolves to { type: "present", request, origin } and browser.tsx calls approverSheetRef.present(request, origin) (browser-approver-sheet). A dropped message gets no response, so the dApp promise stays pending. message-routing.spec.ts covers getVerifiedMessageOrigin (same-origin main frame and subframe accepted; cross-origin subframe, look-alike suffix host, userinfo pointing at another host, different port, different scheme, about: and data: URLs, invalid or empty URLs and a null top origin rejected) and resolveBrowserRpcRequest (a cross-origin sendTransfer or stx_callContract dropped, a main-frame sendTransfer presented with the top origin, getInfo and supportedMethods answered for the main frame, getInfo from a cross-origin subframe dropped, non-JSON data dropped). The parseEndpointRequest rejection path is not covered.',
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
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
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
      'The host every browser approver renders in. features/browser/approver-sheet/approver-sheet.tsx is mounted by browser.tsx and exposes approverSheetRef (core/global-sheet-provider.tsx) with present(request, origin), which stores both and presents the FullHeightSheet (components/sheets/full-height-sheet/full-height-sheet.tsx, one 100% snap point), waiting 500 ms first when the sheet has not fully closed, and dismiss(), which dismisses and clears both. While a request and an origin are set it renders a padded Box (BrowserSelectors.ApproverSheet) with browser-approver.tsx. BrowserApprover looks the origin up with useAppByOrigin and returns null when the apps store has no entry for it (the Browser only adds an origin after a navigation finishes loading), then switches on request.method: getAddresses, signPsbt, sendTransfer and signMessage (rpc-get-addresses, rpc-sign-psbt, rpc-send-transfer, rpc-sign-message), and stx_getAddresses, stx_signTransaction, stx_transferStx, stx_transferSip9Nft, stx_transferSip10Ft, stx_signMessage, stx_signStructuredMessage, stx_callContract and stx_deployContract (the rpc-stx-* entries); sendTransfer and the stx signing methods read the account with getAccountIdFromConnectedApp (stx_callContract and stx_deployContract with getAccountIdFromRequestParams, which uses params.address when set), which throws "App is not connected" for an app that never approved getAddresses. Any other method that parses (btc_addAccount, stx_addAccount, stx_getNetworks, stx_updateProfile, open, openSwap) hits the default branch, an empty full-height box with no buttons. The approvers share features/approver/components/approver-buttons/index.tsx: "Cancel" (ApproverSelectors.CancelButton) with "Approve" or a custom label (ApproverSelectors.ApproveButton), "Retry" (ApproverSelectors.RetryButton) after a failed approve, "Submitting..." and "Submitted" states, and "Close window" (ApproverSelectors.CloseButton) in the submitted-details state; each renders only in its state. Cancel calls closeApprover, which sends createRpcErrorResponse(request.method, { id, error: { code: RpcErrorCode.USER_REJECTION, message: RpcErrorMessage.UserRejectedOperation ("User rejected request", approver-sheet/utils.ts) } }) and dismisses. Approvers resolve through sendResult in browser.tsx, which injects window.onMessageFromRN(<JSON response>) into the WebView and dismisses the sheet. ApproverSheet passes no onDismiss, so closing the sheet any other way (the Android back button handler in the ui Sheet) sends no response and leaves the dApp promise pending. No Maestro flow or unit spec covers the host.',
  },
] as const satisfies readonly MobileFeatureEntry[];
