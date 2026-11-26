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

const walletGuides = 'https://docs.leather.io/wallet-and-security';

export const multisigGuides = {
  createAccount: `${walletGuides}/create-or-join-multisig-vault#create-vault-accounts`,
  addToExtension: `${walletGuides}/use-multisig-vault-extension#add-a-vault-account-to-the-extension`,
  signAndBroadcast: `${walletGuides}/use-multisig-vault-extension#sign-and-broadcast-in-the-web-app`,
};
