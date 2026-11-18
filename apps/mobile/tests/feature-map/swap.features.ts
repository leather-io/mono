import { AppRoutes } from '@/shared/app-routes';
import { SharedSelectors } from '@/shared/selectors/shared.selectors';
import { SwapSelectors } from '@/shared/selectors/swap.selectors';

import type { MobileFeatureEntry } from './mobile-feature-entry';

const openSwapFromHomeStep =
  'On the Home tab tap "Swap" in the action buttons (no test id; shown only with swap on); the sheet opens with STX as the base asset';

const openSwapFromTokenStep =
  'On token-details tap "Swap"; the sheet opens with that token as the base asset. On Bitcoin the button renders only with swap_sbtc_bridging on';

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
    preconditions: { session: 'signed-in', network: 'mainnet', mocks: [] },
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
      'The global swap sheet (features/swap/swap-sheet.tsx), mounted in the root layout only when settings hold a currentAccount and swap (useSwapFlag) is on, and presented through swapSheetRef.current?.present({ baseAsset?, targetAsset? }); the Home "Swap" button passes no assets, so the base defaults to STX, and the token-details "Swap" button passes the token (Bitcoin only with swap_sbtc_bridging). The sheet tracks swap_sheet_opened / swap_sheet_dismissed, preloads the account swap assets, wraps the SwapProvider of @leather.io/state/swap with the app dependencies (use-swap-dependencies.ts; it throws without a Stacks signer or a native segwit payer) and switches between a "form" and a "review" screen in local state, with no route. swap-form-screen.tsx shows the "Swap" title with no back element and two panels. The pay card holds the amount field (SwapSelectors.BaseAmountField; the caret takes the asset colour and turns red on error) with the base asset toggle (SwapSelectors.BaseAssetToggle, "Select" when empty) and the balance; its second line is either the error ("Enter an amount", "Invalid amount", "Too many decimals (max N)", "Minimum X", "Maximum X", "Insufficient balance", hidden while the input is effectively zero) or the currency mode switcher (SwapSelectors.CurrencyModeSwitcher, the converted amount with an arrow that toggles crypto and fiat input). The receive card holds the target amount preview (SwapSelectors.TargetAmountPreview, "0" until a quote, pulsing while loading) and the target toggle (SwapSelectors.TargetAssetToggle, disabled until a base asset is set). The flip button (SwapSelectors.FlipButton, "Flip assets") renders only while flipping is allowed. Below, the quote preview shows nothing until an amount and target exist, then a skeleton, "Unable to load the quote" with "Retry", "No quotes available for this swap.", a constraint box ("Amount too small", "Amount too large" or "Deposit cap reached" for the BTC and sBTC bridge limits), or the "Rate" (with a 30 s refetch ring) and "Estimated fees" rows. Presets offer 25 %, 50 %, 75 % and "MAX" above the numpad, and "Review" (SwapSelectors.ReviewButton, disabled until the form can submit) tracks swap_review_initiated and opens swap-review. The toggles open the swap-asset-selector-sheet. Quotes come from the alex-sdk, bitflow-sdk, bitflow-bff-api and sbtc-bridge providers of the swap service. There is no network gate: off mainnet the BTC pairs are excluded and the DEX providers take no network parameter, so a reproduction needs mainnet and a funded account. With swap_sbtc_bridging off, BTC cannot be the base and sBTC to BTC is blocked (use-swap-disabled-pairs.ts). Asset lists, balances, market data and quotes are fetched live.',
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
    preconditions: { session: 'signed-in', network: 'mainnet', mocks: [] },
    selectors: {
      ready: SwapSelectors.AssetSelector,
      others: [SwapSelectors.AssetSelectorItem],
    },
    actions: [],
    specs: [],
    description:
      'The asset picker over swap-form (asset-selector-sheet.tsx, a sheet at 75 % presented while an asset is being selected; it renders asset-selector.tsx, SwapSelectors.AssetSelector, with the base or target assets query). The search header (placeholder "Search for asset", a "Clear search" button, no test id) shows while the query is pending, when there are assets, or while searching. The term is debounced by 200 ms and keeps assets whose display name ("Stacks" for STX, "Bitcoin" for BTC, else the asset name) or symbol, lower-cased, contains the trimmed term; the term itself is not lower-cased, so a term with capitals matches nothing (use-swap-asset-search.ts). Pending shows ten skeleton rows; an error shows "Unable to load assets" with "Retry"; an empty result shows "No assets found" with "Clear search" while searching, "No swaps available" / "<asset> has no available receiving options right now." for a target list with a base set, or "No assets" / "Add funds to your wallet to start\\nswapping between currencies.". Each row (SwapSelectors.AssetSelectorItem + "-" + symbol, for example swapAssetSelectorItem-STX) shows the avatar with a Bitcoin or Stacks indicator, the display name, the available balance and its fiat value; tapping it sets the base or target asset. Rows render only when the live provider lists give the account swap assets.',
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
    preconditions: { session: 'signed-in', network: 'mainnet', mocks: [] },
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
      'The second screen of the swap sheet (swap-review-screen.tsx), titled "Review Swap" with a back button (SharedSelectors.BackButton) and the Android hardware back both returning to swap-form; the back button then also pops the expo-router history under the sheet, because the handler does not prevent the event. A status guard reports to Sentry and exits to the form for idle or constrained estimates. The body is a spinner, "Unable to load swap details" with "Retry", "No quotes available" / "Not enough liquidity or no route available right now. Try a smaller amount or check back later." with "Go back", or the content: the summary (SwapSelectors.ReviewSummary: both avatars, "-<base amount>" and "+<target amount>"), then the details (SwapSelectors.ReviewDetails, dimmed while refetching) with "From" (the account avatar and name, plus the wallet name with more than one wallet), "Rate" with the refetch ring, "Min. receive" when the quote has one, "Slippage" with the percentage toggle (SwapSelectors.SlippageToggle, opens the swap-slippage-sheet) when slippage applies (not for the sBTC deposit), "Price impact" (yellow from 3 %, red from 10 %) only at or above the 3 % warning threshold, and "Estimated fees"; the info buttons (SwapSelectors.InfoButton) open the swap-info-sheets. The footer reads "Make sure everything looks correct.\\nConfirmed transactions cannot be undone." above "Confirm" (SwapSelectors.ConfirmButton, disabled unless the swap can submit and is idle; taps in the first 500 ms are ignored). Confirm submits without any approval sheet: Stacks contract-call quotes (DEX swaps and sBTC withdrawals) are signed with the account Stacks signer and broadcast, and the BTC to sBTC deposit builds the bridge deposit, runs coin selection, signs the PSBT with signTx and broadcasts it. The submission overlay (SwapSelectors.SubmissionOverlay) covers the screen with the summary and a status whose text carries SwapSelectors.SubmissionStatus + "-" + status (swapSubmissionStatus-submitting "Initiating the swap...", -success "Swap initiated", -failure "Failed to start a swap"). Success dismisses the sheet after 1.2 s; failure adds "Swap wasn\'t submitted due to an unexpected error. Please try again, or contact support if it persists." (the "contact support" text opens the support URL) and "Back to review" (SwapSelectors.BackToReviewButton). Reproducing a submission broadcasts a real mainnet transaction from a funded account.',
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
    preconditions: { session: 'signed-in', network: 'mainnet', mocks: [] },
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
      'The "Edit Slippage" sheet (slippage-selector-sheet.tsx), presented by the review "Slippage" toggle: "Price moving against you past this percentage will cancel the swap.", a numeric input between 0.5 % and 10 % (default 3 %, the swap constants of @leather.io/state) with "Decrease slippage" (SwapSelectors.SlippageDecrement), the formatted value (SwapSelectors.SlippageValue, one decimal) and "Increase slippage" (SwapSelectors.SlippageIncrement), stepping 0.1 % per tap and 1 % on long press, and "Update slippage" (SwapSelectors.SlippageUpdateButton), which stores the slippage and dismisses. Dismissing without updating keeps the old value. The row and its toggle render only when the selected quote has slippage applicable (Stacks contract-call quotes, not the sBTC deposit). The "Slippage" info button opens the "Slippage tolerance" text in the swap-info-sheets.',
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
    preconditions: { session: 'signed-in', network: 'mainnet', mocks: [] },
    selectors: {
      ready: SwapSelectors.InfoSheetContent,
      others: [SwapSelectors.InfoButton],
    },
    actions: [],
    specs: [],
    description:
      'Four info sheets on swap-review share info-sheet.tsx: an icon button labelled "Info" (SwapSelectors.InfoButton, the same id on every row, so pick by index or by the row label) that mounts and presents a sheet with the title and a content box (SwapSelectors.InfoSheetContent). "Min. receive" opens "Minimum receive": "The guaranteed minimum amount you‘ll receive based on your slippage tolerance. If the final amount falls below this, the transaction will automatically revert."; "Slippage" opens "Slippage tolerance": "The maximum price change you\'re willing to accept between when you submit and when your swap executes. If the price moves beyond this threshold, the transaction will revert."; "Price impact" opens "Price impact": "The difference between the market price and the price you‘ll receive due to your trade size relative to the available liquidity. Larger trades typically have higher price impact."; "Estimated fees" opens "Fees": "Network fee" with crypto and fiat amounts and "Paid to network validators to process your transaction", plus "<provider> fee" / "Fee charged by <provider> for facilitating the swap" when the quote has a provider fee (Bitflow, ALEX, Velar or sBTC Bridge). Only the "Estimated fees" row always renders, so its button is the last SwapSelectors.InfoButton; the others depend on the quote as swap-review describes. Dismissing the sheet unmounts it.',
  },
] as const satisfies readonly MobileFeatureEntry[];
