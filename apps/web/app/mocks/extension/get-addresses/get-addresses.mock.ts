import { getAddresses } from '@leather.io/rpc';

export function createMockGetAddressesResponse(id: string) {
  return getAddresses.response.parse({
    jsonrpc: '2.0',
    id,
    result: {
      addresses: [
        {
          symbol: 'BTC',
          type: 'p2wpkh',
          address: 'bc1qyf4a3taahvv2sfs0zz0mtq2lxdsthmf3wcjjxq',
          publicKey: '02cc42bfd7a7b0e99f78cc617bcf411f791feaa74e583206da59090ecfa1e7184b',
          derivationPath: "m/84'/0'/0'/0/0",
        },
        {
          symbol: 'BTC',
          type: 'p2tr',
          address: 'bc1pun2c8v0h3jcjwxhjv4ng9l63z7pj43y0pdxgt52kl0mkuqeq4mzqkt9r5t',
          publicKey: '0356c2c7329b232612ee1abfc32c41a0ba9198ab63cdb3980a4b3b4ddf8fbb8be7',
          tweakedPublicKey: '56c2c7329b232612ee1abfc32c41a0ba9198ab63cdb3980a4b3b4ddf8fbb8be7',
          derivationPath: "m/86'/0'/0'/0/0",
        },
        {
          symbol: 'STX',
          address: 'SP32YZPY7SEF52D2R4AD103SCDP4E7ATVBF1CTEST',
          publicKey: '03bb26a318d5b88f493cb648e5b04ebbb363cda8135c2f8e4cd26d22cdaaa2ae42',
        },
      ],
    },
  });
}
