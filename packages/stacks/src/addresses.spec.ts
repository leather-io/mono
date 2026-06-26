import { ChainId } from '@stacks/network';
import { describe, expect, it } from 'vitest';

import { deriveStxMultisigAddress } from './addresses';

// Deterministic compressed secp256k1 public keys derived from the private keys
// 0x01… / 0x02… / 0x03…; the expected addresses were produced with
// @stacks/transactions' own addressFromPublicKeys.
const pubkeyA = '031b84c5567b126440995d3ed5aaba0565d71e1834604819ff9c17f5e9d5dd078f';
const pubkeyB = '024d4b6cd1361032ca9bd2aeb9d900aa4d45d9ead80ac9423374c451a7254d0766';
const pubkeyC = '02531fe6068134503d2723133227c867ac8fa6c83c537e9a44c3c5bdbdcb1fe337';

describe('deriveStxMultisigAddress', () => {
  it('derives the mainnet 2-of-2 multisig address', () => {
    expect(
      deriveStxMultisigAddress({
        publicKeys: [pubkeyA, pubkeyB],
        threshold: 2,
        chainId: ChainId.Mainnet,
      })
    ).toBe('SM3CFXKD81GREH6MYFW4P9VKSSR2N525W3KDRH3P1');
  });

  it('derives the testnet 2-of-2 multisig address', () => {
    expect(
      deriveStxMultisigAddress({
        publicKeys: [pubkeyA, pubkeyB],
        threshold: 2,
        chainId: ChainId.Testnet,
      })
    ).toBe('SN3CFXKD81GREH6MYFW4P9VKSSR2N525W3K30KYER');
  });

  it('depends on the public key order', () => {
    const ab = deriveStxMultisigAddress({
      publicKeys: [pubkeyA, pubkeyB],
      threshold: 2,
      chainId: ChainId.Mainnet,
    });
    const ba = deriveStxMultisigAddress({
      publicKeys: [pubkeyB, pubkeyA],
      threshold: 2,
      chainId: ChainId.Mainnet,
    });
    expect(ab).not.toBe(ba);
  });

  it('depends on the threshold', () => {
    const twoOfThree = deriveStxMultisigAddress({
      publicKeys: [pubkeyA, pubkeyB, pubkeyC],
      threshold: 2,
      chainId: ChainId.Mainnet,
    });
    const threeOfThree = deriveStxMultisigAddress({
      publicKeys: [pubkeyA, pubkeyB, pubkeyC],
      threshold: 3,
      chainId: ChainId.Mainnet,
    });
    expect(twoOfThree).not.toBe(threeOfThree);
  });
});
