import { ProviderId } from '~/data/data';

// Community-tranche access to Bitcoin bonds, kept separate from
// bitcoinStakingPoolData on purpose. pox-5 has no pooling primitive: the pool
// contract is itself the single staker, and member accounting plus onward
// distribution live entirely inside the operator's own contract. There is no
// shared interface to stake against, so these rows carry no signer-manager
// contract.
//
// No row carries an operator url yet. Neither operator has published a bond
// product page, so every action routes to the waitlist on stacks.co, which is
// the only sanctioned way in until a bond opens. Give a row its own url once
// its operator ships a page that actually describes the bond pool.
export interface BondPool {
  slug: string;
  providerId: ProviderId;
  name: string;
  offering: string;
  rewards: string;
  capacity: string;
  fee: string;
}

const bondPoolData = {
  fastPool: {
    slug: 'fast-pool-bond-pool',
    providerId: 'fastPool',
    name: 'Fast Pool',
    offering: 'Bond pool',
    rewards: 'sBTC',
    capacity: 'TBA',
    fee: 'TBA',
  },
  stackingDao: {
    slug: 'stacking-dao-bond-pool',
    providerId: 'stackingDao',
    name: 'Stacking DAO',
    // The liquid product, not a peer of Fast Pool's plain bond pool: bond
    // rewards stay pooled to the protocol's sBTC recipient and participants
    // hold stBTC, so this row must not advertise a payout to your own address.
    offering: 'Liquid bond pool',
    rewards: 'stBTC',
    capacity: 'TBA',
    fee: 'TBA',
  },
} as const satisfies Record<string, BondPool>;

export const bondPoolList = Object.values(bondPoolData);
