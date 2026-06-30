import { HttpResponse, http } from 'msw';

import type {
  AuthNetworkId,
  AuthSession,
  MultisigUser,
  Vault,
  VaultAccount,
  VaultAccountSummary,
  VaultSummary,
} from '@leather.io/models';

interface MockIdentity {
  address: string;
  publicKey: string;
}

const mockIdentities: Record<AuthNetworkId, MockIdentity> = {
  'stx:mainnet': {
    address: 'SP3XKZE3J9YDEEY2KZ925AAJHSY6P0AJBNYTH53Z',
    publicKey: '03a0e1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f9',
  },
  'btc:mainnet': {
    address: 'bc1q9z3kfn8gz7jx5sd6f2h0u3sxnmke7vu44lq2x9',
    publicKey: '0288dead11beef22cafe33face44feed55bead66cafe77dead88beef99cafe0011',
  },
  'stx:testnet': {
    address: 'ST3XKZE3J9YDEEY2KZ925AAJHSY6P0AJBNW0K9HG',
    publicKey: '02b1c2d3e4f5061728394a5b6c7d8e9f00112233445566778899aabbccddeeff00',
  },
  'btc:testnet': {
    address: 'tb1q9z3kfn8gz7jx5sd6f2h0u3sxnmke7vu4srv0pj',
    publicKey: '0299beef88cafe77dead66beef55feed44face33cafe22beef11dead00cafe9988',
  },
};

function base64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function makeMockAccessToken(network: AuthNetworkId, expSeconds: number): string {
  const header = base64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const identity = { ...mockIdentities[network], network };
  const payload = base64Url(JSON.stringify({ identity, exp: expSeconds }));
  return `${header}.${payload}.mock`;
}

export function makeMockSession(network: AuthNetworkId, expSeconds: number): AuthSession {
  return {
    accessToken: makeMockAccessToken(network, expSeconds),
    refreshToken: `mock-refresh-${network}`,
    identity: { ...mockIdentities[network], network },
  };
}

function networkFromAuthHeader(request: Request): AuthNetworkId {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const segment = token?.split('.')[1];
  if (!segment) return 'stx:mainnet';
  try {
    const json = atob(segment.replace(/-/g, '+').replace(/_/g, '/'));
    const network = JSON.parse(json)?.identity?.network;
    return network ?? 'stx:mainnet';
  } catch {
    return 'stx:mainnet';
  }
}

function networkFromRefreshToken(token: string): AuthNetworkId {
  const known: AuthNetworkId[] = ['stx:mainnet', 'btc:mainnet', 'stx:testnet', 'btc:testnet'];
  return known.find(network => token === `mock-refresh-${network}`) ?? 'stx:mainnet';
}

function member(
  network: AuthNetworkId,
  address: string,
  name: string,
  status: 'joined' | 'invited'
) {
  return {
    membershipId: `mem-${name.toLowerCase()}-${network}`,
    address,
    name,
    membershipStatus: status,
    user: {
      id: `user-${name.toLowerCase()}`,
      address,
      publicKey: mockIdentities[network].publicKey,
      network,
      xpub: null,
      xpubOriginFingerprint: null,
      xpubOriginPath: null,
    },
  };
}

function membersFor(network: AuthNetworkId) {
  const me = mockIdentities[network];
  const isBtc = network.startsWith('btc');
  const other1 = isBtc
    ? 'bc1qpx7m4ds8hl0kfu2acmn8vyt9rd6m4j3sp02xv7'
    : 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR';
  const other2 = isBtc
    ? 'bc1qk5d8nfvw3qe88fd8s2cn0ye3l5w8s7zsmnrx0z'
    : 'SPM4E13A8PV6EB3BWZNTYDJPE2H62JTBJRWNPCH4';
  return [
    member(network, me.address, 'Me', 'joined'),
    member(network, other1, 'Amber', 'joined'),
    member(network, other2, 'Jürgen Hofstädter', 'joined'),
  ];
}

function mockScenario(): string | null {
  try {
    return localStorage.getItem('leather:mock:scenario');
  } catch {
    return null;
  }
}

