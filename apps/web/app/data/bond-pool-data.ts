import { ProviderId } from '~/data/data';

// Community-tranche access to Bitcoin bonds, kept separate from
// bitcoinStakingPoolData on purpose. pox-5 has no pooling primitive: the pool
// contract is itself the single staker, and member accounting plus onward
// distribution live entirely inside the operator's own contract. There is no
// shared interface to stake against, so these rows carry no signer-manager
// contract.
//
// Access differs per operator and moves between bonds, so it is data rather
// than a property of the section: a pool is only open while its deposit window
// is, and it goes back to a waitlist once it fills or the window shuts.
export interface BondPool {
  slug: string;
  providerId: ProviderId;
  name: string;
  offering: string;
  url: string;
  locked: readonly string[];
  rewards: string;
  capacity: string;
  fee: string;
  access: 'open' | 'waitlist';
}

const bondPoolData = {
  esbeeDao: {
    slug: 'esbee-dao-bond-pool',
    // The bond product of the Fast Pool team, on its own domain and under its
    // own brand. fastpool.org itself carries nothing about bonds, so the row
    // is named and marked for what it links to.
    providerId: 'esbeeDao',
    name: 'Esbee DAO',
    offering: 'Bond pool, by Fast Pool',
    url: 'https://www.esbee-dao.org',
    locked: ['sBTC', 'STX'],
    rewards: 'sBTC',
    capacity: '5 BTC',
    // The pool publishes no commission, and an unstated fee is not a zero fee.
    fee: 'Not stated',
    access: 'open',
  },
  stackingDao: {
    slug: 'stacking-dao-bond-pool',
    providerId: 'stackingDao',
    name: 'Stacking DAO',
    // The liquid product, not a peer of Esbee's plain bond pool: bond rewards
    // stay pooled to the protocol's sBTC recipient and participants hold
    // stBTC, so this row must not advertise a payout to your own address.
    offering: 'Liquid bond pool',
    url: 'https://tally.so/r/vGb2Zg',
    // The pool pairs the STX itself, so a participant hands over sBTC only.
    locked: ['sBTC'],
    rewards: 'stBTC',
    capacity: 'At cap',
    fee: 'TBA',
    access: 'waitlist',
  },
} as const satisfies Record<string, BondPool>;

export const bondPoolList = Object.values(bondPoolData);
