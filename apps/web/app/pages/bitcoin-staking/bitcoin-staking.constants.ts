// Bitcoin Staking (PoX-5) is an in-development feature shipped dark: visible on
// local dev, PR previews, and staging, but hidden on the production deploy until
// the PoX-5 SIP finalizes and activation is scheduled. Gated off CLOUDFLARE_ENV
// rather than whenEnvTarget for the reasons documented in
// pages/multisig/multisig.constants.ts.
export const bitcoinStakingEnabled = import.meta.env.CLOUDFLARE_ENV !== 'production';

export const stakingPaths = {
  index: '/staking',
  status: '/staking/status',
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
export const DEFAULT_STAKING_CYCLES = 48;
export const MEAN_BURN_BLOCK_SECONDS = 600;
export const CYCLE_STATUS_REFETCH_INTERVAL_MS = 60_000;

// Which chain the whole feature is pinned to — API, contract ids, wallet RPC
// network and address flavours — lives in data/pox5-network-config.ts.