function vaultSummariesFor(network: AuthNetworkId): VaultSummary[] {
  const isBtc = network.startsWith('btc');
  const isMainnet = network.endsWith('mainnet');
  if (mockScenario() === 'empty') return [];
  const base = {
    network,
    status: 'active' as const,
    createdBy: 'user-me',
    createdAt: '2026-04-18T10:00:00.000Z',
    membershipStatus: 'joined' as const,
    memberCount: 3,
  };
  if (isMainnet) {
    return isBtc
      ? [
          {
            ...base,
            id: 'vault-btc-1',
            name: 'Vault One',
            theme: 'bronze',
            icon: 'vault',
            accountCount: 1,
          },
        ]
      : [
          {
            ...base,
            id: 'vault-stx-1',
            name: 'Team Treasury',
            theme: 'blue',
            icon: 'vault',
            accountCount: 2,
          },
          {
            ...base,
            id: 'vault-stx-invite',
            name: 'Bear Market Buying',
            theme: 'green',
            icon: 'vault',
            accountCount: 0,
            membershipStatus: 'invited',
            status: 'pending',
          },
        ];
  }
  // testnet: a single playground vault so switching mode shows different data
  return isBtc
    ? []
    : [
        {
          ...base,
          id: 'vault-stx-testnet',
          name: 'Testnet Playground',
          theme: 'orange',
          icon: 'vault',
          accountCount: 1,
        },
      ];
}

function vaultDetailFor(network: AuthNetworkId, id: string): Vault {
  const summary =
    vaultSummariesFor(network).find(v => v.id === id) ?? vaultSummariesFor(network)[0];
  return {
    id,
    name: summary?.name ?? 'Vault',
    theme: summary?.theme ?? 'blue',
    icon: 'vault',
    network,
    status: summary?.status ?? 'active',
    createdBy: 'user-me',
    createdAt: '2026-04-18T10:00:00.000Z',
    members: membersFor(network),
  };
}

function accountSummariesFor(network: AuthNetworkId, vaultId: string): VaultAccountSummary[] {
  const isBtc = network.startsWith('btc');
  const addr = isBtc
    ? 'bc1qsnpv5h9k3p7w2x8r4tnvyu0d5h6f0jgk8m4cqfltm9phf8x2axqs4vym3p'
    : 'SM2ZD8K9J3XYE7WQ4N5H6VBRFC0TPGA1MKS3JBNVY';
  return [
    {
      id: `acct-cold-${vaultId}`,
      vaultId,
      name: 'Cold storage',
      icon: 'piggybank',
      network,
      threshold: 2,
      multisigAddress: addr,
      accountIndex: 0,
      createdAt: '2026-04-18T10:05:00.000Z',
      signerCount: 3,
    },
  ];
}

function accountDetailFor(network: AuthNetworkId, id: string): VaultAccount {
  const summary = accountSummariesFor(network, 'vault')[0];
  const signers = membersFor(network).map((m, index) => ({
    network,
    publicKey: mockIdentities[network].publicKey,
    address: m.address,
    id: `signer-${index}`,
    userId: m.user.id,
    xpub: null,
    xpubOriginFingerprint: null,
    xpubOriginPath: null,
    signerIndex: index,
    signingPubkey: mockIdentities[network].publicKey,
  }));
  return {
    ...summary,
    id,
    signers,
    pendingTransactionCount: 0,
    queuedTransactionCount: 0,
  };
}

function meFor(network: AuthNetworkId): MultisigUser {
  return { ...mockIdentities[network], network, id: 'user-me', status: 'active' };
}

export const multisigHandlers = [
  http.get('*/v1/multisig/me', ({ request }) =>
    HttpResponse.json(meFor(networkFromAuthHeader(request)))
  ),
  http.get('*/v1/multisig/vaults', ({ request }) =>
    HttpResponse.json(vaultSummariesFor(networkFromAuthHeader(request)))
  ),
  http.get('*/v1/multisig/vaults/:id', ({ request, params }) =>
    HttpResponse.json(vaultDetailFor(networkFromAuthHeader(request), String(params.id)))
  ),
  http.get('*/v1/multisig/vaults/:id/accounts', ({ request, params }) =>
    HttpResponse.json(accountSummariesFor(networkFromAuthHeader(request), String(params.id)))
  ),
  http.get('*/v1/multisig/vault-accounts/:id', ({ request, params }) =>
    HttpResponse.json(accountDetailFor(networkFromAuthHeader(request), String(params.id)))
  ),
  http.get('*/v1/multisig/vault-accounts/:id/transactions', () => HttpResponse.json([])),
  http.post('*/v1/auth/refresh', async ({ request }) => {
    let refreshToken = '';
    try {
      const parsed = JSON.parse(await request.text());
      refreshToken = parsed?.refreshToken ?? '';
    } catch {
      refreshToken = '';
    }
    const network = networkFromRefreshToken(refreshToken);
    const exp = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
    return HttpResponse.json({ accessToken: makeMockAccessToken(network, exp) });
  }),
];
