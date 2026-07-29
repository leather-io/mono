import { type RouteConfigEntry, index, layout, prefix, route } from '@react-router/dev/routes';

// All Bitcoin Staking (PoX-5) routes live here and are spread into routes.ts
// with a single `...bitcoinStakingRoutes` line. The layout gates the whole
// /staking/* area off bitcoinStakingEnabled (404 in production).
export const bitcoinStakingRoutes: RouteConfigEntry[] = prefix('staking', [
  layout('pages/bitcoin-staking/bitcoin-staking.layout.tsx', [
    index('pages/bitcoin-staking/staking.route.tsx'),
    route('status', 'pages/bitcoin-staking/staking-status.route.tsx'),
    ...prefix('pool/:slug', [
      index('pages/bitcoin-staking/pool/pool-staking.route.tsx'),
      route('active', 'pages/bitcoin-staking/pool/pool-staking-active.route.tsx'),
      route('update', 'pages/bitcoin-staking/pool/pool-staking-update.route.tsx'),
    ]),
  ]),
]);
