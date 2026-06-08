// Multisig is a UI-only, in-development feature: visible for review on local
// dev, PR previews, and staging, but hidden on the production deploy until it
// is wired to real data.
//
// Gating note: in this repo no build sets LEATHER_TARGET except the production
// deploy (web:deploy.yml), and PR/staging preview builds (web:staging-build.yml)
// leave CLOUDFLARE_ENV unset — so the env TARGET resolves to its 'production'
// default in BOTH preview and production builds, and whenEnvTarget can't tell
// them apart. The one reliable discriminator is CLOUDFLARE_ENV, which only the
// production deploy sets to 'production'. Gate directly off it: visible
// everywhere except the real production deploy.
export const multisigEnabled = import.meta.env.CLOUDFLARE_ENV !== 'production';

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
};
