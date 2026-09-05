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
    closingSoonLabel: `Closing soon`,
    closingWithinHourLabel: `Closing within the hour`,
    pausedLabel: `Staking paused · reopens in`,
    pausedWithinHourLabel: `Staking paused · reopens within the hour`,
    explanationTitle: `Staking windows`,
    explanation: `In the last 100 Bitcoin blocks of a cycle the network locks in the signer set. New stakes and changes to an existing stake are rejected during that window, and resume when the next cycle starts.`,
  },
  poolFeeChange: {
    fromCycle(cycle: number) {
      return `From cycle ${cycle}`;
    },
  },
  selfClaim: {
    explanation: `This pool takes no cut from your rewards. In exchange it never claims for you: rewards accrue each cycle and only you can claim them, through the pool's signer-manager contract.`,
  },
  poolOverviewInfo: {
    rewardsToken: `Rewards accrue as sBTC on Stacks each cycle and are claimed through the pool's signer-manager contract. Yield is variable: it depends on network-wide staking participation and the protocol reward waterfall.`,
    fee: `The share of your rewards this pool keeps. Each pool sets its own fee in its signer-manager contract, so check the pool's terms before staking.`,
    totalStaked: `The STX delegated to this pool for the current cycle, summed across all of the pool's signer-manager contracts. Pools need at least 50,000 STX staked to earn rewards for a cycle.`,
    nextCycle: `Your stake starts earning when the next cycle begins. A cycle lasts about two weeks.`,
  },
  byosm: {
    entryTitle: `Bring your own signer manager`,
    entryDescription: `Stake through any signer-manager contract that implements the standard interface. Leather checks the contract exists and is registered with PoX-5, but cannot vouch for its operator — verify who runs it before staking.`,
    inputLabel: `Signer manager contract`,
    continueLabel: `Continue`,
    checkingLabel: `Checking contract…`,
    errors: {
      invalidFormat: `Enter a contract principal in address.contract-name format.`,
      wrongNetwork: `This address belongs to a different network.`,
      notFound: `No contract found at this address. Check the address and try again.`,
      missingFunctions: `This contract does not implement the standard signer-manager interface.`,
      notRegistered: `This contract is not registered as a PoX-5 signer manager.`,
      checkFailed: `We couldn't check this contract right now. Try again.`,
    },
  },
  bondPools: {
    title: `Bitcoin staking pools`,
    sentence: `Operators pool participants into a Bitcoin bond. These lock BTC paired with STX, unlike the STX-only pools above.`,
    learnMoreUrl: `https://www.stacks.co/bitcoin-staking`,
    providerInfo: `The operator running the pool. Leather does not operate these pools and cannot stake into them for you, so joining one hands you off to the operator's own app and contract.`,
    providerInfoUrl: `https://www.stacks.co/bitcoin-staking`,
    rewardsInfo: `Bond rewards accrue as sBTC. Who receives them, and whether native BTC or a liquid token reaches you instead, is decided by the operator's contract rather than by pox-5.`,
    rewardsInfoUrl: `https://docs.stacks.co/pox-5/glossary`,
    capacityInfo: `The share of a bond's community allocation this operator holds. Roughly 10% of each bond's paired capacity is reserved for pools, and the figure is confirmed when the bond is created on-chain.`,
    capacityInfoUrl: `https://docs.stacks.co/pox-5/glossary`,
    feeInfo: `The cut the operator keeps from your rewards. Each operator sets its own fee in its pool contract, so check the terms before joining.`,
    // Neither operator has a bond product page yet, and stacks.co routes retail
    // to a waitlist rather than a live pool. Matching that keeps this page from
    // being the only surface implying a bond pool can be joined today.
    waitlist: {
      label: `Join waitlist`,
      url: `https://www.stacks.co/bitcoin-staking`,
      info: `Pooled access opens when a bond does, and each operator announces its own allocation. Registering on the official Bitcoin staking page is the way to be told when this pool is live.`,
    },
    // Cold inbound for large holders. The pools above are capacity-bound, so
    // anyone past that size needs the Endowment's whitelist, which this page's
    // form feeds by way of the institutional onboarding team.
    directBond: {
      label: `Staking a larger amount? Request institutional access`,
      url: `https://www.stacks.co/institutional-bitcoin-staking`,
    },
  },
  dualStackingTransition: {
    title: `Dual Stacking is winding down`,
    description: `It transitions to Bitcoin Staking on August 24, 2026 and keeps paying out until then. Stake your STX with a pool above to keep earning after that date.`,
    linkLabel: `Learn about Bitcoin Staking`,
    url: `https://www.stacks.co/bitcoin-staking`,
  },
  payoutPreference: {
    sbtcLabel: `sBTC`,
    sbtcTag: `Recommended`,
    btcLabel: `BTC`,
    sbtcHelper: `Paid to your wallet once a cycle concludes — your pool usually claims for you.`,
    btcHelper: `Withdrawn from sBTC to your Bitcoin address, which costs a network fee.`,
    sbtcOnlyHelper: `This pool pays out in sBTC only, once a cycle concludes.`,
    maxFeeNote: `Taken out of each payout to pay for the Bitcoin transaction. Rewards can't be paid out until they've grown past it, so a higher max fee means fewer, bigger payouts.`,
    minClaimNote(smallestValidSats: string | null) {
      const base = `Optional. Below this amount only you can trigger a payout, so nobody else can spend your max fee on a trivial payout.`;
      if (!smallestValidSats) return base;
      return `${base} At least ${smallestValidSats} sats with your current max fee.`;
    },
    updateHelper: `This setting applies to every future claim.`,
    loadError: `We couldn't load your current payout preference, which is needed before your stake can be updated.`,
  },
  switchSignerManager: {
    sectionLabel: `Signer manager`,
    helper: `Picking a different pool moves your whole position at the start of the next cycle. You'll accept the new pool's terms before confirming.`,
    customOptionName: `Custom signer manager`,
    customOptionNameWhenCurrentCustom: `Different custom contract`,
    customOptionMeta: `Enter a contract address`,
    inputPlaceholder: `Enter a contract address`,
    validateLabel: `Validate contract`,
    validatingLabel: `Validating…`,
    contractValidLabel: `Contract valid`,
    poolTerms(poolName: string) {
      return `I have read and accepted ${poolName}'s terms and conditions`;
    },
    customAcknowledgment: `I understand this is a custom signer-manager contract and rewards depend on its policies`,
    confirmSwitch: `Confirm switch`,
    confirmUpdate: `Confirm update`,
    validateFirst: `Validate contract first`,
    summary: {
      signerManager: `Signer manager`,
      enterContractHint: `Enter a contract address to validate`,
      pool: `Pool`,
      fee: `Fee`,
      rewardsToken: `Rewards token`,
      amountStaked: `Amount staked`,
      movesInFullSuffix: `, moves in full`,
      lockedUntil: `Locked until`,
      effective: `Effective`,
      effectiveCaption: `One transaction, no unstaking needed`,
      customRewardsValue: `Set by the custom contract`,
      setByContract: `Set by the contract`,
    },
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
      walletUnavailable: `No wallet connected. Reconnect your wallet and try again.`,
      unknown: `Couldn't submit the transaction. Please try again.`,
    },
    viewInExplorer: `View in explorer`,
    dismiss: `Dismiss`,
  },
  needsRestake: {
    title: `Re-stake your STX`,
    description: `PoX-5 replaced the previous staking protocol and your STX has unlocked. Choose a pool to start earning sBTC rewards.`,
  },
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
  rewardsPayout: `Rewards payout`,
  totalStaked: `Total staked`,
  tvl: `TVL`,
  capacity: `Capacity`,
  access: `Access`,
  historicalYield: `Historical yield`,
  fee: `Fee`,
  selfClaimOnly: `Self-claim only`,
  startEarning: `Start earning`,
  viewPosition: `View position`,
  switchPool: `Switch`,
};
