export const MultisigSelectors = {
  ProposeTransactionSheet: 'multisig-propose-transaction-sheet',
  ProposeTransactionButton: 'multisig-propose-transaction-button',
  SignerRollcall: 'multisig-signer-rollcall',
  SignTransactionButton: 'multisig-sign-transaction-button',
  CancelTransactionButton: 'multisig-cancel-transaction-button',
  BroadcastTransactionButton: 'multisig-broadcast-transaction-button',
} as const;
export type MultisigSelectors = (typeof MultisigSelectors)[keyof typeof MultisigSelectors];
