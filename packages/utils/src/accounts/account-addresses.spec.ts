import { hasBitcoinAddress, hasStacksAddress } from './account-addresses';

describe(hasBitcoinAddress.name, () => {
  const mockId = { fingerprint: '123', accountIndex: 0 };
  it('returns true when bitcoin info exists', () => {
    const accountWithBitcoinInfo = {
      id: mockId,
      bitcoin: {
        taprootDescriptor: 'tr(xpub123)',
        nativeSegwitDescriptor: 'wpkh(xpub456)',
      },
    };
    expect(hasBitcoinAddress(accountWithBitcoinInfo)).toBe(true);
  });

  it('returns false when bitcoin info is missing', () => {
    const accountWithoutBitcoinInfo = {
      id: mockId,
    };
    expect(hasBitcoinAddress(accountWithoutBitcoinInfo)).toBe(false);
  });
});

describe(hasStacksAddress.name, () => {
  const mockId = { fingerprint: '123', accountIndex: 0 };
  it('returns true when stacks info exists', () => {
    const accountWithStacksInfo = {
      id: mockId,
      stacks: {
        stxAddress: 'ST123',
      },
    };
    expect(hasStacksAddress(accountWithStacksInfo)).toBe(true);
  });

  it('returns false when stacks info is missing', () => {
    const accountWithoutStacksInfo = {
      id: mockId,
    };
    expect(hasStacksAddress(accountWithoutStacksInfo)).toBe(false);
  });
});
