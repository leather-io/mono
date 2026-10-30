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
          'On the Home tab tap "Receive" in the action buttons (no test id; account-actions.tsx); it presents the sheet with every asset',
          'Or on token-details for Bitcoin tap "Receive", which lists only the two Bitcoin addresses',
          'Tap a row (ReceiveSelectors.AssetItem; from Home, index 0 is Native Segwit, 1 is Taproot, 2 is Stacks) to open receive-asset-details, or its copy icon (ReceiveSelectors.AssetItemCopyButton)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: ReceiveSelectors.AssetItem,
      others: [ReceiveSelectors.AssetItemCopyButton],
    },
    actions: [],
    specs: [],
    description:
      'The first screen of the global receive sheet (features/receive/receive-sheet.tsx, mounted in the root layout only while settings hold a currentAccount): present(receiveType) stores the type ("stacks", "bitcoin", "native-segwit", "taproot" or "all") and the sheet hosts its own stack with "select-asset" and "asset-details". The type filters the Native Segwit, Taproot and Stacks entries built from the current account addresses (get-assets.ts); when exactly one asset matches, the sheet starts on "asset-details" and skips this screen. Callers: Home "Receive" passes "all" (three rows); token-details passes "bitcoin" for BTC (two rows, so this screen shows) and "stacks" for STX and SIP-10 (one row, skipped); the token-details "Native Segwit" and "Taproot" address rows pass "native-segwit" / "taproot" and the "Receive Stacks NFT" cell under "Get your first NFT" (the empty state of the Home Collectibles tab) passes "stacks", all skipping this screen. The header is "Select asset" with the subtitle "Receive"; its back button renders only when the route param previousRoute is "select-account", which no screen sets, so it never shows. Each row (receive-asset-item.tsx, ReceiveSelectors.AssetItem on every row, select by index) shows the asset icon, the name ("Bitcoin" or "Stacks") with an address-type badge ("Native Segwit" or "Taproot") for Bitcoin, the truncated address and a "Copy address" icon (ReceiveSelectors.AssetItemCopyButton) that copies the address and toasts "Address copied". Tapping a row stores the asset in the flow context and navigates to "asset-details". Addresses are derived locally, nothing is fetched. legacy-flows/receive.yaml asserted "Select account" and tapped walletListAccountCard before the asset rows, a step the sheet no longer has.',
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
    preconditions: { session: 'signed-in', mocks: [] },
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
      'The "asset-details" screen of the receive sheet (screens/asset-details.tsx): header "Receive" with the account name as subtitle and, only when previousRoute is "select-asset", the back button (SharedSelectors.BackButton), which pops the sheet stack and then also the expo-router history. It asserts that the flow context holds a selected asset. The body shows the QR code of the address (qr-card.tsx, ReceiveSelectors.QrCard, with the Leather lettermark, always in the light theme), the asset name with the address-type badge, the description from get-assets.ts ("This is your Native Segwit address for receiving tokens on the Bitcoin network.", "This is your Taproot address for receiving tokens on the Bitcoin network." or "This is your address for receiving tokens on the Stacks network."), the full address in a pressable box (ReceiveSelectors.CopyAddressButton) that copies it and toasts "Address copied", and "Share" (ReceiveSelectors.ShareButton), which opens the native share sheet with the address. Addresses are derived locally.',
  },
] as const satisfies readonly MobileFeatureEntry[];
