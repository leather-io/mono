import type { Member, Proposer, Vault } from './multisig-types';

// Hand-authored seed fixtures, ported from the prototype's data.jsx. SSR-stable:
// fixed timestamp strings, no Date.now()/random. createSeedVaults() returns
// fresh objects on every call so the session store can reset to seed without
// mutating shared references.
//
// Fixture-quality notes (per plan U3): real-shaped BTC/STX addresses, amounts
// spanning tiny→large, a status mix (pending/queued/confirmed), spread
// timestamps, and one long non-ASCII member name ("Jürgen Hofstädter") to
// stress name truncation.

// The signed-in user's own personal wallet address per chain (used for the
// "me" row in Create Vault and the Send "propose as" picker).
export const myWalletAddress: Record<'btc' | 'stx', string> = {
  btc: 'bc1q9z3kfn8gz7jx5sd6f2h0u3sxnmke7vu44lq2x9',
  stx: 'SP3XKZE3J9YDEEY2KZ925AAJHSY6P0AJBNYTH53Z',
};

const myProposerBtc: Proposer = {
  fingerprint: '5d3b…0a91',
  accountIndex: 0,
  wallet: 'Wallet 1',
  account: 'Account 1',
  userId: 'me',
};
const myProposerStx: Proposer = {
  fingerprint: '9c12…2af4',
  accountIndex: 0,
  wallet: 'Wallet 1',
  account: 'Account 1',
  userId: 'me',
};

function membersBtc(): Member[] {
  return [
    {
      name: 'Me',
      handle: 'carey.btc',
      addr: 'bc1q9z3kfn8gz7jx5sd6f2h0u3sxnmke7vu44lq2x9',
      role: 'Admin',
      isCreator: true,
      inviteStatus: 'joined',
      joinedAt: 'Apr 18',
    },
    {
      name: 'Amber',
      handle: 'amber.btc',
      addr: 'bc1qpx7m4ds8hl0kfu2acmn8vyt9rd6m4j3sp02xv7',
      role: 'Member',
      isCreator: false,
      inviteStatus: 'joined',
      joinedAt: 'Apr 18',
    },
    {
      name: 'Jürgen Hofstädter',
      handle: 'jurgen.btc',
      addr: 'bc1qk5d8nfvw3qe88fd8s2cn0ye3l5w8s7zsmnrx0z',
      role: 'Member',
      isCreator: false,
      inviteStatus: 'joined',
      joinedAt: 'Apr 19',
    },
  ];
}

function membersStx(): Member[] {
  return [
    {
      name: 'Me',
      handle: 'carey.btc',
      addr: 'SP3XKZE3J9YDEEY2KZ925AAJHSY6P0AJBNYTH53Z',
      role: 'Admin',
      isCreator: true,
      inviteStatus: 'joined',
      joinedAt: 'Apr 18',
    },
    {
      name: 'Amber',
      handle: 'amber.btc',
      addr: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR',
      role: 'Member',
      isCreator: false,
      inviteStatus: 'joined',
      joinedAt: 'Apr 18',
    },
    {
      name: 'Jürgen Hofstädter',
      handle: 'jurgen.btc',
      addr: 'SPM4E13A8PV6EB3BWZNTYDJPE2H62JTBJRWNPCH4',
      role: 'Member',
      isCreator: false,
      inviteStatus: 'joined',
      joinedAt: 'Apr 19',
    },
  ];
}

// Non-creator members start `invited` on a freshly created vault.
function asFreshInvites(members: Member[]): Member[] {
  return members.map(m => (m.isCreator ? m : { ...m, inviteStatus: 'invited', joinedAt: null }));
}

