export const switchTargetParam = 'to';

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
  updateWithTarget(slug: string, targetSlug: string) {
    return `/staking/pool/${slug}/update?${switchTargetParam}=${targetSlug}`;
  },
};

export const byosmContractParam = 'contract';

function byosmSearch(contractId: string) {
  return `?${byosmContractParam}=${encodeURIComponent(contractId)}`;
}

export const byosmPaths = {
  active(contractId: string) {
    return `${stakingPaths.active('byosm')}${byosmSearch(contractId)}`;
  },
  update(contractId: string) {
    return `${stakingPaths.update('byosm')}${byosmSearch(contractId)}`;
  },
  updateWithTarget(contractId: string, targetSlug: string) {
    return `${stakingPaths.update('byosm')}${byosmSearch(contractId)}&${switchTargetParam}=${targetSlug}`;
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

export const STAKING_TX_FEE_RESERVE_USTX = 500_000;

export const MIN_MAX_WITHDRAWAL_FEE_SATS = 1_000;
export const DEFAULT_MIN_CLAIM_SATS = 10_000;
export const SBTC_WITHDRAWAL_DUST_LIMIT_SATS = 546;

// Which chain the whole feature is pinned to — API, contract ids, wallet RPC
// network and address flavours — lives in data/pox5-network-config.ts.
