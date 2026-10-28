import { z } from 'zod';

import { type NetworkConfiguration, defaultNetworksKeyedById } from '@leather.io/models';

import { stxAddressNetworkValidator, stxAddressValidator } from './address-validators';

function isValidStxAddress(address: string) {
  return z.string().check(stxAddressValidator('Invalid address')).safeParse(address).success;
}

function isValidStxNetworkAddress(address: string, network: NetworkConfiguration) {
  return z.string().check(stxAddressNetworkValidator(network)).safeParse(address).success;
}

describe(stxAddressValidator.name, () => {
  describe('standard principals', () => {
    it('validates mainnet standard principals', () => {
      expect(isValidStxAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7')).toBeTruthy();
      expect(isValidStxAddress('SP000000000000000000002Q6VF78')).toBeTruthy();
    });

    it('validates testnet standard principals', () => {
      expect(isValidStxAddress('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')).toBeTruthy();
      expect(isValidStxAddress('ST000000000000000000002AMW42H')).toBeTruthy();
    });

    it('rejects invalid standard principals', () => {
      expect(isValidStxAddress('invalid')).toBeFalsy();
      expect(isValidStxAddress('1234567890')).toBeFalsy();
      expect(isValidStxAddress('SP')).toBeFalsy();
    });
  });

  describe('contract principals', () => {
    it('validates mainnet contract principals', () => {
      expect(
        isValidStxAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.token-contract')
      ).toBeTruthy();
      expect(isValidStxAddress('SP000000000000000000002Q6VF78.contract-name')).toBeTruthy();
    });

    it('validates testnet contract principals', () => {
      expect(
        isValidStxAddress('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token-contract')
      ).toBeTruthy();
      expect(isValidStxAddress('ST000000000000000000002AMW42H.contract-name')).toBeTruthy();
    });

    it('rejects contract principals with invalid contract names', () => {
      const contractNameOver128Chars = 'a'.repeat(129);
      expect(
        isValidStxAddress(`SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.${contractNameOver128Chars}`)
      ).toBeFalsy();
    });

    it('rejects contract principals with invalid addresses', () => {
      expect(isValidStxAddress('invalid-address.token-contract')).toBeFalsy();
      expect(isValidStxAddress('SP.token-contract')).toBeFalsy();
    });

    it('validates contract names up to 128 characters', () => {
      const contractNameExactly128Chars = 'a'.repeat(128);
      expect(
        isValidStxAddress(
          `SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.${contractNameExactly128Chars}`
        )
      ).toBeTruthy();
    });
  });
});

describe(stxAddressNetworkValidator.name, () => {
  function createNetworkWithStacksChainId(chainId: number): NetworkConfiguration {
    const network = defaultNetworksKeyedById.mainnet;
    return {
      ...network,
      chain: { ...network.chain, stacks: { ...network.chain.stacks, chainId } },
    };
  }

  const mainnetNetwork = createNetworkWithStacksChainId(1);

  const testnetNetwork = createNetworkWithStacksChainId(2147483648);

  const customChainIdNetwork = createNetworkWithStacksChainId(256);

  describe('standard principals', () => {
    it('validates mainnet addresses on mainnet network', () => {
      expect(
        isValidStxNetworkAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7', mainnetNetwork)
      ).toBeTruthy();
    });

    it('validates testnet addresses on testnet network', () => {
      expect(
        isValidStxNetworkAddress('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', testnetNetwork)
      ).toBeTruthy();
    });

    it('rejects testnet addresses on mainnet network', () => {
      expect(
        isValidStxNetworkAddress('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', mainnetNetwork)
      ).toBeFalsy();
    });

    it('rejects mainnet addresses on testnet network', () => {
      expect(
        isValidStxNetworkAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7', testnetNetwork)
      ).toBeFalsy();
    });

    it('validates testnet addresses on a network with an unknown custom chain id', () => {
      expect(
        isValidStxNetworkAddress('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', customChainIdNetwork)
      ).toBeTruthy();
    });

    it('rejects mainnet addresses on a network with an unknown custom chain id', () => {
      expect(
        isValidStxNetworkAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7', customChainIdNetwork)
      ).toBeFalsy();
    });
  });

  describe('contract principals', () => {
    it('validates mainnet contract principals on mainnet network', () => {
      expect(
        isValidStxNetworkAddress(
          'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.token-contract',
          mainnetNetwork
        )
      ).toBeTruthy();
    });

    it('validates testnet contract principals on testnet network', () => {
      expect(
        isValidStxNetworkAddress(
          'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token-contract',
          testnetNetwork
        )
      ).toBeTruthy();
    });

    it('rejects testnet contract principals on mainnet network', () => {
      expect(
        isValidStxNetworkAddress(
          'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token-contract',
          mainnetNetwork
        )
      ).toBeFalsy();
    });

    it('rejects mainnet contract principals on testnet network', () => {
      expect(
        isValidStxNetworkAddress(
          'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.token-contract',
          testnetNetwork
        )
      ).toBeFalsy();
    });

    it('handles malformed contract principals gracefully', () => {
      expect(isValidStxNetworkAddress('invalid.contract', mainnetNetwork)).toBeFalsy();
      expect(isValidStxNetworkAddress('SP.', mainnetNetwork)).toBeFalsy();
      expect(isValidStxNetworkAddress('.contract', mainnetNetwork)).toBeFalsy();
    });
  });
});
