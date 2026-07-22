import { z } from 'zod';
import { NetworkMode } from '~/features/stacking/utils/stacking-network-types';

// PoX-5 pool registry. Deliberately separate from stackingPoolData: under pox-5
// a pool's identity is its signer-manager contract, and per-pool wrapper
// contracts and argument shapes no longer exist. An absent signerManagerContract
// entry for a network means the pool has not migrated there yet and renders
// disabled. IDs below are placeholders until pool partners deliver their
// signer-manager contracts: the devnet id targets the reference signer-manager
// deployment, and the fastPool mainnet id is a deliberately non-existent
// contract that exists only so the dark-launched flow is drivable in mock mode
// and E2E — it must be replaced before the feature is un-gated.
export type BitcoinStakingProviderId =
  | 'fastPool'
  | 'planbetter'
  | 'restake'
  | 'xversePool'
  | 'stackingDao';

export interface BitcoinStakingPool {
  providerId: BitcoinStakingProviderId;
  name: string;
  url: string;
  description: string;
  signerManagerContract: Partial<Record<NetworkMode, string>>;
  supportsBtcPayout: boolean;
  minimumStakeAmount: number;
  fee: string;
}

const bitcoinStakingPoolData: Record<BitcoinStakingProviderId, BitcoinStakingPool> = {
  fastPool: {
    providerId: 'fastPool',
    name: 'Fast Pool',
    url: 'https://fastpool.org',
    description:
      'Enjoy automatic pool operations. Rewards accrue as sBTC each cycle and can be claimed anytime.',
    signerManagerContract: {
      mainnet: 'SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP.pox5-signer-manager-placeholder',
      devnet: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.signer-manager',
    },
    supportsBtcPayout: false,
    minimumStakeAmount: 40_000_000,
    fee: '5%',
  },
  planbetter: {
    providerId: 'planbetter',
    name: 'PlanBetter',
    url: 'https://planbetter.com',
    description: 'Earn non-custodial Bitcoin yield. No wrapped tokens.',
    signerManagerContract: {},
    supportsBtcPayout: false,
    minimumStakeAmount: 200_000_000,
    fee: '5%',
  },
  restake: {
    providerId: 'restake',
    name: 'Restake',
    url: 'https://restake.net/stacks-pool',
    description:
      'Earn rewards by staking your tokens with Restake, a non-custodial infrastructure operator trusted by institutions.',
    signerManagerContract: {},
    supportsBtcPayout: false,
    minimumStakeAmount: 100_000_000,
    fee: '5.00%',
  },
  xversePool: {
    providerId: 'xversePool',
    name: 'Xverse',
    url: 'https://pool.xverse.app/',
    description:
      'Xverse pool is a non-custodial staking pool service from the makers of Xverse wallet.',
    signerManagerContract: {},
    supportsBtcPayout: false,
    minimumStakeAmount: 500_000_000,
    fee: '5%',
  },
  stackingDao: {
    providerId: 'stackingDao',
    name: 'Stacking DAO',
    url: 'https://www.stackingdao.com',
    description: 'Stake without your STX leaving your wallet.',
    signerManagerContract: {},
    supportsBtcPayout: false,
    minimumStakeAmount: 500_000_000,
    fee: '5%',
  },
};

export const bitcoinStakingPoolList = Object.values(bitcoinStakingPoolData);

const stakingPoolSlugMap = {
  'fast-pool': 'fastPool',
  planbetter: 'planbetter',
  restake: 'restake',
  'xverse-pool': 'xversePool',
  'stacking-dao': 'stackingDao',
} as const satisfies Record<string, BitcoinStakingProviderId>;

export type StakingPoolSlug = keyof typeof stakingPoolSlugMap;

export const stakingPoolSlugSchema = z.enum(
  Object.keys(stakingPoolSlugMap) as [StakingPoolSlug, ...StakingPoolSlug[]]
);

export function getStakingPoolFromSlug(slug: StakingPoolSlug): BitcoinStakingPool {
  return bitcoinStakingPoolData[stakingPoolSlugMap[slug]];
}

export function stakingProviderIdToSlug(providerId: BitcoinStakingProviderId): StakingPoolSlug {
  const entry = Object.entries(stakingPoolSlugMap).find(([, id]) => id === providerId);
  if (!entry) throw new Error(`No slug for staking provider ${providerId}`);
  const [slug] = entry;
  return stakingPoolSlugSchema.parse(slug);
}

export function getSignerManagerContract(
  providerId: BitcoinStakingProviderId,
  networkMode: NetworkMode
): string | undefined {
  return bitcoinStakingPoolData[providerId].signerManagerContract[networkMode];
}

export function getPoolBySignerManager(contractId: string): BitcoinStakingPool | undefined {
  return bitcoinStakingPoolList.find(pool =>
    Object.values(pool.signerManagerContract).includes(contractId)
  );
}

export function isPoolAvailableOnNetwork(
  pool: BitcoinStakingPool,
  networkMode: NetworkMode
): boolean {
  return pool.signerManagerContract[networkMode] !== undefined;
}

// Manual pox-5 activation override per network, used until the node announces
// pox-5 through /v2/pox contract_versions. Devnet runs the pox-5 reference
// implementation from genesis; mainnet and testnet activation heights are
// unknown until the SIP is voted on.
export const pox5ActivationHeightOverride: Record<NetworkMode, number | null> = {
  mainnet: null,
  testnet: null,
  devnet: 0,
};
