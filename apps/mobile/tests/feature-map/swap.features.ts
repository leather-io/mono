import { AppRoutes } from '@/shared/app-routes';
import { SharedSelectors } from '@/shared/selectors/shared.selectors';
import { SwapSelectors } from '@/shared/selectors/swap.selectors';

import type { MobileFeatureEntry } from './mobile-feature-entry';

const openSwapFromHomeStep =
  'On the Home tab tap "Swap" in the action buttons (features/account/components/account-actions.tsx via components/action-buttons.tsx; no test id, shown only with swap on); the sheet opens with STX as the base asset';

const openSwapFromTokenStep =
  'On token-details tap "Swap" (features/token/token.tsx); the sheet opens with that token as the base asset. On Bitcoin (features/token/bitcoin/bitcoin-token-details.tsx) the button renders only with swap_sbtc_bridging on';

const openReviewSteps = [
  openSwapFromHomeStep,
  'Tap the target toggle (SwapSelectors.TargetAssetToggle), pick a row (SwapSelectors.AssetSelectorItem + "-" + symbol), type an amount on the numpad and wait for the quote preview',
  'Tap "Review" (SwapSelectors.ReviewButton)',
];

export const swapFeatures = [
  {
    id: 'swap-form',
    anchor: {
      kind: 'selectors',
      objects: [
        'SwapSelectors.BaseAmountField',
        'SwapSelectors.TargetAmountPreview',
        'SwapSelectors.ReviewButton',
      ],
    },
    routes: [],
    startRoute: AppRoutes.Home,
    open: [],
    params: [],
    entry: [
      { kind: 'nav', steps: [openSwapFromHomeStep] },
      { kind: 'nav', steps: [openSwapFromTokenStep] },
    ],
    gate: 'splashScreen',
    flags: ['swap'],
    preconditions: {
      session: 'signed-in',
      network: 'mainnet',
      accountType: 'software',
      mocks: [],
    },
    selectors: {
      ready: SwapSelectors.BaseAmountField,
      others: [
        SwapSelectors.BaseAssetToggle,
        SwapSelectors.TargetAssetToggle,
        SwapSelectors.TargetAmountPreview,
        SwapSelectors.CurrencyModeSwitcher,
        SwapSelectors.FlipButton,
        SwapSelectors.ReviewButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'The global swap sheet, mounted in app/_layout.tsx only when settings hold a currentAccount and useSwapFlag() (swap) is on, and presented through useGlobalSheets().swapSheetRef.current?.present({ baseAsset?, targetAsset? }) (core/global-sheet-provider.tsx); callers are the Home "Swap" action button (no assets, so the base defaults to stxAsset in features/swap/swap.tsx) and the token-details "Swap" button (baseAsset is the token, only for swappable assets; Bitcoin passes canSwap from swap_sbtc_bridging). features/swap/swap-sheet.tsx is a FullHeightSheet named "swap" that tracks swap_sheet_opened / swap_sheet_dismissed and calls usePreloadSwapData (use-preload-swap-data.ts, the account base swap assets query) while mounted; features/swap/swap.tsx wraps SwapProvider from @leather.io/state/swap with use-swap-dependencies.ts (Stacks signer and next nonce, native segwit payer at address index 0, the market data, fees, coin selection and swap services, broadcastStacksTransaction and broadcastBitcoinTransaction; it asserts the Stacks signer and Bitcoin payer exist, so it throws without them) and use-swap-disabled-pairs.ts, and switches between a "form" and a "review" screen in local state (no route). screens/swap-form-screen.tsx shows the "Swap" title with no back element and two panels (components/panel.tsx): the pay card holds the amount field (components/amount-field/*, SwapSelectors.BaseAmountField; the value follows the numpad, the caret takes the asset colour and turns red with the error) whose second line is either the error from amount-field-error-messages.ts ("Enter an amount", "Invalid amount", "Too many decimals (max N)", "Minimum X", "Maximum X", "Insufficient balance", hidden while the input is effectively zero) or currency-mode-switcher.tsx (SwapSelectors.CurrencyModeSwitcher: a skeleton while pending, a dash on error, and on success the converted amount with an arrow that toggles crypto/fiat input), plus the base asset toggle (SwapSelectors.BaseAssetToggle, "Select" with a plus when empty) and asset-balance.tsx; the receive card holds target-amount-preview.tsx (SwapSelectors.TargetAmountPreview, "0" until a quote, pulsing while loading or refetching, with the fiat value below) and the target toggle (SwapSelectors.TargetAssetToggle, disabled until a base asset is set). flip-button.tsx (SwapSelectors.FlipButton, label "Flip assets") renders only while state.assetFlippingAllowed. Below, quote-preview/quote-preview.tsx shows nothing until an amount and target exist, then a skeleton, "Unable to load the quote" / "This is usually a temporary network or provider-side issue." with "Retry", "No quotes available for this swap.", a constraint box ("Amount too small", "Amount too large" or "Deposit cap reached" with "Depositing"/"Withdrawing"/"Swapping" copy for BTC/sBTC bridge limits), or the "Rate" (with quote-refetch-indicator.tsx, a 30 s refetch ring) and "Estimated fees" rows. amount-presets.tsx offers 25 %, 50 %, 75 % and "MAX", then the Numpad (decimals capped to the asset or fiat precision) and "Review" (SwapSelectors.ReviewButton, disabled until canSubmit), which tracks swap_review_initiated and opens swap-review. The toggles open swap-asset-selector-sheet. Quotes come from the SwapService providers alex-sdk, bitflow-sdk, bitflow-bff-api and sbtc-bridge (packages/services/src/swap/swap.service.ts). Mobile has no network gate: off mainnet useSwapState adds BITCOIN_EXCLUSION_PAIR_RULES (no BTC pairs), and the DEX providers take no network parameter, so a reproduction needs mainnet and a funded account. With swap_sbtc_bridging off, use-swap-disabled-pairs.ts blocks BTC as base and sBTC to BTC; with it on, BTC to sBTC and sBTC to BTC go through the sBTC bridge. Asset lists, balances, market data and quotes are fetched live. No flow or spec covers it; legacy-flows/accounts-page.yaml only asserted the "Swap" text on the old account page.',
  },
  {
    id: 'swap-asset-selector-sheet',
    anchor: { kind: 'selectors', objects: ['SwapSelectors.AssetSelector'] },
    routes: [],
    startRoute: AppRoutes.Home,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          openSwapFromHomeStep,
          'Tap the base toggle (SwapSelectors.BaseAssetToggle) or the target toggle (SwapSelectors.TargetAssetToggle)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: ['swap'],
    preconditions: {
      session: 'signed-in',
      network: 'mainnet',
      accountType: 'software',
      mocks: [],
    },
    selectors: {
      ready: SwapSelectors.AssetSelector,
      others: [SwapSelectors.AssetSelectorItem],
    },
    actions: [],
    specs: [],
    description:
      'The asset picker over swap-form: components/asset-selector/asset-selector-sheet.tsx is a Sheet at 75 % presented while state.selectingAsset is set (actions.openAssetSelector("base" | "target")) and closing through actions.closeAssetSelector on dismiss; it renders components/asset-selector/asset-selector.tsx (SwapSelectors.AssetSelector) with the base or target assets query. The search header (asset-selector-header.tsx with components/search-input.tsx, placeholder "Search for asset", "Clear search" button; no test id) shows while the query is pending, when there are assets, or while searching. use-swap-asset-search.ts debounces 200 ms and keeps assets whose display name ("Stacks" for STX, "Bitcoin" for BTC, else the asset name) or symbol, lower-cased, contains the trimmed term; the term itself is not lower-cased, so a term with capitals matches nothing. Pending shows ten skeleton rows (asset-selector-loading-state.tsx); an error shows "Unable to load assets" / "This is usually a temporary network or provider-side issue." with "Retry" (asset-selector-error.tsx); an empty result shows "No assets found" with "Clear search" while searching, "No swaps available" / "<asset> has no available receiving options right now." for a target list with a base set, or "No assets" / "Add funds to your wallet to start\\nswapping between currencies." (asset-selector-empty-state.tsx). Each row (asset-selector-item.tsx, a Cell with the dynamic id SwapSelectors.AssetSelectorItem + "-" + symbol, for example swapAssetSelectorItem-STX) shows the avatar with a Bitcoin or Stacks indicator, the display name, the available balance and its fiat value; tapping it calls setBaseSwapAsset or setTargetSwapAsset. Rows render only when the account lists swap assets for the live provider lists. No flow or spec covers it.',
  },
  {
    id: 'swap-review',
    anchor: {
      kind: 'selectors',
      objects: [
        'SwapSelectors.ReviewDetails',
        'SwapSelectors.ConfirmButton',
        'SwapSelectors.SubmissionOverlay',
      ],
    },
    routes: [],
    startRoute: AppRoutes.Home,
    open: [],
    params: [],
    entry: [{ kind: 'nav', steps: [...openReviewSteps] }],
    gate: 'splashScreen',
    flags: ['swap'],
    preconditions: {
      session: 'signed-in',
      network: 'mainnet',
      accountType: 'software',
      mocks: [],
    },
    selectors: {
      ready: SwapSelectors.ReviewDetails,
      others: [
        SwapSelectors.ReviewSummary,
        SwapSelectors.ConfirmButton,
        SwapSelectors.SlippageToggle,
        SwapSelectors.InfoButton,
        SwapSelectors.SubmissionOverlay,
        SwapSelectors.SubmissionStatus,
        SwapSelectors.BackToReviewButton,
        SharedSelectors.BackButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'The second screen of the swap sheet, screens/swap-review-screen.tsx, titled "Review Swap" with a HeaderBackButton (SharedSelectors.BackButton) and the Android hardware back both calling onGoBack (back to swap-form); HeaderBackButton then also runs router.back() (or navigates to / without history) on the stack under the sheet, because onGoBack does not prevent the event. A status guard reports to Sentry and exits to the form for idle or constrained estimates. matchLiveEstimate renders a spinner (swap-review-loading-state.tsx), "Unable to load swap details" with "Retry" (swap-review-error-state.tsx), "No quotes available" / "Not enough liquidity or no route available right now. Try a smaller amount or check back later." with "Go back" (swap-review-empty-state.tsx), or the content: swap-review-summary.tsx (SwapSelectors.ReviewSummary: both avatars, "-<base amount>" and "+<target amount>"), then swap-review-details.tsx (SwapSelectors.ReviewDetails, dimmed while refetching) with swap-review-account-details.tsx ("From", the account avatar and name, plus the wallet name with more than one wallet), "Rate" with the refetch ring, "Min. receive" when the quote has one, "Slippage" with the percentage toggle (SwapSelectors.SlippageToggle, opens swap-slippage-sheet) when slippage applies (not for the sBTC deposit), "Price impact" (price-impact-value.tsx, a triangle in yellow from 3 % and red from 10 %) only at or above PRICE_IMPACT_WARNING_THRESHOLD (3 %), and "Estimated fees"; the info buttons (SwapSelectors.InfoButton) open swap-info-sheets. swap-review-footer.tsx shows "Make sure everything looks correct.\\nConfirmed transactions cannot be undone." and "Confirm" (SwapSelectors.ConfirmButton, disabled unless canSubmit and idle; taps in the first 500 ms are ignored). Confirm calls the SwapProvider submit (at least 1.8 s), which signs without any approval sheet: Stacks contract-call quotes (DEX swaps and sBTC withdrawals) build the transaction with the selected fee and nonce, sign with the account Stacks signer and broadcast through broadcastStacksTransaction; the BTC to sBTC deposit builds the bridge deposit, runs coin selection, signs the PSBT with features/psbt-signer/signer.ts signTx and broadcasts through the Bitcoin client. swap-submission-overlay.tsx (SwapSelectors.SubmissionOverlay) covers the screen with the summary and a status: the message text carries SwapSelectors.SubmissionStatus + "-" + status (swapSubmissionStatus-submitting "Initiating the swap...", -success "Swap initiated", -failure "Failed to start a swap"). Success dismisses the "swap" sheet after 1.2 s; failure adds "Swap wasn\'t submitted due to an unexpected error. Please try again, or contact support if it persists." (the "contact support" text opens LEATHER_SUPPORT_URL) and "Back to review" (SwapSelectors.BackToReviewButton) returning to idle. Reproducing a submission broadcasts a real mainnet transaction from a funded account. No flow or spec covers it.',
  },
  {
    id: 'swap-slippage-sheet',
    anchor: {
      kind: 'selectors',
      objects: [
        'SwapSelectors.SlippageValue',
        'SwapSelectors.SlippageDecrement',
        'SwapSelectors.SlippageIncrement',
        'SwapSelectors.SlippageUpdateButton',
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
          ...openReviewSteps,
          'With a DEX quote, tap the slippage percentage next to "Slippage" (SwapSelectors.SlippageToggle)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: ['swap'],
    preconditions: {
      session: 'signed-in',
      network: 'mainnet',
      accountType: 'software',
      mocks: [],
    },
    selectors: {
      ready: SwapSelectors.SlippageValue,
      others: [
        SwapSelectors.SlippageDecrement,
        SwapSelectors.SlippageIncrement,
        SwapSelectors.SlippageUpdateButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'components/slippage-selector/slippage-selector-sheet.tsx, a Sheet presented by the review "Slippage" toggle (swap-review): "Edit Slippage", "Price moving against you past this percentage will cancel the swap.", a NumericInput between MIN_SLIPPAGE_PERCENTAGE and MAX_SLIPPAGE_PERCENTAGE (0.5 % to 10 %, default 3 %, in @leather.io/state/swap swap.constants.ts) with "Decrease slippage" (SwapSelectors.SlippageDecrement), the formatted value (SwapSelectors.SlippageValue, one decimal) and "Increase slippage" (SwapSelectors.SlippageIncrement), stepping 0.1 % per tap and 1 % on long press, and "Update slippage" (SwapSelectors.SlippageUpdateButton), which calls actions.setSlippage and dismisses. Dismissing without updating keeps the old slippage. The row and its toggle render only when the selected quote has slippageApplicable (stacks contract-call quotes, not the sBTC deposit). The "Slippage" info button opens the "Slippage tolerance" text in swap-info-sheets. No flow or spec covers it.',
  },
  {
    id: 'swap-info-sheets',
    anchor: { kind: 'selectors', objects: ['SwapSelectors.InfoSheetContent'] },
    routes: [],
    startRoute: AppRoutes.Home,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          ...openReviewSteps,
          'Tap the info icon (SwapSelectors.InfoButton) next to "Min. receive", "Slippage", "Price impact" or "Estimated fees"',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: ['swap'],
    preconditions: {
      session: 'signed-in',
      network: 'mainnet',
      accountType: 'software',
      mocks: [],
    },
    selectors: {
      ready: SwapSelectors.InfoSheetContent,
      others: [SwapSelectors.InfoButton],
    },
    actions: [],
    specs: [],
    description:
      'Four info sheets on swap-review share components/info-sheet/info-sheet.tsx: an IconButton labelled "Info" (SwapSelectors.InfoButton, the same id on every row, so pick by index or by the row label) that mounts and presents a Sheet with the title and a content box (SwapSelectors.InfoSheetContent). "Min. receive" opens min-receive-info-sheet.tsx ("Minimum receive": "The guaranteed minimum amount you‘ll receive based on your slippage tolerance. If the final amount falls below this, the transaction will automatically revert."); "Slippage" opens slippage-info-sheet.tsx ("Slippage tolerance": "The maximum price change you\'re willing to accept between when you submit and when your swap executes. If the price moves beyond this threshold, the transaction will revert."); "Price impact" opens price-impact-info-sheet.tsx ("Price impact": "The difference between the market price and the price you‘ll receive due to your trade size relative to the available liquidity. Larger trades typically have higher price impact."); "Estimated fees" opens fees-info-sheet.tsx ("Fees": "Network fee" with crypto and fiat amounts and "Paid to network validators to process your transaction", plus "<provider> fee" / "Fee charged by <provider> for facilitating the swap" when the quote has a provider fee, provider names Bitflow, ALEX, Velar or sBTC Bridge). Only the "Estimated fees" row always renders, so its button is the last SwapSelectors.InfoButton; the others depend on the quote as described in swap-review. Dismissing the sheet unmounts it. No flow or spec covers it.',
  },
] as const satisfies readonly MobileFeatureEntry[];
