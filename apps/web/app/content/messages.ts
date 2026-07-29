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
} as const;

export const validationMessages = {
  enterAmount: 'Enter an amount of STX',
  invalidAmount: 'STX amount must be a number',
  mustStackAmount: 'You must stack an amount',
  availableBalance: 'Available balance is',
  mustDelegateMore: "You must delegate more than you've already stacked",
  mustDelegateAtLeast: 'You must delegate at least',
  addressNotValid: 'Address is not valid',
  addressIncorrectNetwork: 'Address is for incorrect network',
  cannotStackMoreThanBalance: 'You cannot stake more than your available balance',
  chooseStakingCycles: 'Choose between 1 and 96 cycles',
  enterMaxWithdrawalFee: 'Enter a max withdrawal fee in sats',
} as const;
