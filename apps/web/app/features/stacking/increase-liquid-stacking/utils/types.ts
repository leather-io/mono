export interface SignerDetailsFormValues {
  /**
   * The public key of the signer that the pool is using.
   */
  signerKey: string;

  /**
   * An optional signature from the signerKey.
   * This can be empty if the signer uses the same signature for all stackers.
   */
  signerSignature?: string;

  /**
   * The maximal amount of STX that this pool can lock.
   */
  maxAmount: string;

  /**
   * The authorization id that prevents re-use of the signature.
   */
  authId: string;

  /**
   * Internal: JSON of signature data
   */
  signatureJSON?: string;
}

export interface StackAggregationCommitFormValues extends SignerDetailsFormValues {
  /**
   * The PoX rewards address. The address where rewards are paid into,
   * Must be of a supported address type
   */
  poxAddress: string;

  /**
   * The reward cycle id that should be finalized.
   */
  rewardCycleId: number;
}
