interface ExplainerStep {
  title: string;
  description: string;
  postKey?: string;
}

interface StackingCondition {
  iconKey: 'BoxedCatLockedIcon' | 'MagnifyingGlassIcon' | 'StacksIcon';
  title: string;
  description: string;
}

export const stackingContent = {
  providerDescription: `Providers are external parties that offer yield-earning services based on the Proof of Transfer (PoX) protocol. Leather is not liable for the conduct of third parties.`,
  payoutDescription: `The type of reward you'll receive from the pool — either BTC or STX — depending on the provider's configuration.`,
  minimumAmountToStackDescription: `The minimum amount of STX required to participate in this provider's pool. You cannot stack with less than this.`,
  aprDescription: `APR (Annual Percentage Rate) represents the annualized return participants earn on their stacked assets, excluding compounding.`,
  feeDescription: `The fee is a percentage of the rewards you earn from the pool. It is deducted from your rewards before they are distributed to you.`,
  missingIndependentStackingDescription: `We're working hard to integrate independent stacking here. In the meantime, you can use our legacy earn experience.`,
  unpoolingInfo: `After unpooling your previous position remains visible until the current cycle completes.`,
  choosingPoolingDuration: {
    title: 'Indefinite',
    sentence: `The pool commits your STX for Stacking for up to 12 cycles (with about two weeks per cycle). You can revoke anytime, but they stay locked until the pool's commitment ends. Revoke before the pool's next commitment to regain access at the end of the current commitment period.`,
  },
};

export const stackingExplainer: ExplainerStep[] = [
  {
    title: `Get STX`,
    postKey: `stacks-token-stx`,
    description: `Hold at least the minimum required STX to participate.`,
  },
  {
    title: `Choose a provider`,
    postKey: `stacking-providers`,
    description: `Pick a pool provider from the table below.`,
  },
  {
    title: `Delegate STX`,
    postKey: `pooled-stacking-delegation`,
    description: `Delegate your STX into the chosen pool for locking.`,
  },
  {
    title: `Rewards token`,
    postKey: `stacking-rewards-tokens`,
    description: `Receive regular rewards without lifting a finger.`,
  },
];

export const liquidStackingExplainer: ExplainerStep[] = [
  {
    title: `Get STX`,
    postKey: `stacks-token-stx`,
    description: `Hold STX in your wallet, ready to swap.`,
  },
  {
    title: `Choose a provider`,
    postKey: `stacking-providers`,
    description: `Pick a provider from the table below.`,
  },
  {
    title: `Convert STX`,
    postKey: `stacking-liquid-token`,
    description: `Swap your STX to receive a liquid Stacking token.`,
  },
  {
    title: `Begin earning`,
    postKey: `stacking-rewards`,
    description: `Use your liquid Stacking token in DeFi and swap back anytime while earning.`,
  },
];

export const stackingConditions: StackingCondition[] = [
  {
    iconKey: 'BoxedCatLockedIcon',
    title: "This transaction can't be reversed",
    description: `Your STX will stay locked for the full duration of the pool's commitment.`,
  },
  {
    iconKey: 'MagnifyingGlassIcon',
    title: 'Research your pool',
    description: `Reward payouts depend on the pool's policies—research before joining.`,
  },
  {
    iconKey: 'StacksIcon',
    title: "Stacking with the pool's contract",
    description: `The pool's smart contract manages Stacking and using it means agreeing to its terms.`,
  },
];

export const liquidStackingConditions: StackingCondition[] = [
  {
    iconKey: 'BoxedCatLockedIcon',
    title: "This transaction can't be reversed",
    description: `You are converting STX to the Stacking token of your chosen provider. You may or may not be able to convert back to STX later depending on the provider.`,
  },
  {
    iconKey: 'MagnifyingGlassIcon',
    title: 'Research your protocol',
    description: `Accumulating the value of rewards is at the discretion of the protocol. Make sure you've researched and trust the protocol you're using.`,
  },
  {
    iconKey: 'StacksIcon',
    title: 'Stacking with the Protocol Contract',
    description: `The protocol uses a smart contract that handles your Stacking. By allowing the contract to call Stacking functions, you agree to the rules of the protocol's contract.`,
  },
];

export const stackingLabels = {
  provider: 'Provider',
  rewardsToken: 'Rewards token',
  minimumCommitment: 'Minimum commitment',
  historicalYield: 'Historical yield',
  fee: 'Fee',
  startEarning: 'Start earning',
};
