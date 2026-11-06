import { BitcoinStakingSelectors } from '@tests/selectors/bitcoin-staking.selectors';
import { ConnectSelectors } from '@tests/selectors/connect.selectors';
import { RouteUrls } from '~/route-urls';

import type { WebFeatureEntry } from './web-feature-entry';

const bitcoinStakingSpec = 'apps/web/tests/bitcoin-staking.spec.ts';
const modeFixtureSpec = 'apps/web/tests/mode-fixture.spec.ts';
const mockMode = ['successHandlers'] as const;

export const stakingFeatures = [
  {
    id: 'staking-overview',
    anchor: { kind: 'route' },
    routes: [RouteUrls.Staking],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: ['Click "Staking" in the left navigation (nav.tsx), or open / which redirects here'],
      },
      { kind: 'deepLink', steps: ['Open /staking'] },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'mock-connected', network: 'mainnet', mocks: [...mockMode] },
    selectors: {
      ready: BitcoinStakingSelectors.StakingProviderTable,
      others: [
        BitcoinStakingSelectors.StartStakingButton,
        BitcoinStakingSelectors.SwitchPoolButton,
        BitcoinStakingSelectors.ByosmEntryLink,
        BitcoinStakingSelectors.PoolTvl,
        BitcoinStakingSelectors.PoolTvlUsd,
        BitcoinStakingSelectors.PoolFeeSource,
        BitcoinStakingSelectors.StakingScanIndicator,
        BitcoinStakingSelectors.StakingUserPosition,
        BitcoinStakingSelectors.StakingPositionClaimRewards,
        BitcoinStakingSelectors.NeedsRestakeBanner,
        BitcoinStakingSelectors.PendingStakePanel,
        BitcoinStakingSelectors.StakingPoolAvatarFallback,
        BitcoinStakingSelectors.LiquidStartEarning,
        BitcoinStakingSelectors.BondPoolAccess,
        BitcoinStakingSelectors.DirectBondEntryLink,
        BitcoinStakingSelectors.DualStackingTransitionLink,
      ],
    },
    actions: [],
    specs: [bitcoinStakingSpec, modeFixtureSpec],
    description:
      'The Bitcoin Staking landing page (pages/bitcoin-staking/staking.route.tsx renders Staking inside StackingClientProvider; meta title "Bitcoin Staking – Leather"; the bitcoin-staking.layout.tsx parent only mounts the Pox5TxTrackerProvider). Page.Header "Staking" carries the StakingScanIndicator ("Looking for positions", staking-scan-indicator) while a connected account\'s position loads. StakingTopSection shows the discovery intro (heading "Earn Bitcoin yield with your STX", the pageSubtitle, the liability paragraph and an ApyRewardHeroCard "Variable yield, paid in sBTC") unless a connected account has a position or needs to re-stake, in which case "Your position" replaces it with StakingUserPosition: needs-restake-banner ("Re-stake your STX") when usePox5NeedsRestake is true and there is no position, pending-stake-panel ("Your stake is confirming") while a stake transaction is in the mempool, or the staking-user-position row ("Your staked position · <pool>", or the signer-manager address for an unlisted pool, the locked amount, a ghost "Claim rewards" button (staking-position-claim-rewards) only while claimable rewards exist, and "View position" going to /staking/pool/<slug>/active or /staking/pool/byosm/active?contract=…). Below it "Stacks staking pools" lists the pools whose signer-manager contract is known on the pinned chain (bitcoinStakingPoolList filtered by isPoolAvailableOnNetwork: Fast Pool, PlanBetter, Asymmetric Research, Xverse, Stacking DAO, SenseiNode on mainnet) in staking-provider-table with Provider, Rewards token, TVL (pool-tvl-<slug> and pool-tvl-<slug>-usd, the sum over the pool\'s signer managers), Fee (pool-fee-source caption "<pool> policy" only for PlanBetter) and a StartStakingButton: busy before mount, "Start earning" opening the install dialog with no wallet, "Start earning" that connects then navigates to /staking/pool/<slug> when a wallet is detected, and once connected either "Start earning" (start-staking-button-<slug>), "View position" for the pool the account is in, or an outline "Switch" (switch-pool-button-<slug>) linking to /staking/pool/<current>/update?to=<slug>; clicking the row navigates to the same pool page. The table footer link "Bring your own signer manager" (byosm-entry-link) goes to /staking/pool/byosm. Then the "Liquid Staking" table (external "Start earning" buttons liquid-start-earning-<slug>; LISA is filtered out), "Bitcoin staking pools" (BondPoolTable: bond-pool-<access>-<slug> buttons "Deposit", "Join waitlist" or a disabled "Closed for this bond" during the prepare phase, all external, and direct-bond-entry-link "Staking a larger amount? Request institutional access"), the DualStackingTransition card (dual-stacking-transition-link "Learn about Bitcoin Staking"), "Frequently asked questions" and "Read more about Bitcoin Staking on stacks.co". In start-staking-button, switch-pool-button and pool-tvl the [slug] placeholder takes the stakingPoolSlugMap slugs (stacking-dao, fast-pool, xverse-pool, planbetter, asymmetric-research, sensei-node, restake, special, byosm); liquid-start-earning-[slug] takes the liquid provider slug (stacking-dao) and bond-pool-[access]-[slug] the bond pool slug (esbee-dao-bond-pool, stacking-dao-bond-pool). In mock mode pox5MockOverrideHandlers read localStorage flags set by the spec: leather-mock-stx-balance (balance), leather-mock-pox5-staked (a 40 STX position with Stacking DAO), leather-mock-pox5-staked-custom (the same position through the custom byosm-custom-signer-manager contract), leather-mock-pox5-delegated-low (10,000 STX per signer manager instead of 75,000) and leather-mock-burn-height; the spec asserts the Xverse TVL "225,000 STX" / "$180,724.35" and Stacking DAO "1,050,000 STX". Every mode() call of the fixture asserts this page\'s header button for the requested mode; mode-fixture.spec.ts exercises uninstalled and mock-installed.',
  },
  {
    id: 'staking-status',
    anchor: { kind: 'route' },
    routes: [RouteUrls.StakingStatus],
    params: [],
    entry: [
      {
        kind: 'deepLink',
        steps: [
          'Open /staking/status (a support link; nothing in the app navigates here); with a connected account it redirects to the active position or back to /staking',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'mock-connected', network: 'mainnet', mocks: [...mockMode] },
    selectors: { others: [] },
    actions: [],
    specs: [bitcoinStakingSpec],
    description:
      'A pool-agnostic resolver (pages/bitcoin-staking/staking-status.route.tsx) with Page.Header "Your staking" and a back arrow to /staking. Client-only (WhenClient): without a connected STX account it shows "Connect Leather to see your staking" and "Once connected, this page takes you straight to the pool you are staking with."; while usePox5Position loads it shows a spinner; an active position in a listed pool navigates (replace) to /staking/pool/<slug>/active, one through an unlisted signer manager to /staking/pool/byosm/active?contract=<id>, and anything else (no position, or a pending stake) navigates back to /staking. The spec covers the Stacking DAO redirect (leather-mock-pox5-staked), the byosm redirect (leather-mock-pox5-staked-custom) and the fallback to the overview. No test id of its own.',
  },
  {
    id: 'staking-pool-form',
    anchor: { kind: 'route' },
    routes: [RouteUrls.StakingPool],
    params: [{ name: 'slug', example: 'stacking-dao' }],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On /staking click "Start earning" (start-staking-button-<slug>) or the row of a pool while connected with no position',
        ],
      },
      {
        kind: 'deepLink',
        steps: [
          'Open /staking/pool/stacking-dao in mock-connected mode with leather-mock-stx-balance set so the amount validates',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'mock-connected', network: 'mainnet', mocks: [...mockMode] },
    selectors: {
      ready: BitcoinStakingSelectors.ConfirmationStakeButton,
      others: [
        BitcoinStakingSelectors.StakingAcknowledgmentCheckbox,
        BitcoinStakingSelectors.PoolTotalStaked,
        BitcoinStakingSelectors.CycleStatusOpen,
        BitcoinStakingSelectors.CycleStatusPaused,
        BitcoinStakingSelectors.PoolHealthWarning,
        BitcoinStakingSelectors.PoolMinStake,
        BitcoinStakingSelectors.PoolFeeSource,
        BitcoinStakingSelectors.PayoutOption,
        BitcoinStakingSelectors.BtcOnlyPayout,
        BitcoinStakingSelectors.PreparePhaseCallout,
        BitcoinStakingSelectors.PendingStakePanel,
        BitcoinStakingSelectors.Pox5SubmitError,
        ConnectSelectors.MockWalletResolveButton,
      ],
    },
    actions: [],
    specs: [bitcoinStakingSpec],
    description:
      'The start-staking form for a listed pool (pages/bitcoin-staking/pool/pool-staking.route.tsx). The loader parses :slug with stakingPoolSlugSchema and throws a 404 data response "Pool not found: <slug>" otherwise (rendered by the root ErrorBoundary). Page.Header "Stake with a pool" with a back arrow to /staking. StartStaking renders the text "You need to connect Leather" without a connected STX account or stacking client; then a spinner while the position loads; an active position navigates (replace) to /staking/pool/<slug>/active; a pending stake shows pending-stake-panel; a pool with no signer manager on the pinned chain shows "<pool> is not available on this network yet.". Otherwise: StakingPoolOverview (pool name and description, Rewards token, Fee via PoolFeeValue, Total staked in pool-total-staked, Next cycle with a CycleStatusLine carrying cycle-status-open or cycle-status-paused), pool-health-warning when the pool holds under 50,000 STX, and the form: Amount ("Amount of STX to stake" input, "Available balance:" with a clickable max that leaves 0.5 STX for fees, pool-min-stake note for PlanBetter), Duration ("Staking duration (1–96 cycles)", default 48, "Scheduled end ~<date>" overlay and the "Unstake early" note), Rewards payout (radiogroup "Rewards payout" with payout-option-sbtc, tagged "Recommended", and payout-option-btc, disabled for sBTC-only pools; picking BTC adds "BTC address", "Max withdrawal fee (sats)" defaulting to 1,000 and "Minimum claim (sats)" defaulting to 10,000 when the signer manager supports it; PlanBetter instead renders btc-only-payout with the required "BTC payout address"; the payout-address-changed warning exists only on the update form, where the registered address is known), Details (Signer manager and Contract addresses), Staking conditions, and below the lg breakpoint a "Review" button that opens the StartStackingDrawer. The confirmation steps (staking-confirmation-steps entry) sit in the sticky side panel: prepare-phase-callout ("Staking is briefly paused") when the cycle clock is in the prepare phase, the acknowledgment checkbox, and "Confirm and start staking" (confirmation-stake-button), disabled while submitting, in the prepare phase or while the balance loads; pressing it without the checkbox shakes the button and shows "Check the box above to continue.". Validation copy the spec asserts: "You cannot stake more than your available balance", "You must stack an amount", "Choose between 1 and 96 cycles". Submitting calls createStakeMutationOptions → wallet.stxCallContract, which in mock mode opens the mock wallet dialog: "Resolve" returns a txid and track({ kind: "stake" }) swaps the layout for the tx status screen; "Reject" renders pox5-submit-error and stays on the form; in mock mode its copy is the generic "Couldn\'t submit the transaction. Please try again." because the mock error carries no RPC code, while a real wallet rejection shows "The request was cancelled in Leather. Nothing was submitted.". The spec sets leather-mock-stx-balance to 1,000,000 STX, leather-mock-burn-height 907460 for the prepare phase (callout visible, confirm disabled), leather-mock-pox5-delegated-low for the Xverse health warning and leather-mock-pox5-tx-status to drive the outcome.',
  },
  {
    id: 'staking-byosm',
    anchor: { kind: 'route' },
    routes: [RouteUrls.StakingByosm],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On /staking click "Bring your own signer manager" (byosm-entry-link) under the pools table',
          'Enter a contract principal and press "Continue"; the form writes ?contract=<id> and the page validates it',
        ],
      },
      {
        kind: 'deepLink',
        steps: [
          'Open /staking/pool/byosm, or /staking/pool/byosm?contract=<address.contract-name> to skip the entry form',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'mock-connected', network: 'mainnet', mocks: [...mockMode] },
    selectors: {
      ready: BitcoinStakingSelectors.ByosmContractInput,
      others: [
        BitcoinStakingSelectors.ByosmContractContinue,
        BitcoinStakingSelectors.ConfirmationStakeButton,
        BitcoinStakingSelectors.StakingAcknowledgmentCheckbox,
      ],
    },
    actions: [],
    specs: [bitcoinStakingSpec],
    description:
      'Stake through any PoX-5 signer manager (pages/bitcoin-staking/pool/byosm-staking.route.tsx; this literal route sits before /staking/pool/:slug). Page.Header "Stake with a pool" with a back arrow to /staking; client-only. ByosmStaking first redirects an active position to its active page (listed pool slug, or byosm with ?contract=), then reads the ?contract search param through useByosmSignerManager: missing or malformed → ByosmContractEntry; a contract that belongs to a listed pool → navigate (replace) to that pool\'s /staking/pool/<slug>; valid → the same StartStaking form as the pool page with poolSlug "byosm", whose active destination is /staking/pool/byosm/active?contract=<id>. ByosmContractEntry shows the heading "Bring your own signer manager", the description, the "Signer manager contract" input (byosm-contract-input, prefilled from ?contract) and the "Continue" submit button (byosm-contract-continue), which reads "Checking contract…" and is disabled while the validation query runs. Errors render under the input: "Enter a contract principal in address.contract-name format.", "This address belongs to a different network.", "No contract found at this address. Check the address and try again.", "This contract does not implement the standard signer-manager interface.", "This contract is not registered as a PoX-5 signer manager." and "We couldn\'t check this contract right now. Try again." (resubmitting the same id retries). The ready selector only renders on the entry form; with a valid contract the confirm button is the readiness signal. The spec validates SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.byosm-custom-signer-manager (mockCustomSignerManagerContractId, answered by the pox5-custom-signer-manager mocks), stakes through it with leather-mock-pox5-staked-custom, rejects "not-a-contract" and redirects the Stacking DAO native-pool-signer-manager to /staking/pool/stacking-dao both from the form and from the deep link.',
  },
  {
    id: 'staking-pool-active',
    anchor: { kind: 'route' },
    routes: [RouteUrls.StakingPoolActive],
    params: [{ name: 'slug', example: 'stacking-dao' }],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Open /staking/pool/<slug> with an active position in that pool, or /staking/status, or click "View position" on /staking; all three navigate here',
          'A full-page load of this URL works (StakingActiveInfo waits for hydration before checking the connection); the spec nevertheless approaches it through /staking/pool/<slug> and waits for the redirect to /active',
        ],
      },
      {
        kind: 'deepLink',
        steps: [
          'Open /staking/pool/stacking-dao/active in mock-connected mode with leather-mock-pox5-staked set',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'mock-connected', network: 'mainnet', mocks: [...mockMode] },
    selectors: {
      ready: BitcoinStakingSelectors.UnstakeButton,
      others: [
        BitcoinStakingSelectors.UpdateStakeButton,
        BitcoinStakingSelectors.ClaimableRewardsCard,
        BitcoinStakingSelectors.ClaimRewardsButton,
        BitcoinStakingSelectors.ToggleRewardsHistory,
        BitcoinStakingSelectors.RewardsHistory,
        BitcoinStakingSelectors.OperatorPayoutCard,
        BitcoinStakingSelectors.OperatorPayoutLink,
        BitcoinStakingSelectors.OperatorPayoutAddress,
        BitcoinStakingSelectors.ActivePoolTvl,
        BitcoinStakingSelectors.ActivePoolTvlUsd,
        BitcoinStakingSelectors.PreparePhaseCallout,
        BitcoinStakingSelectors.PendingStakePanel,
        BitcoinStakingSelectors.Pox5SubmitError,
        ConnectSelectors.MockWalletResolveButton,
      ],
    },
    actions: [],
    specs: [bitcoinStakingSpec],
    description:
      'The active position page (pages/bitcoin-staking/pool/pool-staking-active.route.tsx; the loader 404s on an unknown slug). Page.Header "Your staking" with a back arrow to /staking. StakingActiveInfo shows a spinner until hydrated, navigates (replace) to /staking without a connected STX account, shows a spinner while the position loads, navigates to /staking/pool/<slug> (keeping the search) when there is no position, shows pending-stake-panel for a pending stake, and navigates to the right pool\'s active page when the position belongs to another signer manager. Then: prepare-phase-callout during the prepare phase; for PlanBetter an operator-payout-card ("Rewards payout", "Native BTC, paid by PlanBetter", the operator-payout-link "Visit PlanBetter" and the registered operator-payout-address), for every other pool a claimable-rewards-card ("Claimable rewards" with the total sBTC earned, "Show history"/"Hide history" (toggle-rewards-history) revealing the per-cycle rewards-history list, and "Claim rewards" (claim-rewards-button) disabled while loading, pending or without an unclaimed cycle; a claim submits the oldest unclaimed cycle through wallet.stxCallContract and tracks it with no destination, so the tx status screen returns here and toasts "Rewards claimed"); and the StakingPositionGrid with Pool, Status "Active", Amount locked, "Locked until" (end cycle and ~date), First reward cycle, Days until next cycle, Rewards token, Signer manager, Rewards payout and TVL (active-pool-tvl, active-pool-tvl-usd) plus the action buttons: "Unstake" (unstake-button) arms on the first click, reads "Confirm unstake" and submits on the second (destination /staking), and "Update stake" (update-stake-button) navigates to /staking/pool/<slug>/update; both are disabled in the prepare phase, and pox5-submit-error renders under them on failure. The byosm slug is valid here with ?contract=<id>. The spec reaches it after staking, with leather-mock-pox5-staked (asserting "1,050,000 STX" and "$843,380.30"), with leather-mock-pox5-staked-custom (byosm/active) and through the claim flow.',
  },
  {
    id: 'staking-pool-update',
    anchor: { kind: 'route' },
    routes: [RouteUrls.StakingPoolUpdate],
    params: [{ name: 'slug', example: 'stacking-dao' }],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On /staking/pool/<slug>/active click "Update stake" (update-stake-button), or on /staking click "Switch" (switch-pool-button-<target>) which opens this page with ?to=<target-slug> preselected',
        ],
      },
      {
        kind: 'deepLink',
        steps: [
          'Open /staking/pool/stacking-dao/update in mock-connected mode with leather-mock-pox5-staked set',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'mock-connected', network: 'mainnet', mocks: [...mockMode] },
    selectors: {
      ready: BitcoinStakingSelectors.ConfirmUpdateStakeButton,
      others: [
        BitcoinStakingSelectors.SignerManagerOption,
        BitcoinStakingSelectors.CustomSignerManagerInput,
        BitcoinStakingSelectors.CustomSignerManagerValidate,
        BitcoinStakingSelectors.PayoutOption,
        BitcoinStakingSelectors.PayoutAddressChanged,
        BitcoinStakingSelectors.StakingAcknowledgmentCheckbox,
        BitcoinStakingSelectors.PreparePhaseCallout,
        BitcoinStakingSelectors.Pox5SubmitError,
      ],
    },
    actions: [],
    specs: [],
    description:
      'The stake-update form (pages/bitcoin-staking/pool/pool-staking-update.route.tsx; the loader 404s on an unknown slug). Page.Header "Update staking" with a back arrow to /staking/pool/<slug>/active. UpdateStaking shows a spinner until hydrated and the text "You need to connect Leather" without an STX account; UpdateStakingLayout navigates (replace) to /staking/pool/<slug> when there is no active position and to the position\'s own update route when the slug does not match (adding ?contract= for a custom signer manager), and while the stored payout preference loads shows a spinner, or on error "We couldn\'t load your current payout preference, which is needed before your stake can be updated." with "Try again". The form: heading "Update stake", "You currently have <amount> locked with <pool>. Extend the lock, add more STX, or switch pools — changes take effect from the next cycle.", prepare-phase-callout when paused, "Cycles to extend" (with "Locked for N more cycles — extendable by up to M."), "Additional STX to lock (optional)" with the available balance row, the "Signer manager" radiogroup (signer-manager-option-<providerId> rows, the current one badged "Current", plus a custom row that expands custom-signer-manager-input and the "Validate contract" button custom-signer-manager-validate, reading "Validating…" then "Contract valid"), the "Rewards payout" options (for PlanBetter the required "BTC payout address" with the payout-address-changed warning when it differs from the registered address) and the sidebar "Summary" card (diff rows for what changes, the unchanged amount and scheduled-end rows when switching and an always-present "Effective" row), with the StakingAcknowledgment only when a different signer manager is selected and the confirm button confirm-update-stake-button labelled "Confirm update", "Confirm switch" or "Validate contract first"; it is disabled in the prepare phase or while a custom contract is not yet valid. parseSwitchTargetSlug honours ?to= only for a listed pool other than the current one. Submitting builds a stake-update transaction (createStakeUpdateMutationOptions), tracks it as kind "stake-update" and sends the user to the target pool\'s active page once confirmed. No spec covers this screen.',
  },
  {
    id: 'staking-tx-status',
    anchor: {
      kind: 'selectors',
      objects: [
        'BitcoinStakingSelectors.Pox5TxStatusScreen',
        'BitcoinStakingSelectors.Pox5TxStatusFailed',
      ],
    },
    routes: [],
    startRoute: RouteUrls.StakingPool,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Confirm a stake on /staking/pool/<slug> (or an update, unstake or claim on the active page) and press "Resolve" in the mock wallet dialog',
          'The tracker replaces the staking route content with the status screen without changing the URL; it polls the transaction until it confirms or fails',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'mock-connected', network: 'mainnet', mocks: [...mockMode] },
    selectors: {
      ready: BitcoinStakingSelectors.Pox5TxStatusScreen,
      others: [
        BitcoinStakingSelectors.Pox5TxStatusFailed,
        BitcoinStakingSelectors.Pox5TxDismissButton,
        BitcoinStakingSelectors.Pox5TxExplorerLink,
      ],
    },
    actions: [],
    specs: [bitcoinStakingSpec],
    description:
      'Pox5TxTrackerProvider (features/bitcoin-staking/components/pox5-tx-tracker-provider.tsx, mounted by bitcoin-staking.layout.tsx around every /staking route) renders Pox5TxStatusScreen instead of the route content whenever a transaction is tracked. The pending view has Page.Header "Your staking", a spinner, "Confirming your stake" (or "Confirming your update", "Confirming your unstake", "Claiming your rewards"), "Keep this page open. Confirmation usually takes a few seconds." and a "View in explorer" ghost button (pox5-tx-explorer-link). usePox5TransactionQuery polls GET /extended/v3/transactions/<txid> every 3 seconds; "success" invalidates the pox-5 queries, toasts "Stake confirmed", "Stake updated", "Unstake confirmed" or "Rewards claimed", navigates (replace) to the tracked destination when there is one and clears the tracker. abort_by_response or abort_by_post_condition, a dropped_* status, 120 seconds without the transaction appearing, or any other status renders pox5-tx-status-failed with "Your stake didn\'t go through" (per kind), the reason ("The contract rejected the transaction, so nothing changed and your STX was not moved.", the dropped, not-found or unknown copy), "Dismiss" (pox5-tx-dismiss-button) which clears the tracker and returns to the form, the explorer link, and a header back arrow that also clears. In mock mode the status comes from localStorage leather-mock-pox5-tx-status ("pending", "success", "abort_by_post_condition", "not-found" for a 404; default "success"); the spec flips it from pending to success mid-flight and asserts the dismiss path for abort_by_post_condition. The test ids sit on the body Flex of each view, not on the Page.',
  },
  {
    id: 'staking-confirmation-steps',
    anchor: {
      kind: 'selectors',
      objects: [
        'BitcoinStakingSelectors.StakingAcknowledgmentCheckbox',
        'BitcoinStakingSelectors.ConfirmationStakeButton',
      ],
    },
    routes: [],
    startRoute: RouteUrls.StakingPool,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Open /staking/pool/<slug> or a valid /staking/pool/byosm?contract= form; at the lg breakpoint and above the steps render in the sticky panel beside the form, below it press "Review" to open them in a bottom drawer',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'mock-connected', network: 'mainnet', mocks: [...mockMode] },
    selectors: {
      ready: BitcoinStakingSelectors.ConfirmationStakeButton,
      others: [
        BitcoinStakingSelectors.StakingAcknowledgmentCheckbox,
        BitcoinStakingSelectors.PreparePhaseCallout,
        BitcoinStakingSelectors.Pox5SubmitError,
      ],
    },
    actions: [],
    specs: [bitcoinStakingSpec],
    description:
      'StakingConfirmationSteps (features/bitcoin-staking/start-staking/components/staking-confirmation-steps.tsx) is the review block the start-staking form renders twice: inside the StackingFormStepsPanel (display none below lg) and inside the StartStackingDrawer opened by the form\'s "Review" button (display block below lg only), so on the Desktop Chrome project the panel copy is the visible one. It shows "You\'ll stake" with the amount ("—" until a number is typed), "<N> cycles · scheduled end ~<date>", the StakingAcknowledgment block ("When STX unlocks" and its description, "How rewards reach you" with the pool-specific copy from bitcoinStakingContent.acknowledgment: contractPayout, selfClaimPayout for Stacking DAO, operatorPayout for PlanBetter or customPayout for byosm) with the checkbox (staking-acknowledgment-checkbox) labelled "I understand the lock and payout details above. Rewards aren\'t guaranteed, and Leather doesn\'t hold my funds or pay my rewards." and the "Leather terms" link, then "Confirm and start staking" (confirmation-stake-button). useStakingAcknowledgment keys the accepted state on a JSON snapshot of the account, pool, network, cycle and form values, so changing any of them unticks the box; requireAccepted() on an unticked box increments the attempt count (the button shakes) and shows "Check the box above to continue." in the StakingConfirmMessage. The update form reuses StakingAcknowledgment inside its SidebarSummaryCard only when switching signer managers. The playground area /playground/staking-acknowledgment renders the same block with sample data.',
  },
] as const satisfies readonly WebFeatureEntry[];
