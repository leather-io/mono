export const PsbtSelectors = {
  PsbtSignerCard: 'psbt-signer-card',
} as const;
export type PsbtSelectors = (typeof PsbtSelectors)[keyof typeof PsbtSelectors];

export const ConnectAccountSelectors = {
  WalletName: 'connect-account-wallet-name',
  ApproveBtn: 'get-addresses-approve-button',
  BtcAddAccountApproveBtn: 'btc-add-account-approve-button',
  StxAddAccountApproveBtn: 'stx-add-account-approve-button',
  MissingAccountCallout: 'get-addresses-missing-account-callout',
} as const;
export type ConnectAccountSelectors =
  (typeof ConnectAccountSelectors)[keyof typeof ConnectAccountSelectors];

export const RequestSelectors = {
  CrossOriginFrameCallout: 'cross-origin-frame-callout',
} as const;
export type RequestSelectors = (typeof RequestSelectors)[keyof typeof RequestSelectors];

export const PostConditionSelectors = {
  PostConditionItem: 'post-condition-item',
} as const;
export type PostConditionSelectors =
  (typeof PostConditionSelectors)[keyof typeof PostConditionSelectors];
