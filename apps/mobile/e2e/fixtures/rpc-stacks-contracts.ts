export const leoTokenPrincipal = 'SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token';

export const leoToken = {
  assetIdentifier: `${leoTokenPrincipal}::leo`,
  name: 'Leo',
  symbol: 'LEO',
  decimals: 6,
  image: 'https://images.leather.io/tokens/leo.svg',
  principal: leoTokenPrincipal,
};

const responseOkBoolErrorUint = { type: { response: { ok: 'bool', error: 'uint128' } } };

export const rpcStacksContractInterfaces: Record<string, unknown> = {
  'SP000000000000000000002Q6VF78/bns': {
    functions: [
      {
        name: 'name-transfer',
        access: 'public',
        args: [
          { name: 'namespace', type: { buffer: { length: 20 } } },
          { name: 'name', type: { buffer: { length: 48 } } },
          { name: 'new-owner', type: 'principal' },
          { name: 'zonefile-hash', type: { optional: { buffer: { length: 20 } } } },
        ],
        outputs: { type: { response: { ok: 'bool', error: 'int128' } } },
      },
    ],
  },
  'SP2XMGYYTA1KRBKBYJHTW8CFWB2QYZKZE4BMHG3PJ/living-leather': {
    functions: [
      {
        name: 'transfer',
        access: 'public',
        args: [
          { name: 'id', type: 'uint128' },
          { name: 'sender', type: 'principal' },
          { name: 'recipient', type: 'principal' },
        ],
        outputs: responseOkBoolErrorUint,
      },
    ],
  },
  'SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6/leo-token': {
    functions: [
      {
        name: 'transfer',
        access: 'public',
        args: [
          { name: 'amount', type: 'uint128' },
          { name: 'sender', type: 'principal' },
          { name: 'recipient', type: 'principal' },
          { name: 'memo', type: { optional: { buffer: { length: 34 } } } },
        ],
        outputs: responseOkBoolErrorUint,
      },
    ],
  },
};
