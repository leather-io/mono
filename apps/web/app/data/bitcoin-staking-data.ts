import { z } from 'zod';
import { pox5NetworkConfig } from '~/data/pox5-network-config';
import { NetworkMode } from '~/features/stacking/utils/stacking-network-types';

// PoX-5 pool registry. Deliberately separate from stackingPoolData: under pox-5
// a pool's identity is its signer-manager contract, and per-pool wrapper
// contracts and argument shapes no longer exist. Only pools with a
// signerManagerContract entry are displayed; an absent entry means we have no
// contract id from that partner yet. The "special" pool holds the single
// signer-manager contract we currently have — the reference deployment on
// whichever chain pox5-network-config.ts selects, keyed under that chain's
// network mode rather than the app's network selector.
export type BitcoinStakingProviderId =
  | 'special'
  | 'fastPool'
  | 'planbetter'
  | 'restake'
  | 'xversePool'
  | 'stackingDao';

const specialSignerManagerContract: Partial<Record<NetworkMode, string>> =
  pox5NetworkConfig.specialSignerManagerContract
    ? { [pox5NetworkConfig.contractNetworkMode]: pox5NetworkConfig.specialSignerManagerContract }
    : {};

export interface BitcoinStakingPool {
  providerId: BitcoinStakingProviderId;
  name: string;
  url: string;
  description: string;
  signerManagerContract: Partial<Record<NetworkMode, string>>;
  supportsBtcPayout: boolean;
  fee: string;
}

const bitcoinStakingPoolData: Record<BitcoinStakingProviderId, BitcoinStakingPool> = {
  special: {
    providerId: 'special',
    name: 'Special',
    url: 'https://leather.io',
    description:
      'Staking pool on the pox-5 test chain. Rewards accrue as sBTC each cycle and can be claimed anytime.',
    signerManagerContract: specialSignerManagerContract,
    // The reference signer-manager supports the L1 payout preference
    // (get-pox-addr + sbtc-withdrawal routing in claim-staker-rewards).
    supportsBtcPayout: true,
    fee: '—',
  },
  fastPool: {
    providerId: 'fastPool',
    name: 'Fast Pool',
    url: 'https://fastpool.org',
    description:
      'Enjoy automatic pool operations. Rewards accrue as sBTC each cycle and can be claimed anytime.',
    signerManagerContract: {},
    supportsBtcPayout: false,
    fee: '5%',
  },
  planbetter: {
    providerId: 'planbetter',
    name: 'PlanBetter',
    url: 'https://planbetter.com',
    description: 'Earn non-custodial Bitcoin yield. No wrapped tokens.',
    signerManagerContract: {},
    supportsBtcPayout: false,
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
    fee: '5.00%',
  },
  xversePool: {
    providerId: 'xversePool',
    name: 'Xverse',
    url: 'https://pool.xverse.app/',
    description:
      'Xverse pool is a non-custodial staking pool service from the makers of Xverse wallet.',
    signerManagerContract: {
      mainnet: 'SP8HK160YD5GHXP69VGA0TC7AQJ1X4CDW3XVERSE.xverse-signer-manager-1',
    },
    supportsBtcPayout: true,
    // TODO: read the live rate from the contract once it is deployed — the
    // signer-manager exposes no getter for the current fee, only the per-cycle
    // snapshot written after claim-rewards runs.
    fee: '5%',
  },
  stackingDao: {
    providerId: 'stackingDao',
    name: 'Stacking DAO',
    url: 'https://www.stackingdao.com',
    description: 'Stake without your STX leaving your wallet.',
    signerManagerContract: {
      mainnet: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.native-pool-signer-manager',
    },
    supportsBtcPayout: true,
    // TODO: read the live rate from the contract once it is deployed — the
    // signer-manager exposes no getter for the current fee, only the per-cycle
    // snapshot written after claim-rewards runs.
    fee: '5%',
  },
};

export const bitcoinStakingPoolList = Object.values(bitcoinStakingPoolData);

const stakingPoolSlugMap = {
  special: 'special',
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
