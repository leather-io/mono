import { AppRoutes } from '@/shared/app-routes';
import { ApproverSelectors } from '@/shared/selectors/approver.selectors';
import { RpcBitcoinSelectors } from '@/shared/selectors/rpc-bitcoin.selectors';
import { SendSelectors } from '@/shared/selectors/send.selectors';
import { SharedSelectors } from '@/shared/selectors/shared.selectors';

import type { MobileFeatureEntry } from './mobile-feature-entry';

const buildRecipientSuggestionsSpec =
  'apps/mobile/src/features/send/components/recipient/build-recipient-suggestions.spec.ts';
const signerSpec = 'apps/mobile/src/features/psbt-signer/signer.spec.ts';

export const sendFeatures = [
  {
    id: 'send-select-asset',
    anchor: { kind: 'selectors', objects: ['SendSelectors.AssetPickerItem'] },
    routes: [],
    startRoute: AppRoutes.Home,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On the Home tab tap "Send" in the action buttons (no test id; account-actions.tsx); it presents the sheet without an asset, so it opens on this screen',
          'Tap a row (SendSelectors.AssetPickerItem, index 0 is Bitcoin, index 1 is Stacks, then the SIP-10 tokens) to open send-form',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: SendSelectors.AssetPickerItem,
      others: [],
    },
    actions: [],
    specs: [],
    description:
      'The first screen of the global send sheet (features/send/send-sheet.tsx, mounted in the root layout only while settings hold a currentAccount; a full-height sheet hosting its own stack with the screens "select-asset", "form" and "approver"). It starts here only when present() received no asset; a preselected asset (the "Send" button on token-details, which calls present(asset)) starts on "form" and skips this screen. The screen (screens/select-asset.tsx) has the header "Select asset" with the subtitle "Send", no back button, and preloads the form data (fee rates, BTC market data and the account UTXOs; the STX balance, STX market data and the next nonce). The list (asset-picker.tsx) has a Bitcoin row, a Stacks row and then the account SIP-10 balances sorted by sortSip10Balances; the SIP-10 rows render only with release_sip10_send_feature (useSip10SendFlag) on, so flags stays empty. Every row carries SendSelectors.AssetPickerItem (asset-picker-item.tsx) and the inner cell the dynamic id tokenBalanceItem-<ticker>, which Home renders under the sheet too. Tapping a row tracks send_asset_selected, stores the asset in the send flow context and navigates to "form". The same picker opens as a bottom sheet from the form (inline-asset-picker.tsx, see send-form). Dismissing the sheet tracks send_sheet_dismissed. legacy-flows/send.yaml tapped "Send" and asserted "Select account", a string the sheet no longer has.',
  },
  {
    id: 'send-form',
    anchor: {
      kind: 'selectors',
      objects: [
        'SendSelectors.AmountField',
        'SendSelectors.AssetDisplay',
        'SendSelectors.RecipientToggle',
        'SendSelectors.RecipientToggleQrButton',
        'SendSelectors.MemoToggle',
        'SendSelectors.ReviewButton',
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
          'From send-select-asset tap a row (SendSelectors.AssetPickerItem)',
          'Or on token-details for BTC, STX or a SIP-10 token tap "Send" (sendSheetRef.current?.present(asset)); the sheet opens directly on this form without a back button',
          'Enter the amount on the numpad (no test ids; tap the key labels "0"-"9", "." and "delete"; a long press on delete resets to 0) or tap "Max"',
          'Tap "Enter recipient" (SendSelectors.RecipientToggle) to open send-recipient-sheet, or its QR icon (SendSelectors.RecipientToggleQrButton) to open send-recipient-qr-sheet',
          'Tap "Review" (SendSelectors.ReviewButton) to build the transaction and open send-approver',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: SendSelectors.AmountField,
      others: [
        SendSelectors.AssetDisplay,
        SendSelectors.RecipientToggle,
        SendSelectors.RecipientToggleQrButton,
        SendSelectors.MemoToggle,
        SendSelectors.ReviewButton,
        SharedSelectors.BackButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'The "form" screen of the send sheet (screens/form.tsx): header "Send" with the account name as subtitle and, only when the stack can go back (arrived from send-select-asset), the back button (SharedSelectors.BackButton), which pops the sheet stack and then also the expo-router history. form.layout.tsx switches on the asset protocol: nativeBtc renders btc-loader.tsx and btc-form.tsx, nativeStx stx-loader.tsx and stx-form.tsx, sip10 sip10-loader.tsx and sip10-form.tsx. Each loader shows a spinner while loading and the error fallback with a retry; the live data is the BTC balance, available UTXOs, fee rates and BTC market data, or the STX or SIP-10 balance, market data and next nonce. The form shows the asset row (SendSelectors.AssetDisplay, also carrying tokenBalanceItem-<ticker>), which opens the inline asset picker to switch asset in place; the amount field (SendSelectors.AmountField) with a "Max" button (no test id); the recipient toggle (SendSelectors.RecipientToggle) reading "Enter recipient" with a "Scan a QR code" icon (SendSelectors.RecipientToggleQrButton, only while the recipient is empty) or the chosen address; for STX and SIP-10 only, the memo toggle (SendSelectors.MemoToggle, "Add memo" or "Edit memo") opening an "Add memo" sheet with a "Memo" input and "Confirm"; the amount error line (hidden while the amount is effectively zero); the numpad (no test ids; a key that exceeds the decimals of the input currency is refused) and "Review" (SendSelectors.ReviewButton), disabled until the zod form is valid. "Max" (use-send-max.ts) sets the amount to the max spend (BTC from the UTXOs, recipient and fee rate; STX the balance minus the default fee; SIP-10 the full balance) and re-applies it when the recipient changes. Validation (btc-form-schema.ts, stx-form-schema.ts reused by SIP-10 with the token decimals) uses error-messages.ts: "Not a number", "Amount must be greater than zero", "Token can only have ${decimals} decimals", "Minimum is ${minimumBtcSpendAmount}", "Insufficient funds", "Address is not valid", "Address is for incorrect network", "Compliance check failed", "Cannot send to yourself" (STX and SIP-10) and "Memo must be less than 34-bytes". The BTC fee rate defaults to the halfHourFee estimate and the STX and SIP-10 fee to calculateDefaultStacksFee. "Review" builds a PSBT with change to native segwit index 0, an STX transfer or a SIP-10 transfer and navigates to "approver" with { hex, fingerprint, accountIndex }; a build failure shows the toast "Transaction failed due to an unexpected error". The amount locale is fixed to en-US. A reproduction needs a funded account on the current network.',
  },
  {
    id: 'send-recipient-sheet',
    anchor: {
      kind: 'selectors',
      objects: [
        'SendSelectors.RecipientSearchField',
        'SendSelectors.RecipientSearchQrButton',
        'SendSelectors.RecipientSuggestionItem',
        'SendSelectors.RecipientGuardConfirmButton',
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
          'Open send-form and tap "Enter recipient" (SendSelectors.RecipientToggle)',
          'Type an address or BNS name into the autofocused search (SendSelectors.RecipientSearchField) or tap a suggestion (SendSelectors.RecipientSuggestionItem)',
          'A new address opens the "Verify full address" guard sheet; tap "Confirm" (SendSelectors.RecipientGuardConfirmButton) to fill the recipient and return to send-form',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: SendSelectors.RecipientSearchField,
      others: [
        SendSelectors.RecipientSearchQrButton,
        SendSelectors.RecipientSuggestionItem,
        SendSelectors.RecipientGuardConfirmButton,
      ],
    },
    actions: [],
    specs: [buildRecipientSuggestionsSpec],
    description:
      'The recipient bottom sheet of send-form (recipient/recipient.tsx mounts recipient-sheet.tsx at a 90% snap point, plus the QR and guard sheets). While the account activity loads it shows a spinner, and on error an empty text. Otherwise recipient-selector.tsx shows the autofocused search "Search for BNS name or address" (SendSelectors.RecipientSearchField is its container) and, while the search is empty, the "Scan a QR code" icon (SendSelectors.RecipientSearchQrButton, opens send-recipient-qr-sheet) and, with send_paste_button (useSendPasteButton) on, the clipboard paste button. The term is debounced by 500 ms and build-recipient-suggestions.ts builds the sections: with an empty term "Recents" (up to four recent external receivers of this asset, newest first, excluding contract targets and own accounts) and "Your accounts" (the wallet accounts, without the current one unless the asset is on Bitcoin, which can self-send); with a term a single "Matching" section: a valid address gives its existing entry or a new external entry, else accounts and recents whose name or address starts with the term, else a BNS lookup for name.tld terms. Empty sections are dropped; a search with no match shows "No results found" / "The address you entered isn’t valid. Verify and try again". Rows (SendSelectors.RecipientSuggestionItem) are account cells for own accounts and cells with the BNS name or address and a relative time for external ones. Selecting a row or scanning runs use-recipient-evaluator.ts against the recipient schema and opens recipient-guard-sheet.tsx when needed: "Sending to the same address" (warn, returned only for Bitcoin assets, but the BTC schema has no "Cannot send to yourself" rule, so it never fires) or "Can’t send to the same address" (block, STX and SIP-10), "Address from another network" (block), "Address blocked" (block, compliance) and "Verify full address" with "You haven’t sent to this address before. Double-check that it’s correct before proceeding." (warn, an address in neither the activity nor own accounts). Warn sheets show the address with "Confirm" (SendSelectors.RecipientGuardConfirmButton, fills the recipient and closes both sheets) and "Cancel"; block sheets only "Dismiss". build-recipient-suggestions.spec.ts covers the empty-term sections and the search matches; the guard sheet and the selector UI are not covered.',
  },
  {
    id: 'send-recipient-qr-sheet',
    anchor: { kind: 'selectors', objects: ['SendSelectors.QrScannerCloseButton'] },
    routes: [],
    startRoute: AppRoutes.Home,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Open send-form and tap the QR icon in the recipient toggle (SendSelectors.RecipientToggleQrButton), or open send-recipient-sheet and tap its QR icon (SendSelectors.RecipientSearchQrButton)',
          'Grant camera access; point the camera at an address QR, or tap the back arrow (SendSelectors.QrScannerCloseButton) to close the scanner',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: SendSelectors.QrScannerCloseButton,
      others: [],
    },
    actions: [],
    specs: [],
    description:
      'The full-screen QR scanner sheet of send-form (recipient-qr-sheet.tsx at a 100% snap point with no handle, hosting the shared qr-scanner.tsx). It renders in the dark theme: the camera (expo-camera, QR codes only, ignoring codes whose corners fall outside the screen) and the chrome with the title "Scan QR Code", the back arrow labelled "Close the scanner" (SendSelectors.QrScannerCloseButton, dismisses the scanner) and the cut-out frame. use-camera-permission.ts requests access while the status is undetermined or askable; when denied it shows the alert "Allow Camera Access" / "Turn on camera access in Settings to scan a QR." with "Cancel" and "Settings" (Linking.openSettings()), and the camera renders only once permission is granted. The parser accepts a Bitcoin address, a Stacks address or a BIP-21 URI with a Bitcoin address; anything else turns the frame red and shakes it with an error haptic for 750 ms (the parser message "Scan a Bitcoin or Stacks address" is passed to the chrome but not rendered). A successful scan closes the scanner and the recipient sheet, then runs the same guard as send-recipient-sheet: with a warning or block the recipient is cleared and the guard sheet opens, otherwise the address fills the recipient. A reproduction needs a device or simulator with a camera feed.',
  },
  {
    id: 'send-approver',
    anchor: {
      kind: 'selectors',
      objects: ['ApproverSelectors.ApproveButton', 'ApproverSelectors.CancelButton'],
    },
    routes: [],
    startRoute: AppRoutes.Home,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Fill send-form with a valid amount and recipient and tap "Review" (SendSelectors.ReviewButton); it navigates the sheet stack to "approver" with { hex, fingerprint, accountIndex }',
          'Tap "Approve" (ApproverSelectors.ApproveButton) to sign and broadcast, or "Cancel" (ApproverSelectors.CancelButton) to go back to the form',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: ApproverSelectors.ApproveButton,
      others: [
        ApproverSelectors.CancelButton,
        ApproverSelectors.RetryButton,
        ApproverSelectors.CloseButton,
        RpcBitcoinSelectors.PsbtSignerRecipientsSection,
        RpcBitcoinSelectors.PsbtSignerAccountSection,
        RpcBitcoinSelectors.PsbtSignerFeeSection,
      ],
    },
    actions: [],
    specs: [signerSpec],
    description:
      'The "approver" screen of the send sheet (screens/approver.tsx), reachable only from send-form because its params carry the unsigned transaction hex; it renders nothing without a selected asset or hex and reads the account from the send flow context, not from the fingerprint and accountIndex params. Bitcoin uses psbt-signer.tsx with the fee editor on and broadcast true (the same component as rpc-sign-psbt, so RpcBitcoinSelectors.PsbtSignerRecipientsSection, PsbtSignerAccountSection and PsbtSignerFeeSection render here, Bitcoin only): header "Send token", "You’ll send", "To address", the account card, the fee card that opens the approver-bitcoin-fee-sheet (a new fee regenerates the PSBT from the account UTXOs and toasts "Fee updated"), "Show advanced options" with the inputs and outputs, and "Total spend"; it waits for the fee rates before rendering. STX and SIP-10 use stx-approver.tsx and sip10-approver.tsx on base-stx-tx-approver.layout.tsx: header "Sign Transaction", the account card, "You’ll send" and "To address" for an STX transfer or the post conditions and recipient for the SIP-10 contract call, the Stacks fee card (opens the approver-stacks-fee-sheet), the memo card for STX (rendered disabled, so the approver-memo-sheet does not open) and the nonce card under "Show advanced options" (opens the approver-nonce-sheet); fee and nonce changes re-serialize the hex and toast "Fee updated" / "Nonce updated". The footer (approver-buttons/index.tsx): "Cancel" (ApproverSelectors.CancelButton) goes back to send-form, "Approve" (ApproverSelectors.ApproveButton) switches to "Submitting...", then "Submitted" for one second, then "Copy ID", "View details" (opens the explorer link and dismisses the sheet) and "Close window" (ApproverSelectors.CloseButton, dismisses the sheet); a failure switches Approve to "Retry" (ApproverSelectors.RetryButton). STX and SIP-10 sign with the account Stacks signer, broadcast and toast "Transaction is sent!" or the error message; Bitcoin signs with signTx, finalizes, broadcasts and toasts "Failed to broadcast transaction" on any failure. After broadcast a status row shows, and on the Stacks layout the fee and nonce cards are disabled. Approving broadcasts a real transaction on the current network, so a reproduction needs a funded testnet account. signer.spec.ts covers signTx, including signing every matching input when no signAtIndex is given, which is the Bitcoin send path; nothing covers the screen.',
  },
] as const satisfies readonly MobileFeatureEntry[];
