export interface StacksMempoolNonces {
  last_nonce: number | null;
  pending_nonces: number[];
  missing_nonces: number[];
}

export interface StacksAccountNonces {
  next_nonce: number;
  last_confirmed_nonce: number | null;
  mempool: StacksMempoolNonces;
}

export const NonceTypes = {
  apiSuggestedNonce: 'api-suggested-nonce',
  clientFallbackNonce: 'client-fallback-nonce',
  undefinedNonce: 'undefined-nonce',
} as const;
export type NonceTypes = (typeof NonceTypes)[keyof typeof NonceTypes];

export interface NextNonce {
  nonce?: number;
  nonceType: NonceTypes;
}
