import { PostsCollection, normalizePosts, postsCollectionSchema } from './post-types';
import postsData from './posts.json';

// Parse and validate posts data with Zod schema
const validatedPosts = postsCollectionSchema.parse(normalizePosts(postsData));

// Add custom static posts with proper type safety
const customPosts: PostsCollection = {
  choosingPoolingDuration: {
    title: 'Indefinite',
    sentence: `The pool commits your STX for Stacking for up to 12 cycles (with about two weeks per cycle). You can revoke anytime, but they stay locked until the pool's commitment ends. Revoke before the pool's next commitment to regain access at the end of the current commitment period.`,
    id: '',
    slug: 'choose-pooling-duration',
    body: '',
    date: '',
    status: '',
    category: '',
    subcategory: '',
    featured: false,
    hidden: false,
    question: '',
    prompt: '',
    images: [],
    views: [],
    earnProviders: [],
    dataPointInstructions: '',
    aliases: '',
    dataPointSource: '',
    summary: '',
    website: '',
    disclaimer: '',
    order: 0,
    icon: [],
    dataPointValue: '',
    createdTime: '',
  },
};

export const content = {
  stacking: {
    providerDescription: `Providers are external parties that offer yield-earning services based on the Proof of Transfer (PoX) protocol. Leather is not liable for the conduct of third parties.`,
    payoutDescription: `The type of reward you'll receive from the pool — either BTC or STX — depending on the provider's configuration.`,
    minimumAmountToStackDescription: `     The minimum amount of STX required to participate in this provider's pool. You cannot stack with less than this.`,
    aprDescription: `APR (Annual Percentage Rate) represents the annualized return participants earn on their stacked assets, excluding compounding.`,
    feeDescription: `The fee is a percentage of the rewards you earn from the pool. It is deducted from your rewards before they are distributed to you.`,
    missingIndependentStackingDescription: `We're working hard to integrate independent stacking here. In the meantime, you can use our legacy earn experience.`,
    unpoolingInfo: `After unpooling your previous position remains visible until the current cycle completes.`,
  },
  stackingExplainer: [
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
  ],
  liquidStackingExplainer: [
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
  ],
  // Merge the validated posts with our custom posts
  posts: {
    ...validatedPosts,
    ...customPosts,
  },

  // --- Consolidated content below ---

  sbtcPools: [
    {
      id: 'alex',
      title: 'ALEX',
      description: `Commit sBTC to liquidity pools to earn fees and LP tokens in addition to basic sBTC rewards`,
      tvl: '1,880 BTC',
      tvlUsd: '$113,960,000',
      minCommitment: '0.01 BTC',
      minCommitmentUsd: '$605.00',
      apr: '5.2%',
      payoutToken: 'sBTC',
      url: 'https://app.alexlab.co/pool',
      logoKey: 'AlexLogo',
    },
    {
      id: 'bitflow',
      title: 'Bitflow',
      description: `Commit sBTC to liquidity pools to earn fees and LP tokens in addition to basic sBTC rewards`,
      tvl: '1,420 BTC',
      tvlUsd: '$86,020,000',
      minCommitment: '0.008 BTC',
      minCommitmentUsd: '$484.00',
      apr: '5.1%',
      payoutToken: 'sBTC',
      url: 'https://app.bitflow.finance/sbtc#earn3',
      logoKey: 'BitflowLogo',
    },
    {
      id: 'velar',
      title: 'Velar',
      description: `Commit sBTC to liquidity pools to earn fees and LP tokens in addition to basic sBTC rewards`,
      tvl: '3,100 BTC',
      tvlUsd: '$187,050,000',
      minCommitment: '0.015 BTC',
      minCommitmentUsd: '$907.50',
      apr: '5.0%',
      payoutToken: 'sBTC',
      url: 'https://app.velar.com/pool',
      logoKey: 'VelarLogo',
    },
    {
      id: 'zest',
      title: 'Zest',
      description: `Commit sBTC to liquidity pools to earn fees and LP tokens in addition to basic sBTC rewards`,
      tvl: '950 BTC',
      tvlUsd: '$57,950,000',
      minCommitment: '0.007 BTC',
      minCommitmentUsd: '$423.50',
      apr: '5.3%',
      payoutToken: 'sBTC',
      url: 'https://app.zestprotocol.com',
      logoKey: 'ZestLogo',
    },
  ],

  stackingConditions: [
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
  ],

  liquidStackingConditions: [
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
  ],

  labels: {
    provider: 'Provider',
    rewardsToken: 'Rewards token',
    minimumCommitment: 'Minimum commitment',
    historicalYield: 'Historical yield',
    fee: 'Fee',
    startEarning: 'Start earning',
  },

  statusMessages: {
    waitingForTxConfirmation: 'Waiting for transaction confirmation',
    waitingForCycleToStart: 'Waiting for the cycle to start',
    stackingReady:
      'Your STX are ready for stacking. Once the next cycle starts the network will determine if and how many slots are claimed.',
    stackingSubmitted:
      'A Stacking request was successfully submitted to the blockchain. Once confirmed, an additional amount will be stacking.',
    errorLoadingData: 'Error while loading data, try reloading the page.',
    youAreStacking: "You're stacking",
  },

  sectionHeaders: {
    duration: 'Duration',
    start: 'Start',
    end: 'End',
    bitcoinAddress: 'Bitcoin address',
  },

  protocols: [
    {
      name: 'Stacking DAO',
      description: `Enjoy automatic protocol operations and auto-compounded yield. Locked STX will stay stacked indefinitely.`,
      url: 'https://www.stackingdao.com',
      iconKey: 'StackingDaoIcon',
    },
    {
      name: 'LISA',
      description: `See your balance increase automatically and always exchange at 1 STX to 1 LiSTX`,
      url: 'https://www.lisalab.io/',
      iconKey: 'LisaIcon',
    },
  ],

  providers: [
    { name: 'Xverse', url: 'https://xverse.app', iconKey: 'XverseIcon' },
    { name: 'Fast Pool', url: 'https://fastpool.org', iconKey: 'FastPoolIcon' },
    { name: 'PlanBetter', url: 'https://planbetter.org', iconKey: 'PlanBetterIcon' },
    { name: 'Restake', url: 'https://restake.net/stacks-pool', iconKey: 'RestakeIcon' },
    { name: 'Stacking DAO', url: 'https://www.stackingdao.com', iconKey: 'StackingDaoIcon' },
    { name: 'LISA', url: 'https://www.lisalab.io', iconKey: 'LisaIcon' },
  ],

  errorMessages: {
    oops: 'Oops!',
    unexpected: 'An unexpected error occurred.',
    notFound: 'The requested page could not be found.',
    error404: '404',
    error: 'Error',
    mocknetNotSupported: 'Mocknet is not supported.',
    errorRetrievingStacking: 'Error retrieving stacking or delegation info.',
    expectedAccountStacked: 'Expected account to be stacked',
    expectedStackingClient: 'Expected to have a StackingClient available in the context.',
    expectedDelegateTo: 'Expected `delegate-to` to be defined.',
    expectedAmountUstx: 'Expected `amount-ustx` to be defined.',
    nonStandardDelegateTx: 'Detected a non-standard delegate-stx transaction.',
    processedNonDelegationTx:
      'Processed a non-delegation transaction. Only delegation-related transaction should be used with this function.',
    failedToFetchPosts: 'Failed to fetch posts.json',
  },
  validationMessages: {
    enterAmount: 'Enter an amount of STX',
    invalidAmount: 'STX amount must be a number',
    mustStackAmount: 'You must stack an amount',
    availableBalance: 'Available balance is',
    mustStackAtLeast: 'You must stack at least',
    mustDelegateMore: "You must delegate more than you've already stacked",
    mustDelegateAtLeast: 'You must delegate at least',
    addressNotValid: 'Address is not valid',
    addressIncorrectNetwork: 'Address is for incorrect network',
  },
} as const;

export async function fetchPostsFromCMS(): Promise<PostsCollection> {
  const res = await fetch('https://leather-cms.s3.amazonaws.com/posts.json');
  if (!res.ok) throw new Error('Failed to fetch posts.json');
  const rawData = await res.json();
  return postsCollectionSchema.parse(normalizePosts(rawData));
}
