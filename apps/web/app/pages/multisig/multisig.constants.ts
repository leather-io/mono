export const multisigPaths = {
  index: '/multisig',
  onboarding: '/multisig/onboarding',
  createVault: '/multisig/create-vault',
  settings: '/multisig/settings',
  vault(vaultId: string) {
    return `/multisig/vault/${vaultId}`;
  },
  account(vaultId: string, accountId: string) {
    return `/multisig/vault/${vaultId}/account/${accountId}`;
  },
  tx(vaultId: string, txId: string) {
    return `/multisig/vault/${vaultId}/tx/${txId}`;
  },
  activityDetail(vaultId: string, accountId: string, txid: string) {
    return `/multisig/vault/${vaultId}/account/${accountId}/activity/${txid}`;
  },
};
