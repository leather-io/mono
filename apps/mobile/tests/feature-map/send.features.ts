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
          'On the Home tab tap "Send" in the action buttons (features/account/components/account-actions.tsx through components/action-buttons.tsx, no test id); it calls sendSheetRef.current?.present() without an asset, so the sheet opens on this screen',
          'Tap a row (SendSelectors.AssetPickerItem, index 0 is Bitcoin, index 1 is Stacks, then the SIP-10 tokens) to open send-form',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: SendSelectors.AssetPickerItem,
      others: [],
    },
    actions: [],
    specs: [],
    description:
      'The first screen of the global send sheet. app/_layout.tsx mounts SendSheet (features/send/send-sheet.tsx) only while settings hold a currentAccount; it is a FullHeightSheet hosting its own @react-navigation/stack (features/send/navigation.tsx inside core/sheet-navigation-container.tsx) with the screens "select-asset", "form" and "approver" (features/send/send.tsx). getInitialRouteName starts on "select-asset" only when present() received no asset; a preselected asset (the "Send" button on token-details for BTC, STX and SIP-10, which calls present(asset)) starts on "form" and skips this screen. The screen (features/send/screens/select-asset.tsx) has the header "Select asset" with the subtitle "Send", no back button, and preloads the form data (hooks/use-preload-btc-data.ts: fee rates, BTC market data and the account UTXOs; hooks/use-preload-stx-data.ts: STX balance, STX market data and the next nonce). The list is components/asset-picker/asset-picker.tsx: a Bitcoin row (BitcoinBalanceByAccount) and a Stacks row (StacksBalanceByAccount), then the account SIP-10 balances from useSip10AccountBalance sorted by sortSip10Balances. The SIP-10 rows render only with release_sip10_send_feature on (useSip10SendFlag in features/feature-flags/index.ts); with it off the picker shows Bitcoin and Stacks only, so flags stays empty. Every row is wrapped by components/asset-picker/asset-picker-item.tsx, whose View carries SendSelectors.AssetPickerItem; the inner TokenCell also carries the dynamic id tokenBalanceItem-<ticker> (HomeSelectors.TokenBalanceItem prefix), which Home renders under the sheet too. Tapping a row tracks send_asset_selected, stores the asset in the send flow context (send-flow-provider.tsx) and navigates to "form"; the Bitcoin and Stacks rows measure their position so the form animates the asset row from there. The same picker opens as a bottom sheet from the form (components/inline-asset-picker.tsx), see send-form. Dismissing the sheet tracks send_sheet_dismissed. legacy-flows/send.yaml tapped "Send", asserted "Select account" and then tapped "$0.00" twice; neither "Select account" nor "$0.00" exists in the Lingui sources any more (only "Select asset" does), so that path is gone. No flow or spec covers this screen.',
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
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
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
      'The "form" screen of the send sheet (features/send/screens/form.tsx): header "Send" with the account name as subtitle and, only when the stack can go back (arrived from send-select-asset), the HeaderBackButton (SharedSelectors.BackButton), which calls the sheet goBack and then also the expo-router back() (or navigate("/") with no history). screens/form.layout.tsx switches on the asset protocol: nativeBtc renders forms/btc/btc-loader.tsx + btc-form.tsx, nativeStx forms/stx/stx-loader.tsx + stx-form.tsx, sip10 forms/stx/sip10-loader.tsx + sip10-form.tsx. Each loader shows a spinner (components/send-form-layout.tsx) while loading and the Error fallback with a retry that refetches all queries on error; the live data is: BTC useBtcAccountBalance, useAccountUtxos (available UTXOs), useAverageBitcoinFeeRates and useBtcMarketDataQuery; STX useStxAccountBalance (available unlocked balance), useStxMarketDataQuery and useNextNonce for the account Stacks address; SIP-10 useSip10BalanceByAssetId, useMarketDataQuery(asset) and useNextNonce. The form shows the asset row (components/asset-display.tsx, SendSelectors.AssetDisplay; it also carries tokenBalanceItem-<ticker>), which opens the inline asset picker sheet (components/inline-asset-picker.tsx, the same AssetPicker as send-select-asset) to switch asset in place; the amount field (components/amount-field.tsx wrapping components/amount-field/amount-field.tsx, SendSelectors.AmountField) with a "Max" button (no test id) and the arrow connector (field-connector-arrow.tsx); the recipient toggle (SendSelectors.RecipientToggle) reading "Enter recipient" with a "Scan a QR code" icon (SendSelectors.RecipientToggleQrButton, only while the recipient is empty) or the chosen address; for STX and SIP-10 only, the memo toggle (components/memo.tsx, SendSelectors.MemoToggle) labelled "Add memo" or "Edit memo", which opens an "Add memo" sheet with a "Memo" input and "Confirm"; the amount error line (components/error-message.tsx, hidden while the amount is effectively zero); the numpad (components/numpad.tsx over the ui Numpad, no test ids; hooks/use-validate-input-decimal-places.ts refuses a key that exceeds the decimals of currencyDecimalsMap for the input currency, else the asset decimals, else 2) and "Review" (SendSelectors.ReviewButton), disabled until the zod form is valid. "Max" (hooks/use-send-max.ts) sets isSendingMax and the amount to the max spend (BTC hooks/use-calculate-btc-max-spend.ts from UTXOs, recipient and fee rate; STX hooks/use-calculate-stx-max-spend.ts: balance minus the default fee; SIP-10 the full balance) and re-applies it when the recipient changes. Validation (forms/btc/btc-form-schema.ts, forms/stx/stx-form-schema.ts reused by SIP-10 with the token decimals) uses error-messages.ts: "Not a number", "Amount must be greater than zero", "Token can only have ${decimals} decimals", "Minimum is ${minimumBtcSpendAmount}", "Insufficient funds", "Address is not valid", "Address is for incorrect network", "Compliance check failed" (getComplianceService().checkAddressCompliance on a valid address, memoized in utils.ts), "Cannot send to yourself" (STX and SIP-10) and "Memo must be less than 34-bytes". The BTC fee rate defaults to the halfHourFee estimate; the STX/SIP-10 fee is calculateDefaultStacksFee (utils.ts). "Review" builds a PSBT (utils.ts btcFormValuesToPsbtHex with change to native segwit index 0), an STX transfer (stxFormValuesToSerializedTransaction) or a SIP-10 transfer (getTransferSip10TxHex) and navigates to "approver" with { hex, fingerprint, accountIndex }; a build failure shows the toast "Transaction failed due to an unexpected error". constants.ts fixes the amount locale to en-US. A reproduction needs a funded account on the current network. No flow or spec covers the form.',
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
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
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
      'The recipient bottom sheet of send-form (features/send/components/recipient/recipient.tsx mounts recipient-sheet.tsx at a 90% snap point, plus the QR and guard sheets; use-recipient-state.ts owns the three sheet refs). While the account activity loads (use-relevant-activity.ts: the activity query filtered to sendAsset items of this asset) it shows a spinner; on error recipient-selector/recipient-selector-error.tsx renders an empty text. Otherwise recipient-selector/recipient-selector.tsx shows the autofocused search "Search for BNS name or address" (SendSelectors.RecipientSearchField is its container) and, while the search is empty, the "Scan a QR code" icon (SendSelectors.RecipientSearchQrButton, opens send-recipient-qr-sheet) and, with send_paste_button on (useSendPasteButton), the clipboard paste button (ios-recipient-paste-button.tsx, expo-clipboard ClipboardPasteButton, fills the search with pasted text). use-recipient-suggestions.ts debounces the term by 500 ms and runs build-recipient-suggestions.ts: with an empty term the sections "Recents" (up to four recent external receivers of this asset, newest first, excluding contract targets and own accounts) and "Your accounts" (the wallet accounts, without the current one unless the asset is on Bitcoin, which can self-send); with a term a single "Matching" section: a valid address gives its existing entry or a new external entry, else accounts and recents whose name or address starts with the term, else a BNS lookup for name.tld terms (recipient.utils.ts: the Bitcoin payment address or the Stacks owner from getBnsService().getBnsProfile). Empty sections are dropped; a search with no match shows recipient-selector-search-empty-state.tsx "No results found" / "The address you entered isn’t valid. Verify and try again". Section titles come from recipient-selector-section-header.tsx; rows (recipient-selector-item.tsx, SendSelectors.RecipientSuggestionItem) are AccountListItem cells for own accounts and cells with the BNS name or address and a relative time for external ones. Selecting a row or scanning runs use-recipient-evaluator.ts against the form recipient schema and opens recipient-guard-sheet.tsx when needed: "Sending to the same address" (warn, returned only for Bitcoin assets, but the BTC schema has no "Cannot send to yourself" rule so it never fires) or "Can’t send to the same address" (block, STX and SIP-10), "Address from another network" (block), "Address blocked" (block, compliance) and "Verify full address" with "You haven’t sent to this address before. Double-check that it’s correct before proceeding." (warn, an address in neither the activity nor own accounts). Warn sheets show the address with "Confirm" (SendSelectors.RecipientGuardConfirmButton, fills the recipient and closes both sheets) and "Cancel"; block sheets only "Dismiss". With no guard the address is set directly. build-recipient-suggestions.spec.ts covers the empty-term sections (recents shape, four-item limit, own accounts excluded from recents, current account excluded without self-send, empty sections dropped) and the search (new valid address, match by account name, by account address, by recent address, resolved BNS name). The guard sheet and the selector UI are not covered.',
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
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: SendSelectors.QrScannerCloseButton,
      others: [],
    },
    actions: [],
    specs: [],
    description:
      'The full-screen QR scanner sheet of send-form (features/send/components/recipient/recipient-qr-sheet.tsx at a 100% snap point with no handle, hosting recipient-qr-scanner.tsx over features/qr-scanner/qr-scanner.tsx). It renders in the dark theme: the camera (qr-scanner-camera.tsx, expo-camera CameraView for QR codes only, fading in after it is ready, ignoring codes whose corners fall outside the screen) and the chrome (qr-scanner-chrome.tsx) with the title "Scan QR Code", the back arrow labelled "Close the scanner" (SendSelectors.QrScannerCloseButton, dismisses the scanner) and the cut-out frame (qr-scanner-frame.tsx). use-camera-permission.ts requests access while the status is undetermined or denied but askable; when denied it shows the alert "Allow Camera Access" / "Turn on camera access in Settings to scan a QR." with "Cancel" and "Settings" (Linking.openSettings()); the camera view renders only once permission is granted. The parser accepts a Bitcoin address, a Stacks address or a BIP-21 URI with a Bitcoin address; anything else turns the frame red and shakes it with an error haptic for 750 ms (the parser message "Scan a Bitcoin or Stacks address" is passed to the chrome but not rendered). A successful scan closes the scanner and the recipient sheet, then runs the same guard as send-recipient-sheet: with a warning or block the recipient is cleared and the guard sheet opens, otherwise the address fills the recipient. A reproduction needs a device or simulator with a camera feed; no flow or spec covers it.',
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
    deepLinkable: false,
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
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
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
      'The "approver" screen of the send sheet (features/send/screens/approver.tsx), reachable only from send-form because its route params carry the unsigned transaction hex; it renders nothing without a selected asset or hex and reads the account from the send flow context, not from the fingerprint and accountIndex params. Bitcoin uses features/psbt-signer/psbt-signer.tsx with the fee editor on and broadcast true (the same component as rpc-sign-psbt, so RpcBitcoinSelectors.PsbtSignerRecipientsSection, PsbtSignerAccountSection and PsbtSignerFeeSection render here, Bitcoin only): header "Send token", "You’ll send", "To address", the account card, the fee card that opens approver-bitcoin-fee-sheet (features/approver/components/fees/bitcoin-fee-sheet.tsx; a new fee regenerates the PSBT from the account UTXOs and toasts "Fee updated"), "Show advanced options" with the inputs and outputs, and "Total spend"; it waits for useAverageBitcoinFeeRates before rendering. STX and SIP-10 use forms/stx/stx-approver.tsx and forms/stx/sip10-approver.tsx on features/approver/layouts/base-stx-tx-approver.layout.tsx: header "Sign Transaction", the account card, "You’ll send" and "To address" for an STX transfer or the post conditions and recipient for the SIP-10 contract call, the Stacks fee card (stacks-fees.section.tsx, opens approver-stacks-fee-sheet; fees from useCalculateStacksTxFees), the memo card for STX (memo.section.tsx, rendered disabled here, so approver-memo-sheet does not open) and, under "Show advanced options", the nonce card (nonce.section.tsx, opens approver-nonce-sheet); fee and nonce changes re-serialize the hex and toast "Fee updated" / "Nonce updated". The footer is features/approver/components/approver-buttons/index.tsx: "Cancel" (ApproverSelectors.CancelButton) calls goBack to send-form, "Approve" (ApproverSelectors.ApproveButton) switches to "Submitting...", then "Submitted" for one second, then "Copy ID", "View details" (opens the explorer link via makeActivityLink and dismisses the sheet) and "Close window" (ApproverSelectors.CloseButton, dismisses the sheet); a failure switches Approve to "Retry" (ApproverSelectors.RetryButton). STX and SIP-10 sign with the account Stacks signer, broadcast with useBroadcastStacksTransaction and toast "Transaction is sent!" or the error message; Bitcoin signs with signTx, finalizes, broadcasts with useBitcoinBroadcastTransaction and toasts "Failed to broadcast transaction" on any signing or broadcast failure. After broadcast a status row (btc-status-row.tsx / stx-status-row.tsx) shows, and on the Stacks layout the fee and nonce cards are disabled. Approving broadcasts a real transaction on the current network, so a reproduction needs a funded testnet account. signer.spec.ts covers signTx (features/psbt-signer/signer.ts), including signing every matching input when no signAtIndex is given, which is the Bitcoin send path; nothing covers the screen.',
  },
] as const satisfies readonly MobileFeatureEntry[];
