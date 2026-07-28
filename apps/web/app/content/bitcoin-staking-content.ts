interface ExplainerStep {
  title: string;
  description: string;
  postKey?: string;
}

interface StakingCondition {
  iconKey: 'BoxedCatLockedIcon' | 'MagnifyingGlassIcon' | 'StacksIcon';
  title: string;
  description: string;
}

export const bitcoinStakingContent = {
  pageTitle: `Staking`,
  pageSubtitle: `Stake STX with a pool and earn variable sBTC yield. Leather is not liable for the conduct of third parties.`,
  heroYieldLabel: `Variable yield, paid in sBTC`,
  providerDescription: `Providers are external parties that operate PoX-5 staking pools through their own signer-manager contracts. Leather is not liable for the conduct of third parties.`,
  chooseDuration: {
    helperLead: `A cycle lasts about two weeks. This sets how long before you need to renew, not how long you are committed.`,
    helperEmphasis: `You can unstake at any time`,
    helperTrail: `and your STX unlocks when the current cycle ends.`,
  },
  learnMore: {
    label: `Read more about Bitcoin Staking on stacks.co`,
    url: `https://www.stacks.co/bitcoin-staking`,
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
    iconKey: 'BoxedCatLockedIcon',
    title: `You choose how long before you renew`,
    description: `Your exact amount locks at the next cycle. You can unstake at any time, and your STX unlocks when the current cycle ends.`,
  },
  {
    iconKey: 'MagnifyingGlassIcon',
    title: `Research your pool`,
    description: `Rewards flow through the pool's signer-manager contract and depend on its policies — research before joining.`,
  },
  {
    iconKey: 'StacksIcon',
    title: `Rewards accrue as sBTC`,
    description: `Yield is variable and paid in sBTC on Stacks. Rewards are claimed through the pool's contract.`,
  },
];

export const bitcoinStakingLabels = {
  provider: `Provider`,
  rewardsToken: `Rewards token`,
  minimumCommitment: `Minimum commitment`,
  totalStaked: `Total staked`,
  fee: `Fee`,
  startEarning: `Start earning`,
  viewPosition: `View position`,
};
