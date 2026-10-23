import { SwapRevampSelectors } from '@tests/selectors/swap-revamp.selectors';

import { RouteUrls } from '@shared/route-urls';

import type { ExtensionFeatureEntry } from './extension-feature-entry';

const swapSpec = 'apps/extension/tests/specs/swap/swap-revamp.spec.ts';

const swapParams = [
  { name: 'chain', example: 'stacks' },
  { name: 'base', example: 'STX' },
  { name: 'quote', example: 'aeUSDC' },
] as const;

export const swapFeatures = [
  {
    id: 'swap-form',
    anchor: { kind: 'route' },
    routes: [RouteUrls.Swap],
    params: [...swapParams],
    entry: [
      {
        kind: 'nav',
        steps: ['On home click "Swap" (HomePageSelectors.SwapBtn); it opens /swap/stacks/STX'],
      },
      {
        kind: 'deepLink',
        steps: ['Open #/swap/stacks/STX/aeUSDC; the base and quote segments preselect the assets'],
      },
      {
        kind: 'nav',
        steps: [
          'On a token details page click the "Swap" pill (TokenDetailsSelectors.TokenDetailsSwapButton); it opens the form with that token as the base asset',
        ],
      },
    ],
    gate: 'account',
    flags: [],
    preconditions: {
      session: 'signed-in',
      network: 'mainnet',
      mocks: ['setupMockApis', 'mockUnhandledRequests'],
    },
    selectors: {
      ready: SwapRevampSelectors.FormReady,
      others: [
        SwapRevampSelectors.BaseAssetTrigger,
        SwapRevampSelectors.TargetAssetTrigger,
        SwapRevampSelectors.SelectedAssetSymbol,
        SwapRevampSelectors.AssetList,
        SwapRevampSelectors.AssetItem,
        SwapRevampSelectors.AmountInput,
        SwapRevampSelectors.ContinueBtn,
      ],
    },
    actions: [
      'SwapRevampPage.waitForFormReady',
      'SwapRevampPage.selectBaseAsset',
      'SwapRevampPage.selectTargetAsset',
      'SwapRevampPage.searchAssets',
      'SwapRevampPage.assetItemBySymbol',
      'SwapRevampPage.enterBaseAmount',
    ],
    specs: [swapSpec],
    description:
      'The swap form: base and target asset selectors (each opens a searchable sheet, "Search for asset", whose rows carry a data-symbol attribute; the asset list and its items only render while that sheet is open), an amount field with a currency mode switch, a flip button (only when flipping the pair is allowed) and a live quote preview with rate and estimated fees. It defaults to swapping STX. Swaps need mainnet and a non-policy account with a Stacks key: otherwise SwapContainer redirects to / (swap-container.tsx, use-swap-availability.ts). The home "Swap" button stays visible but disabled with a tooltip ("Swaps are only available on mainnet. Switch networks to swap.", "Swaps require a Stacks account." or "Swaps are not available for this account.", account-actions.tsx); the token-details "Swap" pill is only greyed out, with no tooltip, in those cases and also when that token cannot be a swap base, for example BTC while swapSbtcBridging is off or on a Bitcoin policy token page (token-details-actions.tsx). With the swapSbtcBridging LaunchDarkly flag off, BTC cannot be a swap base, sBTC to BTC is blocked, and a BTC base in the URL falls back to STX (use-swap-disabled-pairs.ts, use-swap-route-assets.ts); without a native segwit payer the Bitcoin exclusion pair rules also apply. The "Swap revamp with sBTC bridging" block of swap-revamp.spec.ts registers overrideLaunchDarklyFlags(page, { swapSbtcBridging: true }) so BTC can be picked as the base and only sBTC is offered as its target. The container also runs the compliance check (useBreakOnNonCompliantEntity(\'swap\')), which throws for a non-compliant address. "Continue" goes to the review route with the same params.',
  },
  {
    id: 'swap-review',
    anchor: { kind: 'route' },
    deepLinkable: false,
    routes: [RouteUrls.SwapReview],
    params: [...swapParams],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On the swap form pick assets and an amount, click "Continue" (SwapRevampSelectors.ContinueBtn)',
        ],
      },
    ],
    gate: 'account',
    flags: [],
    preconditions: {
      session: 'signed-in',
      network: 'mainnet',
      mocks: ['setupMockApis', 'mockUnhandledRequests', 'mockStacksBroadcastTransaction'],
    },
    selectors: {
      ready: SwapRevampSelectors.ReviewSummary,
      others: [SwapRevampSelectors.ConfirmBtn, SwapRevampSelectors.SubmissionStatus],
    },
    actions: [],
    specs: [swapSpec],
    description:
      'Review screen for a swap: the pair summary, rate and estimated fees with a provider tooltip, plus Min. receive, Slippage (editable in a sheet) and Price impact when applicable (a minimum receive amount exists, slippage applies, the impact is at or above PRICE_IMPACT_WARNING_THRESHOLD); an sBTC bridge deposit on a Ledger wallet adds a recovery warning (swap-review.tsx, sbtc-ledger-recovery-warning.tsx). A bare URL has no amount in state, so the estimate is idle and the page goes to the previous page. Empty and error quotes replace the summary with an empty or error state, so swap-revamp-review-summary is absent there, and the "Confirm" button only renders for a successful estimate. Clicks within 500 ms of the screen mounting are ignored (SWAP_ACCIDENTAL_TAP_SUPPRESSION_MS), which is why swap-revamp.spec.ts clicks Confirm with { delay: 600 }; a repro that clicks immediately silently does nothing. Confirming shows a submission overlay (the submission status element only renders from then on) that reads "Initiating the swap..." then "Swap initiated", after which the app navigates to /activity after 1200 ms. A failure reads "Failed to start a swap" with a "Back to review" button; "Swap needs attention" with a "View activity" button means an sBTC bridge deposit whose broadcast or notification outcome is uncertain (use-swap-submission.ts, swap-submission-overlay.tsx).',
  },
] as const satisfies readonly ExtensionFeatureEntry[];
