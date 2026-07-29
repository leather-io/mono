interface ExplainerStep {
  title: string;
  description: string;
  postKey?: string;
}

interface StakingCondition {
  iconKey: 'MagnifyingGlassIcon' | 'SbtcIcon';
  title: string;
  description: string;
}

export const bitcoinStakingContent = {
  pageTitle: `Staking`,
  pageSubtitle: `Stake STX with a pool and earn variable sBTC yield. Leather is not liable for the conduct of third parties.`,
  heroYieldLabel: `Variable yield, paid in sBTC`,
  providerDescription: `Providers are external parties that operate PoX-5 staking pools through their own signer-manager contracts. Leather is not liable for the conduct of third parties.`,
  chooseDuration: {
    inputLabel: `Cycles before renewal (1–96)`,
    renewalPrefix: `Renews ~`,
    exitTitle: `Exit any time`,
    exitDescription: `This isn’t a lock. Unstake whenever you want and your STX unlocks when the current cycle ends. A cycle is about two weeks.`,
  },
  learnMore: {
    label: `Read more about Bitcoin Staking on stacks.co`,
    url: `https://www.stacks.co/bitcoin-staking`,
  },
  scanningPositions: `Looking for positions`,
  yourPosition: {
    title: `Your position`,
    sentence: `Your staked STX and what it is earning. Rewards accrue each cycle and are claimed through the pool's signer-manager contract.`,
  },
  stakingStatus: {
    connectTitle: `Connect Leather to see your staking`,
    connectDescription: `Once connected, this page takes you straight to the pool you are staking with.`,
  },
  cycleStatus: {
    openLabel: `Staking closes in`,
    pausedLabel: `Staking paused · reopens in`,
    explanationTitle: `Staking windows`,
    explanation: `In the last 100 Bitcoin blocks of a cycle the network locks in the signer set. New stakes and changes to an existing stake are rejected during that window, and resume when the next cycle starts.`,
  },
  poolOverviewInfo: {
    rewardsToken: `Rewards accrue as sBTC on Stacks each cycle and are claimed through the pool's signer-manager contract. Yield is variable: it depends on network-wide staking participation and the protocol reward waterfall.`,
    minimumCommitment: `Each pool sets its own minimum. Separately, a pool needs at least 50,000 STX staked in total to earn rewards for a cycle. Small or new pools below that threshold earn nothing until they grow.`,
    fee: `The share of your rewards this pool keeps. Each pool sets its own fee in its signer-manager contract, so check the pool's terms before staking.`,
    nextCycle: `Your stake starts earning when the next cycle begins. A cycle lasts about two weeks.`,
  },
  unlistedPool: {
    label: `Staked with a pool Leather does not list`,
    description: `Your STX is staked and still earning. Managing it here needs a pool Leather knows, so use the tools of whoever operates this signer manager.`,
  },
  dualStackingTransition: {
    title: `Dual Stacking is winding down`,
    description: `It transitions to Bitcoin Staking on August 24, 2026 and keeps paying out until then. Stake your STX with a pool above to keep earning after that date.`,
    linkLabel: `Learn about Bitcoin Staking`,
    url: `https://www.stacks.co/bitcoin-staking`,
  },
  payoutPreference: {
    toggleLabel: `Receive rewards as BTC on Bitcoin (optional)`,
    collapsedHelper: `By default, rewards accrue as sBTC on Stacks and can be claimed anytime.`,
    expandedHelper: `The pool pays rewards as an sBTC-to-BTC withdrawal to this address. The max fee caps what you pay per withdrawal — claims smaller than the max fee cannot be paid out until it is lowered.`,
    updateHelper: `This is your standing payout setting, applied to every future claim. Leave it as is to keep it, edit the address or fee to change it, or untick it to switch future claims back to sBTC.`,
  },
  preparePhase: {
    title: `Staking is briefly paused`,
    description: `The network is preparing the next cycle. Staking actions reopen in about`,
  },
  poolHealthWarning: `This pool currently has under 50,000 STX staked. Pools below this threshold earn nothing for the cycle.`,
  pendingStake: {
    title: `Your stake is confirming`,
    description: `Your staking transaction was submitted and is waiting for confirmation. Your STX locks at the start of the next cycle.`,
  },
  transactionStatus: {
    headerTitle: `Your staking`,
    pendingDescription: `Keep this page open. Confirmation usually takes a few seconds.`,
    byKind: {
      stake: {
        pendingTitle: `Confirming your stake`,
        failedTitle: `Your stake didn't go through`,
        confirmedToast: `Stake confirmed`,
      },
      'stake-update': {
        pendingTitle: `Confirming your update`,
        failedTitle: `Your update didn't go through`,
        confirmedToast: `Stake updated`,
      },
      unstake: {
        pendingTitle: `Confirming your unstake`,
        failedTitle: `Your unstake didn't go through`,
        confirmedToast: `Unstake confirmed`,
      },
      'claim-rewards': {
        pendingTitle: `Claiming your rewards`,
        failedTitle: `Your claim didn't go through`,
        confirmedToast: `Rewards claimed`,
      },
    },
    failureReasons: {
      aborted: `The contract rejected the transaction, so nothing changed and your STX was not moved.`,
      dropped: `The transaction was dropped before it was mined, so nothing changed. You can try again.`,
      'not-found': `We couldn't find this transaction on the network. Check the explorer before trying again.`,
      unknown: `The transaction didn't complete. Check the explorer for details before trying again.`,
    },
    submitErrors: {
      rejected: `The request was cancelled in Leather. Nothing was submitted.`,
      unknown: `Couldn't submit the transaction. Please try again.`,
    },
    viewInExplorer: `View in explorer`,
    dismiss: `Dismiss`,
  },
  needsRestake: {
    title: `Re-stake your STX`,
    description: `PoX-5 replaced the previous stacking protocol and your STX has unlocked. Choose a pool to start earning sBTC rewards.`,
  },
  preActivation: `Bitcoin Staking (PoX-5) is not active on this network yet. You can explore the flow, but transactions will fail until activation.`,
};

export const bitcoinStakingExplainer: ExplainerStep[] = [
  {
    title: `Get STX`,
    postKey: `stacks-token-stx`,
    description: `Hold at least the pool minimum of STX to participate.`,
  },
  {
    title: `Choose a pool`,
    postKey: `stacking-providers`,
    description: `Pick a staking pool from the table below.`,
  },
  {
    title: `Stake STX-only`,
    description: `Stake your STX to the chosen pool.`,
  },
  {
    title: `Claim sBTC rewards`,
    description: `Rewards accrue as sBTC each cycle and are claimed through the pool contract.`,
  },
];

export const bitcoinStakingConditions: StakingCondition[] = [
  {
    iconKey: 'MagnifyingGlassIcon',
    title: `Research your pool`,
    description: `Rewards flow through the pool's signer-manager contract and depend on its policies — research before joining.`,
  },
  {
    iconKey: 'SbtcIcon',
    title: `Rewards accrue as sBTC`,
    description: `Yield is variable and paid in sBTC on Stacks. Rewards are claimed through the pool's contract.`,
  },
];

export const bitcoinStakingLabels = {
  provider: `Provider`,
  rewardsToken: `Rewards token`,
  minimumCommitment: `Minimum commitment`,
  totalStaked: `Total staked`,
  historicalYield: `Historical yield`,
  fee: `Fee`,
  startEarning: `Start earning`,
  viewPosition: `View position`,
};
