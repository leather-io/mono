import { type RouteConfigEntry, index, layout, prefix, route } from '@react-router/dev/routes';

// All multisig routes live here and are spread into routes.ts with a single
// `...multisigRoutes` line, so the central route table is touched exactly once.
// The layout() wraps every child so the MultisigSessionProvider (mounted in
// multisig.layout.tsx) scopes to /multisig/* only. Subsequent units add their
// screen routes to the children array below as the screens land.
// Design-review routes: render the multisig views / panels with mock data
// outside the auth layout, so the redesign can be reviewed without a wallet.
// Excluded from production builds (Vite strips the `!== 'production'` branch), so
// they never reach the production bundle or become routable publicly. Safe to drop.
const previewRoutes: RouteConfigEntry[] =
  import.meta.env.MODE !== 'production'
    ? [
        route('transaction-preview', 'pages/multisig/preview/transaction-list-preview.route.tsx'),
        route('sidebar-preview', 'pages/multisig/preview/sidebar-preview.route.tsx'),
        route('context-preview', 'pages/multisig/preview/context-preview.route.tsx'),
        route('gallery-preview', 'pages/multisig/preview/gallery-preview.route.tsx'),
        route('pages-preview', 'pages/multisig/preview/pages-preview.route.tsx'),
      ]
    : [];

export const multisigRoutes: RouteConfigEntry[] = prefix('multisig', [
  ...previewRoutes,
  layout('pages/multisig/multisig.layout.tsx', [
    index('pages/multisig/multisig.route.tsx'),
    route('onboarding', 'pages/multisig/onboarding/onboarding.route.tsx'),
    route('create-vault', 'pages/multisig/create-vault/create-vault.route.tsx'),
    route('settings', 'pages/multisig/settings/settings.route.tsx'),
    route('vault/:vaultId', 'pages/multisig/vault/vault.route.tsx'),
    route('vault/:vaultId/account/:accountId', 'pages/multisig/account/account.route.tsx'),
    route(
      'vault/:vaultId/account/:accountId/activity/:txid',
      'pages/multisig/activity/activity-detail.route.tsx'
    ),
    route('vault/:vaultId/tx/:txId', 'pages/multisig/tx/tx.route.tsx'),
  ]),
]);
