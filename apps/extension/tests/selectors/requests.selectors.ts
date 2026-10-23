export const PsbtSelectors = {
  PsbtSignerCard: 'psbt-signer-card',
} as const;
export type PsbtSelectors = (typeof PsbtSelectors)[keyof typeof PsbtSelectors];

export const ConnectAccountSelectors = {
  WalletName: 'connect-account-wallet-name',
} as const;
export type ConnectAccountSelectors =
  (typeof ConnectAccountSelectors)[keyof typeof ConnectAccountSelectors];

export const PostConditionSelectors = {
  PostConditionItem: 'post-condition-item',
} as const;
export type PostConditionSelectors =
  (typeof PostConditionSelectors)[keyof typeof PostConditionSelectors];
