// Bitcoin Staking (PoX-5) is an in-development feature shipped dark: visible on
// local dev, PR previews, and staging, but hidden on the production deploy until
// the PoX-5 SIP finalizes and activation is scheduled. Gated off CLOUDFLARE_ENV
// rather than whenEnvTarget for the reasons documented in
// pages/multisig/multisig.constants.ts.
export const bitcoinStakingEnabled = import.meta.env.CLOUDFLARE_ENV !== 'production';

export const stakingPaths = {
  index: '/staking',
  pool(slug: string) {
    return `/staking/pool/${slug}`;
  },
  active(slug: string) {
    return `/staking/pool/${slug}/active`;
  },
  update(slug: string) {
    return `/staking/pool/${slug}/update`;
  },
};

// Protocol constants from the PoX-5 reference implementation
// (stacks-core#pox-wf-integration, pox-5.clar). Display fallbacks only — the
// prepare-phase length is per-network and must always be read from pox-info.
export const POX5_MAX_NUM_CYCLES = 96;
export const POX5_SIGNER_SET_MIN_USTX = 50_000_000_000;
export const DEFAULT_STAKING_CYCLES = 12;
export const STAKING_CYCLE_PRESETS = [1, 3, 6, 12];
export const MEAN_BURN_BLOCK_SECONDS = 600;

// Every pox-5 wallet RPC call is pinned to the wallet's built-in devnet
// network so transactions land on the local pox-5 devnet regardless of the
// app's network selector; the contract ids passed in those calls therefore
// always resolve from the devnet map. All pox-5 read-only queries (balances,
// pox-info, staker state) are pinned to the same chain through its API below —
// checking them against the app-selected network would validate against the
// wrong chain entirely. The devnet API URL is the host proxy from
// leather-workspace/devnet (routes /v2,/v3 to the stacks-node, the rest to the
// stacks API), which is what Leather's built-in devnet network also targets.
export const POX5_WALLET_RPC_NETWORK = 'devnet';
export const POX5_WALLET_RPC_CONTRACT_NETWORK = 'devnet';
export const POX5_DEVNET_API_URL = 'http://localhost:3999';
// Bitcoin flavor of the pinned pox-5 chain — validates BTC reward addresses
// (devnet bitcoind runs regtest, so payout addresses are bcrt1…).
export const POX5_BITCOIN_NETWORK_MODE = 'regtest' as const;
