import {
  isFtNameLikeStx,
  stacksValue,
  validateAddressChain,
  validateStacksAddress,
} from '@app/common/stacks-utils';

const uSTX_AMOUNT = 10000480064; // 10,000.480064

describe('stacksValue tests', () => {
  test('no extra params', () => {
    const value = stacksValue({
      value: uSTX_AMOUNT,
    });
    expect(value).toEqual('10,000.480064 STX');
  });
  test('without ticker', () => {
    const value = stacksValue({
      value: uSTX_AMOUNT,
      withTicker: false,
    });
    expect(value).toEqual('10,000.480064');
  });
  test('without fixed decimals', () => {
    const value = stacksValue({
      value: uSTX_AMOUNT,
      fixedDecimals: false,
    });
    expect(value).toEqual('10,000.48 STX');
  });
  test('abbreviated', () => {
    const value = stacksValue({
      value: uSTX_AMOUNT,
      abbreviate: true,
    });
    expect(value).toEqual('10K STX');
  });
});

describe(isFtNameLikeStx.name, () => {
  it('detect impersonating token names', () => {
    expect(isFtNameLikeStx('STX')).toBeTruthy();
    expect(isFtNameLikeStx('stx')).toBeTruthy();
    expect(isFtNameLikeStx('stacks')).toBeTruthy();
    expect(isFtNameLikeStx('Stäcks')).toBeTruthy();
    expect(isFtNameLikeStx('Stácks')).toBeTruthy();
    expect(isFtNameLikeStx('Stáçks')).toBeTruthy();
    expect(isFtNameLikeStx('stocks')).toBeFalsy();
    expect(isFtNameLikeStx('miamicoin')).toBeFalsy();
    expect(isFtNameLikeStx('')).toBeFalsy();
  });
});

describe(validateStacksAddress.name, () => {
  describe('standard principals', () => {
    it('validates mainnet standard principals', () => {
      expect(validateStacksAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7')).toBeTruthy();
      expect(validateStacksAddress('SP000000000000000000002Q6VF78')).toBeTruthy();
    });

    it('validates testnet standard principals', () => {
      expect(validateStacksAddress('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')).toBeTruthy();
      expect(validateStacksAddress('ST000000000000000000002AMW42H')).toBeTruthy();
    });

    it('rejects invalid standard principals', () => {
      expect(validateStacksAddress('invalid')).toBeFalsy();
      expect(validateStacksAddress('')).toBeFalsy();
      expect(validateStacksAddress('1234567890')).toBeFalsy();
      expect(validateStacksAddress('SP')).toBeFalsy();
    });
  });

  describe('contract principals', () => {
    it('validates mainnet contract principals', () => {
      expect(
        validateStacksAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.token-contract')
      ).toBeTruthy();
      expect(validateStacksAddress('SP000000000000000000002Q6VF78.contract-name')).toBeTruthy();
    });

    it('validates testnet contract principals', () => {
      expect(
        validateStacksAddress('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token-contract')
      ).toBeTruthy();
      expect(validateStacksAddress('ST000000000000000000002AMW42H.contract-name')).toBeTruthy();
    });

    it('rejects contract principals with invalid contract names', () => {
      const contractNameOver128Chars = 'a'.repeat(129);
      expect(
        validateStacksAddress(
          `SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.${contractNameOver128Chars}`
        )
      ).toBeFalsy();
    });

    it('rejects contract principals with invalid addresses', () => {
      expect(validateStacksAddress('invalid-address.token-contract')).toBeFalsy();
      expect(validateStacksAddress('SP.token-contract')).toBeFalsy();
    });

    it('validates contract names up to 128 characters', () => {
      const contractNameExactly128Chars = 'a'.repeat(128);
      expect(
        validateStacksAddress(
          `SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.${contractNameExactly128Chars}`
        )
      ).toBeTruthy();
    });
  });
});

describe(validateAddressChain.name, () => {
  const mainnetNetwork = {
    chain: { stacks: { chainId: 1 as const } },
  } as any;

  const testnetNetwork = {
    chain: { stacks: { chainId: 2147483648 as const } },
  } as any;

  describe('standard principals', () => {
    it('validates mainnet addresses on mainnet network', () => {
      expect(
        validateAddressChain('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7', mainnetNetwork)
      ).toBeTruthy();
    });

    it('validates testnet addresses on testnet network', () => {
      expect(
        validateAddressChain('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', testnetNetwork)
      ).toBeTruthy();
    });

    it('rejects testnet addresses on mainnet network', () => {
      expect(
        validateAddressChain('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', mainnetNetwork)
      ).toBeFalsy();
    });

    it('rejects mainnet addresses on testnet network', () => {
      expect(
        validateAddressChain('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7', testnetNetwork)
      ).toBeFalsy();
    });
  });

  describe('contract principals', () => {
    it('validates mainnet contract principals on mainnet network', () => {
      expect(
        validateAddressChain(
          'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.token-contract',
          mainnetNetwork
        )
      ).toBeTruthy();
    });

    it('validates testnet contract principals on testnet network', () => {
      expect(
        validateAddressChain(
          'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token-contract',
          testnetNetwork
        )
      ).toBeTruthy();
    });

    it('rejects testnet contract principals on mainnet network', () => {
      expect(
        validateAddressChain(
          'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token-contract',
          mainnetNetwork
        )
      ).toBeFalsy();
    });

    it('rejects mainnet contract principals on testnet network', () => {
      expect(
        validateAddressChain(
          'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.token-contract',
          testnetNetwork
        )
      ).toBeFalsy();
    });

    it('handles malformed contract principals gracefully', () => {
      expect(validateAddressChain('invalid.contract', mainnetNetwork)).toBeFalsy();
      expect(validateAddressChain('SP.', mainnetNetwork)).toBeFalsy();
      expect(validateAddressChain('.contract', mainnetNetwork)).toBeFalsy();
    });
  });
});
