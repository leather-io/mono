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
  connectGate: {
    connectStep: `Connect Leather to stake`,
    installStep: `Install Leather to stake`,
    connectAction: `Connect`,
    installAction: `Install`,
    balancePrompt: {
      connect: `Connect Leather to see your balance`,
      install: `Install Leather to see your balance`,
    },
    connectRowTitle: `Connect`,
    connectRowDescription: `Connect Leather to load your staking position`,
    installRowTitle: `Install`,
    installRowDescription: `Add Leather extension to your browser`,
    updateTitle: `Connect Leather to update your staking`,
    updateDescription: `Your current position and available balance come from your wallet, so this page needs a connection before it can load.`,
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
  operatorPayout: {
    badge: `Custodial BTC payout`,
    explanation(poolName: string) {
      return `${poolName} collects the pool's sBTC rewards and pays members in native BTC off chain, on its own schedule. There is no on-chain claim and no on-chain recourse; payment status lives with ${poolName}.`;
    },
    rewardsTokenCaption(poolName: string) {
      return `Paid off chain by ${poolName}`;
    },
    rewardsTokenExplanation(poolName: string, cadence: string) {
      return `Rewards reach you as native BTC at the payout address you register, sent by ${poolName} ${cadence}. The pool's sBTC rewards are collected by ${poolName} and distributed off chain, so there is no on-chain claim.`;
    },
    feeCaption(poolName: string) {
      return `${poolName} policy`;
    },
    feeExplanation(poolName: string) {
      return `The fee ${poolName} publishes on its own site and applies when it distributes rewards off chain. It is operator policy rather than a value enforced by the contract, so it can change without a contract change.`;
    },
    minStakeNote(poolName: string, minStx: string) {
      return `${poolName} requires at least ${minStx} STX. The contract rejects anything smaller.`;
    },
    activeCard: {
      title: `Rewards payout`,
      paidBy(poolName: string) {
        return `Native BTC, paid by ${poolName}`;
      },
      description(poolName: string, cadence: string) {
        return `${poolName} pays your share ${cadence} to this address, after its fee. Payments are made off chain, so there is nothing to claim here and payment status lives with ${poolName}.`;
      },
      linkLabel(poolName: string) {
        return `Visit ${poolName}`;
      },
    },
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
    sentence: `Operators pool participants into a Bitcoin bond. You lock sBTC rather than STX, and each pool sets whether you pair the STX yourself.`,
    learnMoreUrl: `https://www.stacks.co/bitcoin-staking`,
    providerInfo: `The operator running the pool. Leather does not operate these pools and cannot stake into them for you, so joining one hands you off to the operator's own app and contract.`,
    providerInfoUrl: `https://www.stacks.co/bitcoin-staking`,
    rewardsInfo: `Bond rewards accrue as sBTC. Who receives them, and whether native BTC or a liquid token reaches you instead, is decided by the operator's contract rather than by pox-5.`,
    rewardsInfoUrl: `https://docs.stacks.co/pox-5/glossary`,
    capacityInfo: `The share of a bond's community allocation this operator holds. Roughly 10% of each bond's paired capacity is reserved for pools, and the figure is confirmed when the bond is created on-chain.`,
    capacityInfoUrl: `https://docs.stacks.co/pox-5/glossary`,
    feeInfo: `The cut the operator keeps from your rewards. Each operator sets its own fee in its pool contract, so check the terms before joining.`,
    lockedInfo: `What you hand over to join. Every bond pairs bitcoin with STX, but the pools differ on who supplies the STX: some take it from you alongside your sBTC, others pair it themselves. Esbee asks for STX worth about 5% of your sBTC.`,
    lockedInfoUrl: `https://docs.stacks.co/pox-5/glossary`,
    // Neither operator has a bond product page yet, and stacks.co routes retail
    // to a waitlist rather than a live pool. Matching that keeps this page from
    // being the only surface implying a bond pool can be joined today.
    // Access is per operator, and each row carries its own destination: an open
    // pool goes to the operator's deposit flow, a full one to whatever waitlist
    // that operator keeps.
    access: {
      openLabel: `Deposit`,
      waitlistLabel: `Join waitlist`,
      info: `A pool only takes deposits while its window is open, and that shuts the moment the pool stakes. Each operator sets its own allocation and runs its own waitlist, so being open here is the operator's state, not Leather's, and it is never a promise you have made a particular bond.`,
      // A deposit goes to the operator's pool contract, not to pox-5, so it
      // does not revert in the prepare phase: it rolls into the next bond
      // instead. The label says that rather than borrowing the STX flow's
      // "staking paused", which describes a transaction that would fail.
      closedLabel: `Closed for this bond`,
      infoUrl: `https://www.stacks.co/bitcoin-staking`,
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
    btcOnlyLabel: `BTC payout address`,
    btcOnlyHelper(poolName: string, cadence: string) {
      return `Required. ${poolName} pays your rewards in native BTC to this address ${cadence}, off chain and after its fee. There is no sBTC option for this pool.`;
    },
    registeredAddressChanged(poolName: string) {
      return `Changing this address redirects every future payout from ${poolName}. The address currently registered stops receiving rewards.`;
    },
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
  lockedTokens: `Locked tokens`,
  historicalYield: `Historical yield`,
  fee: `Fee`,
  selfClaimOnly: `Self-claim only`,
  startEarning: `Start earning`,
  viewPosition: `View position`,
  switchPool: `Switch`,
};
