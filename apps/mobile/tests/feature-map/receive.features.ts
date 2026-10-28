import { AppRoutes } from '@/shared/app-routes';
import { ReceiveSelectors } from '@/shared/selectors/receive.selectors';
import { SharedSelectors } from '@/shared/selectors/shared.selectors';

import type { MobileFeatureEntry } from './mobile-feature-entry';

export const receiveFeatures = [
  {
    id: 'receive-select-asset',
    anchor: {
      kind: 'selectors',
      objects: ['ReceiveSelectors.AssetItem', 'ReceiveSelectors.AssetItemCopyButton'],
    },
    routes: [],
    startRoute: AppRoutes.Home,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On the Home tab tap "Receive" in the action buttons (features/account/components/account-actions.tsx through components/action-buttons.tsx, no test id); it calls receiveSheetRef.current?.present("all")',
          'Or on token-details for Bitcoin tap "Receive" (present("bitcoin")), which lists only the two Bitcoin addresses',
          'Tap a row (ReceiveSelectors.AssetItem; with "all", index 0 is Native Segwit, 1 is Taproot, 2 is Stacks) to open receive-asset-details, or its copy icon (ReceiveSelectors.AssetItemCopyButton)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: ReceiveSelectors.AssetItem,
      others: [ReceiveSelectors.AssetItemCopyButton],
    },
    actions: [],
    specs: [],
    description:
      'The first screen of the global receive sheet. app/_layout.tsx mounts ReceiveSheet (features/receive/receive-sheet.tsx) only while settings hold a currentAccount; present(receiveType) stores the type (utils/get-receive-type.ts: "stacks" | "bitcoin" | "native-segwit" | "taproot" | "all") and the sheet hosts its own @react-navigation/stack (features/receive/navigation.tsx inside core/sheet-navigation-container.tsx) with "select-asset" and "asset-details" (receive.tsx). use-select-assets.ts filters get-assets.ts (Native Segwit, Taproot and Stacks entries built from the current account payer and signer addresses) by the type; when exactly one asset matches, the sheet passes it as selectedAsset and getInitialRouteName starts on "asset-details", skipping this screen (screens/select-asset.tsx also navigates there on mount in that case). Callers: Home "Receive" passes "all" (three rows); token-details passes getReceiveType(asset): "bitcoin" for BTC (two rows, so this screen shows) and "stacks" for STX and SIP-10 (one row, skipped); the token-details "Native Segwit" and "Taproot" address rows (features/token/components/address-list.tsx) pass "native-segwit" / "taproot" and the "Receive Stacks NFT" cell under "Get your first NFT" (features/token/components/get-first-nft-section.tsx, the empty state of the Home Collectibles tab in features/token/collectibles-list.tsx) passes "stacks", all skipping this screen. The header is "Select asset" with the subtitle "Receive"; its back button renders only when the route param previousRoute is "select-account", which no screen sets (the stack has no select-account screen), so it never shows. Each row (components/receive-asset-item.tsx, ReceiveSelectors.AssetItem on every row, select by index) shows the asset icon, the name ("Bitcoin" or "Stacks") with an address-type badge ("Native Segwit" or "Taproot") for Bitcoin, the truncated address and a "Copy address" icon (ReceiveSelectors.AssetItemCopyButton) that copies the address and toasts "Address copied" (hooks/use-copy-address.ts). Tapping a row stores the asset in the flow context and navigates to "asset-details" with previousRoute "select-asset". legacy-flows/receive.yaml walked this sheet before it rotted: it asserted "Select account" and tapped walletListAccountCard before the asset rows, but "Select account" is no longer in the Lingui sources and the sheet opens on the current account. Addresses are derived locally, nothing is fetched. No flow or spec covers it.',
  },
  {
    id: 'receive-asset-details',
    anchor: {
      kind: 'selectors',
      objects: [
        'ReceiveSelectors.QrCard',
        'ReceiveSelectors.CopyAddressButton',
        'ReceiveSelectors.ShareButton',
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
          'From receive-select-asset tap a row (ReceiveSelectors.AssetItem)',
          'Or open the sheet with a single matching asset (token-details "Receive" on STX or a SIP-10 token, an address row on Bitcoin token-details, "Receive Stacks NFT" on the empty Home Collectibles tab); it opens directly on this screen without a back button',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: ReceiveSelectors.QrCard,
      others: [
        ReceiveSelectors.CopyAddressButton,
        ReceiveSelectors.ShareButton,
        SharedSelectors.BackButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'The "asset-details" screen of the receive sheet (features/receive/screens/asset-details.tsx): header "Receive" with the account name as subtitle and, only when previousRoute is "select-asset", the HeaderBackButton passed SharedSelectors.BackButton explicitly, which calls the sheet goBack and then also the expo-router back() (or navigate("/") with no history). It asserts that the flow context holds a selected asset. The body shows the QR code of the address (components/qr-card.tsx, ReceiveSelectors.QrCard: react-native-qrcode-svg with the Leather lettermark, always in the light theme), the asset name with the address-type badge, the description from get-assets.ts ("This is your Native Segwit address for receiving tokens on the Bitcoin network.", "This is your Taproot address for receiving tokens on the Bitcoin network." or "This is your address for receiving tokens on the Stacks network."), the full address in a pressable box (ReceiveSelectors.CopyAddressButton) that copies it and toasts "Address copied", and "Share" (ReceiveSelectors.ShareButton), which opens the native share sheet with the address. legacy-flows/receive.yaml asserted "This is your Native Segwit address.", a longer Taproot text and "This is your Stacks address."; none of those strings exists in the Lingui sources any more. Addresses are derived locally. No flow or spec covers it.',
  },
] as const satisfies readonly MobileFeatureEntry[];