export function createSeedVaults(): Vault[] {
  return [
    {
      id: 'treasury-stx',
      name: 'Team Treasury',
      chain: 'stx',
      theme: 0,
      status: 'active',
      balanceUsd: 22358,
      balanceSub: '118,250 STX',
      members: membersStx(),
      inviter: 'carey.btc',
      inviteToken: 'v1-team-treasury-9f3k2',
      createdAt: 'Apr 18, 2025',
      invited: false,
      accounts: [
        {
          id: 'cold',
          name: 'Cold',
          icon: 'piggybank',
          addr: 'SM2ZD8K9J3XYE7WQ4N5H6VBRFC0TPGA1MKS3JBNVY',
          balanceUsd: 7517.49,
          balanceSub: '110,250 STX',
          threshold: [2, 3],
          proposers: [myProposerStx],
        },
        {
          id: 'ops',
          name: 'Ops',
          icon: 'zap',
          addr: 'SM31QF7YZ9V2HKND8CBJ5RW6E0TPXAG4MS7HBV2KJ',
          balanceUsd: 14841.5,
          balanceSub: '8,000 STX',
          threshold: [2, 3],
          proposers: [myProposerStx],
        },
      ],
      transactions: [
        {
          id: 'tx-1',
          kind: 'send',
          title: 'Send STX',
          sub: 'Team treasury · Operations',
          status: 'pending',
          amount: '-0.020 STX',
          amountUsd: '-$0.01',
          time: 'Apr 23, 03:01',
          highlight: true,
          accountId: 'cold',
          proposerName: 'Jane',
          proposerUserId: 'user-jane',
          proposedAt: 'Apr 23, 03:01',
          signed: ['Jane'],
          required: 2,
        },
        {
          id: 'tx-2',
          kind: 'send',
          title: 'Send STX',
          sub: 'To fyq.us20.btc',
          status: 'queued',
          amount: '-1,200 STX',
          amountUsd: '-$226.92',
          time: '25 min ago',
          accountId: 'cold',
          proposerName: 'Me',
          proposerUserId: 'me',
          proposedAt: '25 min ago',
          signed: ['Me', 'Amber'],
          required: 2,
        },
        {
          id: 'tx-3',
          kind: 'send',
          title: 'Send STX',
          sub: 'Team treasury · Operations',
          status: 'pending',
          amount: '-3,000 STX',
          amountUsd: '-$567.30',
          time: '26 min ago',
          accountId: 'ops',
          proposerName: 'Me',
          proposerUserId: 'me',
          proposedAt: '26 min ago',
          signed: [],
          required: 2,
        },
        {
          id: 'tx-4',
          kind: 'send',
          title: 'Send STX',
          sub: 'To fyq.us20.btc',
          status: 'confirmed',
          amount: '-450 STX',
          amountUsd: '-$85.10',
          time: '1 hr ago',
          accountId: 'ops',
          proposerName: 'Amber',
          proposerUserId: 'user-amber',
          proposedAt: '1 hr ago',
          signed: ['Me', 'Amber'],
          required: 2,
        },
      ],
    },
    {
      id: 'treasury-btc',
      name: 'Vault One',
      chain: 'btc',
      theme: 1,
      status: 'active',
      balanceUsd: 184250,
      balanceSub: '2.74218 BTC',
      members: membersBtc(),
      inviter: 'carey.btc',
      inviteToken: 'v1-vault-one-7ax9b',
      createdAt: 'Apr 19, 2025',
      invited: false,
      accounts: [
        {
          id: 'cold',
          name: 'Cold storage',
          icon: 'piggybank',
          addr: 'bc1qsnpv5h9k3p7w2x8r4tnvyu0d5h6f0jgk8m4cqfltm9phf8x2axqs4vym3p',
          balanceUsd: 184250,
          balanceSub: '2.74218 BTC',
          threshold: [2, 3],
          proposers: [myProposerBtc],
        },
      ],
      transactions: [
        {
          id: 'tx-b1',
          kind: 'send',
          title: 'Send BTC',
          sub: 'Vault One · Cold storage',
          status: 'pending',
          amount: '-0.012 BTC',
          amountUsd: '-$806.40',
          time: '12 min ago',
          highlight: true,
          accountId: 'cold',
          proposerName: 'Me',
          proposerUserId: 'me',
          proposedAt: '12 min ago',
          signed: [],
          required: 2,
        },
        {
          id: 'tx-b2',
          kind: 'send',
          title: 'Send BTC',
          sub: 'To bc1q…2x9',
          status: 'pending',
          amount: '-0.05 BTC',
          amountUsd: '-$3,360.00',
          time: '2 hr ago',
          accountId: 'cold',
          proposerName: 'Amber',
          proposerUserId: 'user-amber',
          proposedAt: '2 hr ago',
          signed: ['Amber'],
          required: 2,
        },
      ],
    },
    {
      id: 'invite-1',
      name: 'Bear Market Buying',
      chain: 'stx',
      theme: 2,
      status: 'pending',
      balanceUsd: 0,
      balanceSub: 'Invited by amber.btc',
      members: asFreshInvites(membersStx()),
      inviter: 'amber.btc',
      inviteToken: 'v1-bear-buying-3pq7m',
      createdAt: 'May 2, 2025',
      invited: true,
      accounts: [],
      transactions: [],
    },
    {
      id: 'invite-2',
      name: 'Founders cold',
      chain: 'btc',
      theme: 1,
      status: 'pending',
      balanceUsd: 0,
      balanceSub: 'Invited by ben.btc',
      members: asFreshInvites(membersBtc()),
      inviter: 'ben.btc',
      inviteToken: 'v1-founders-cold-8m2qx',
      createdAt: 'May 4, 2025',
      invited: true,
      accounts: [],
      transactions: [],
    },
  ];
}
