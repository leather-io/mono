export interface SignedInProps {
  isSignedIn: true;
  hasExistingDelegation: boolean;
  hasExistingDelegatedStacking: boolean;
  hasExistingDirectStacking: boolean;
  hasEnoughBalanceToPool: boolean;
  hasEnoughBalanceToDirectStack: boolean;
  stackingMinimumAmountUstx: bigint;
}

export interface SignedOutProps {
  isSignedIn: false;
}
