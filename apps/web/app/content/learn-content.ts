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
    title: 'Pooled Stacking',
    slug: 'pooled-stacking',
    sentence:
      'Stack your STX with a pool provider to earn Bitcoin rewards without meeting the minimum threshold.',
    body: 'Pooled stacking allows users to combine their STX with others to meet the minimum stacking requirement. Pool operators handle the technical aspects while you earn proportional rewards.',
    disclaimer: '',
  },
  liquidStacking: {
    id: 'liquid-stacking',
    title: 'Liquid Stacking',
    slug: 'liquid-stacking',
    sentence:
      'Convert your STX to liquid stacking tokens and earn rewards while maintaining liquidity.',
    body: 'Liquid stacking protocols issue synthetic tokens representing your stacked STX, allowing you to use them in DeFi while still earning stacking rewards.',
    disclaimer: '',
  },
  stacksTokenStx: {
    id: 'stacks-token-stx',
    title: 'STX Token',
    slug: 'stacks-token-stx',
    sentence: 'The native token of the Stacks blockchain that enables smart contracts on Bitcoin.',
    body: 'STX is the native cryptocurrency of the Stacks blockchain. It is used for transaction fees, smart contract execution, and can be locked (stacked) to earn Bitcoin rewards.',
  },
  stackingProviders: {
    id: 'stacking-providers',
    title: 'Stacking Providers',
    slug: 'stacking-providers',
    sentence: 'Third-party services that help you stack your STX and earn rewards.',
    body: 'Stacking providers offer various services including pooled stacking, liquid stacking, and managed stacking solutions. Each provider has different fees, minimums, and reward structures.',
  },
  pooledStackingDelegation: {
    id: 'pooled-stacking-delegation',
    title: 'Delegation',
    slug: 'pooled-stacking-delegation',
    sentence: 'Grant permission to a pool operator to stack your STX on your behalf.',
    body: "Delegation allows a stacking pool to lock your STX for stacking cycles. Your tokens remain in your control but are locked according to the pool's stacking schedule.",
  },
  stackingRewardsTokens: {
    id: 'stacking-rewards-tokens',
    title: 'Rewards',
    slug: 'stacking-rewards-tokens',
    sentence: 'Earn Bitcoin or STX rewards based on your stacking participation.',
    body: 'Stacking rewards are distributed in Bitcoin (for direct and pooled stacking) or STX (for some liquid stacking protocols). Rewards are proportional to the amount stacked.',
  },
  stackingLiquidToken: {
    id: 'stacking-liquid-token',
    title: 'Liquid Stacking Tokens',
    slug: 'stacking-liquid-token',
    sentence: 'Synthetic tokens representing your stacked STX position.',
    body: 'Liquid stacking tokens like stSTX or LiSTX represent your stacked STX and can be used in DeFi protocols while continuing to earn stacking rewards.',
  },
  stackingRewards: {
    id: 'stacking-rewards',
    title: 'Stacking Rewards',
    slug: 'stacking-rewards',
    sentence: 'Bitcoin rewards earned through the Proof of Transfer consensus mechanism.',
    body: 'Stackers earn BTC rewards for helping secure the network. Rewards come from miners who transfer Bitcoin to participate in the mining process.',
  },
  totalLockedValueTvl: {
    id: 'total-locked-value-tvl',
    title: 'Total Value Locked',
    slug: 'total-locked-value-tvl',
    sentence: 'The total amount of STX locked in stacking across all participants.',
    body: "TVL represents the total value of assets locked in a protocol or stacking pool, indicating the protocol's adoption and trustworthiness.",
  },
  stackingMinimumCommitment: {
    id: 'stacking-minimum-commitment',
    title: 'Minimum Commitment',
    slug: 'stacking-minimum-commitment',
    sentence: 'The minimum amount of STX required to participate in stacking.',
    body: 'Solo stacking requires a dynamic minimum (currently around 100,000 STX), while pooled stacking allows participation with much smaller amounts.',
  },
  historicalYield: {
    id: 'historical-yield',
    title: 'Historical Yield',
    slug: 'historical-yield',
    sentence: 'Past performance of stacking rewards, typically shown as an annual percentage.',
    body: 'Historical yields help estimate potential returns but do not guarantee future performance. Yields vary based on network activity and Bitcoin price.',
  },
  stackingPoolFees: {
    id: 'stacking-pool-fees',
    title: 'Pool Fees',
    slug: 'stacking-pool-fees',
    sentence: 'Service fees charged by pool operators for managing your stacking.',
    body: 'Pool operators typically charge 5-15% of earned rewards as fees for their services, including technical management and reward distribution.',
  },
  pooledStackingConditions: {
    id: 'pooled-stacking-conditions',
    title: 'Stacking Conditions',
    slug: 'pooled-stacking-conditions',
    sentence: 'Terms and conditions for participating in pooled stacking.',
    body: 'Pooled stacking involves locking your STX for defined cycles, trusting the pool operator, and accepting their fee structure and distribution schedule.',
  },
  liquidStackingConditions: {
    id: 'liquid-stacking-conditions',
    title: 'Liquid Stacking Terms',
    slug: 'liquid-stacking-conditions',
    sentence: 'Terms for converting STX to liquid stacking tokens.',
    body: "Liquid stacking involves protocol risks, potential price deviations between STX and liquid tokens, and dependency on the protocol's continued operation.",
  },
  pooledStackingUpcomingRewards: {
    id: 'pooled-stacking-upcoming-rewards',
    title: 'Upcoming Rewards',
    slug: 'pooled-stacking-upcoming-rewards',
    sentence: 'Expected rewards from your current stacking position.',
    body: "Upcoming rewards are estimated based on your stacked amount, the pool's total delegation, and historical reward rates.",
  },
  stackingAmount: {
    id: 'stacking-amount',
    title: 'Amount',
    slug: 'stacking-amount',
    sentence: 'The amount of STX you have stacked or delegated.',
    body: 'This represents your total STX committed to stacking, which will remain locked until the stacking period ends.',
  },
  stackingMinimumLockupPeriod: {
    id: 'stacking-minimum-lockup-period',
    title: 'Minimum Lockup Period',
    slug: 'stacking-minimum-lockup-period',
    sentence: 'The minimum time your STX must remain locked in stacking.',
    body: 'Most stacking pools require a minimum lockup period, typically ranging from 1-12 cycles (about 2 weeks to 6 months).',
  },
  stackingUpcomingCycle: {
    id: 'stacking-upcoming-cycle',
    title: 'Upcoming Cycle',
    slug: 'stacking-upcoming-cycle',
    sentence: 'Information about the next stacking cycle and when it begins.',
    body: 'Stacking cycles run approximately every 2 weeks. This shows when the next cycle starts and how many blocks until it begins.',
  },
  stackingRewardsAddress: {
    id: 'stacking-rewards-address',
    title: 'Rewards Address',
    slug: 'stacking-rewards-address',
    sentence: 'The Bitcoin address where your stacking rewards will be sent.',
    body: 'Specify a Bitcoin address to receive your BTC rewards. Make sure you control this address and keep it secure.',
  },
  stackingDuration: {
    id: 'stacking-duration',
    title: 'Duration',
    slug: 'stacking-duration',
    sentence: 'The length of time your STX will be locked for stacking.',
    body: 'STX are locked for the duration of the stacking cycles you participate in. This typically ranges from 2 to 12 cycles.',
  },
  stackingContractDetails: {
    id: 'stacking-contract-details',
    title: 'Contract Details',
    slug: 'stacking-contract-details',
    sentence: 'Technical details about the stacking pool contract.',
    body: 'View the pool address and contract information to verify you are interacting with the correct stacking pool.',
  },
};
