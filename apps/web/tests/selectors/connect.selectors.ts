export const ConnectSelectors = {
  ConnectCard: 'connect-card',
  InstallLeatherDialog: 'install-leather-dialog',
  MissingStacksAccountDialog: 'missing-stacks-account-dialog',
  MockWalletDialog: 'mock-wallet-dialog',
  MockWalletResolveButton: 'mock-wallet-resolve-button',
  MockWalletRejectButton: 'mock-wallet-reject-button',
} as const;
export type ConnectSelectors = (typeof ConnectSelectors)[keyof typeof ConnectSelectors];
