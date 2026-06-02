import { type RouteConfigEntry, index, layout, prefix, route } from '@react-router/dev/routes';

// All multisig routes live here and are spread into routes.ts with a single
// `...multisigRoutes` line, so the central route table is touched exactly once.
// The layout() wraps every child so the MultisigSessionProvider (mounted in
// multisig.layout.tsx) scopes to /multisig/* only. Subsequent units add their
// screen routes to the children array below as the screens land.
export const multisigRoutes: RouteConfigEntry[] = prefix('multisig', [
  layout('pages/multisig/multisig.layout.tsx', [
    index('pages/multisig/multisig.route.tsx'),
    route('onboarding', 'pages/multisig/onboarding/onboarding.route.tsx'),
    route('create-vault', 'pages/multisig/create-vault/create-vault.route.tsx'),
    route('settings', 'pages/multisig/settings/settings.route.tsx'),
    route('vault/:vaultId', 'pages/multisig/vault/vault.route.tsx'),
    route('vault/:vaultId/account/:accountId', 'pages/multisig/account/account.route.tsx'),
    route('vault/:vaultId/tx/:txId', 'pages/multisig/tx/tx.route.tsx'),
  ]),
]);
