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
  pageTitle: `Bitcoin Staking`,
  pageSubtitle: `Stake STX with a pool and earn variable sBTC yield. Leather is not liable for the conduct of third parties.`,
  heroYieldLabel: `Variable yield, paid in sBTC`,
  providerDescription: `Providers are external parties that operate PoX-5 staking pools through their own signer-manager contracts. Leather is not liable for the conduct of third parties.`,
  chooseDuration: {
    helper: `A cycle lasts about two weeks. You can unstake anytime — your STX unlocks at the end of the current cycle.`,
  },
  payoutPreference: {
    toggleLabel: `Receive rewards as BTC on Bitcoin (optional)`,
    collapsedHelper: `By default, rewards accrue as sBTC on Stacks and can be claimed anytime.`,
    expandedHelper: `The pool pays rewards as an sBTC-to-BTC withdrawal to this address. The max fee caps what you pay per withdrawal.`,
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
    title: `Stake STX`,
    description: `Lock your STX with the pool for the number of cycles you choose.`,
  },
  {
    title: `Claim sBTC rewards`,
    description: `Rewards accrue as sBTC each cycle and can be claimed anytime.`,
  },
];

export const bitcoinStakingConditions: StakingCondition[] = [
  {
    iconKey: 'BoxedCatLockedIcon',
    title: `Your STX locks for the cycles you choose`,
    description: `Your exact amount locks at the next cycle. You can unstake anytime, but STX only unlocks at the end of the current cycle.`,
  },
  {
    iconKey: 'MagnifyingGlassIcon',
    title: `Research your pool`,
    description: `Rewards flow through the pool's signer-manager contract and depend on its policies — research before joining.`,
  },
  {
    iconKey: 'StacksIcon',
    title: `Rewards accrue as sBTC`,
    description: `Yield is variable and paid in sBTC on Stacks. Claim it through the pool's contract whenever you like.`,
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
  comingSoon: `Coming soon`,
};
