export const errorMessages = {
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
} as const;

export const validationMessages = {
  enterAmount: 'Enter an amount of STX',
  invalidAmount: 'STX amount must be a number',
  mustStackAmount: 'You must stack an amount',
  availableBalance: 'Available balance is',
  mustStackAtLeast: 'You must stack at least',
  mustDelegateMore: "You must delegate more than you've already stacked",
  mustDelegateAtLeast: 'You must delegate at least',
  addressNotValid: 'Address is not valid',
  addressIncorrectNetwork: 'Address is for incorrect network',
} as const;

export const statusMessages = {
  waitingForTxConfirmation: 'Waiting for transaction confirmation',
  waitingForCycleToStart: 'Waiting for the cycle to start',
  stackingReady:
    'Your STX are ready for stacking. Once the next cycle starts the network will determine if and how many slots are claimed.',
  stackingSubmitted:
    'A Stacking request was successfully submitted to the blockchain. Once confirmed, an additional amount will be stacking.',
  errorLoadingData: 'Error while loading data, try reloading the page.',
  youAreStacking: "You're stacking",
} as const;
