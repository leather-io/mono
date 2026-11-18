export interface LearnArticle {
  id: string;
  title: string;
  slug: string;
  sentence: string;
  body?: string;
  disclaimer?: string;
}

export const learnArticles: Record<string, LearnArticle> = {
  pooledStacking: {
    id: 'pooled-stacking',
    title: 'Pooled Staking',
    slug: 'pooled-stacking',
    sentence:
      'Stake your STX with a pool provider to earn Bitcoin rewards without meeting the minimum threshold.',
    body: 'Pooled staking allows users to combine their STX with others to meet the minimum staking requirement. Pool operators handle the technical aspects while you earn proportional rewards.',
    disclaimer: '',
  },
  liquidStacking: {
    id: 'liquid-stacking',
    title: 'Liquid Staking',
    slug: 'liquid-stacking',
    sentence:
      'Convert your STX to liquid staking tokens and earn rewards while maintaining liquidity.',
    body: 'Liquid staking protocols issue synthetic tokens representing your staked STX, allowing you to use them in DeFi while still earning staking rewards.',
    disclaimer: '',
  },
  stacksTokenStx: {
    id: 'stacks-token-stx',
    title: 'STX Token',
    slug: 'stacks-token-stx',
    sentence: 'The native token of the Stacks blockchain that enables smart contracts on Bitcoin.',
    body: 'STX is the native cryptocurrency of the Stacks blockchain. It is used for transaction fees, smart contract execution, and can be locked (staked) to earn Bitcoin rewards.',
  },
  stackingProviders: {
    id: 'stacking-providers',
    title: 'Staking Providers',
    slug: 'stacking-providers',
    sentence: 'Third-party services that help you stake your STX and earn rewards.',
    body: 'Staking providers offer various services including pooled staking, liquid staking, and managed staking solutions. Each provider has different fees, minimums, and reward structures.',
  },
  pooledStackingDelegation: {
    id: 'pooled-stacking-delegation',
    title: 'Delegation',
    slug: 'pooled-stacking-delegation',
    sentence: 'Grant permission to a pool operator to stake your STX on your behalf.',
    body: "Delegation allows a staking pool to lock your STX for staking cycles. Your tokens remain in your control but are locked according to the pool's staking schedule.",
  },
  stackingRewardsTokens: {
    id: 'stacking-rewards-tokens',
    title: 'Rewards',
    slug: 'stacking-rewards-tokens',
    sentence: 'Earn Bitcoin or STX rewards based on your staking participation.',
    body: 'Staking rewards are distributed in Bitcoin (for direct and pooled staking) or STX (for some liquid staking protocols). Rewards are proportional to the amount staked.',
  },
  stackingLiquidToken: {
    id: 'stacking-liquid-token',
    title: 'Liquid Staking Tokens',
    slug: 'stacking-liquid-token',
    sentence: 'Synthetic tokens representing your staked STX position.',
    body: 'Liquid staking tokens like stSTX or LiSTX represent your staked STX and can be used in DeFi protocols while continuing to earn staking rewards.',
  },
  stackingRewards: {
    id: 'stacking-rewards',
    title: 'Staking Rewards',
    slug: 'stacking-rewards',
    sentence: 'Bitcoin rewards earned through the Proof of Transfer consensus mechanism.',
    body: 'Stakers earn BTC rewards for helping secure the network. Rewards come from miners who transfer Bitcoin to participate in the mining process.',
  },
  totalLockedValueTvl: {
    id: 'total-locked-value-tvl',
    title: 'Total Value Locked',
    slug: 'total-locked-value-tvl',
    sentence: 'The total amount of STX locked in staking across all participants.',
    body: "TVL represents the total value of assets locked in a protocol or staking pool, indicating the protocol's adoption and trustworthiness.",
  },
  historicalYield: {
    id: 'historical-yield',
    title: 'Historical Yield',
    slug: 'historical-yield',
    sentence: 'Past performance of staking rewards, typically shown as an annual percentage.',
    body: 'Historical yields help estimate potential returns but do not guarantee future performance. Yields vary based on network activity and Bitcoin price.',
  },
  stackingPoolFees: {
    id: 'stacking-pool-fees',
    title: 'Pool Fees',
    slug: 'stacking-pool-fees',
    sentence: 'Service fees charged by pool operators for managing your staking.',
    body: 'Pool operators typically charge 5-15% of earned rewards as fees for their services, including technical management and reward distribution.',
  },
  pooledStackingConditions: {
    id: 'pooled-stacking-conditions',
    title: 'Staking Conditions',
    slug: 'pooled-stacking-conditions',
    sentence: 'Terms and conditions for participating in pooled staking.',
    body: 'Pooled staking involves locking your STX for defined cycles, trusting the pool operator, and accepting their fee structure and distribution schedule.',
  },
  liquidStackingConditions: {
    id: 'liquid-stacking-conditions',
    title: 'Liquid Staking Terms',
    slug: 'liquid-stacking-conditions',
    sentence: 'Terms for converting STX to liquid staking tokens.',
    body: "Liquid staking involves protocol risks, potential price deviations between STX and liquid tokens, and dependency on the protocol's continued operation.",
  },
  pooledStackingUpcomingRewards: {
    id: 'pooled-stacking-upcoming-rewards',
    title: 'Upcoming Rewards',
    slug: 'pooled-stacking-upcoming-rewards',
    sentence: 'Expected rewards from your current staking position.',
    body: "Upcoming rewards are estimated based on your staked amount, the pool's total delegation, and historical reward rates.",
  },
  stackingAmount: {
    id: 'stacking-amount',
    title: 'Amount',
    slug: 'stacking-amount',
    sentence: 'The amount of STX you have staked or delegated.',
    body: 'This represents your total STX committed to staking, which will remain locked until the staking period ends.',
  },
  stackingMinimumLockupPeriod: {
    id: 'stacking-minimum-lockup-period',
    title: 'Minimum Lockup Period',
    slug: 'stacking-minimum-lockup-period',
    sentence: 'The minimum time your STX must remain locked in staking.',
    body: 'Most staking pools require a minimum lockup period, typically ranging from 1-12 cycles (about 2 weeks to 6 months).',
  },
  stackingUpcomingCycle: {
    id: 'stacking-upcoming-cycle',
    title: 'Upcoming Cycle',
    slug: 'stacking-upcoming-cycle',
    sentence: 'Information about the next staking cycle and when it begins.',
    body: 'Staking cycles run approximately every 2 weeks. This shows when the next cycle starts and how many blocks until it begins.',
  },
  stackingRewardsAddress: {
    id: 'stacking-rewards-address',
    title: 'Rewards payout',
    slug: 'stacking-rewards-address',
    sentence: 'Whether your rewards arrive as sBTC on Stacks or BTC on Bitcoin.',
    body: 'Pools pay rewards in sBTC by default. Some also support a Bitcoin payout, sent as an sBTC withdrawal to an address you provide, which costs a network fee.',
  },
  stackingDuration: {
    id: 'stacking-duration',
    title: 'Duration',
    slug: 'stacking-duration',
    sentence: 'The length of time your STX will be locked for staking.',
    body: 'STX are locked for the duration of the staking cycles you participate in. This typically ranges from 2 to 12 cycles.',
  },
  stackingContractDetails: {
    id: 'stacking-contract-details',
    title: 'Contract Details',
    slug: 'stacking-contract-details',
    sentence: 'Technical details about the staking pool contract.',
    body: 'View the pool address and contract information to verify you are interacting with the correct staking pool.',
  },
};
