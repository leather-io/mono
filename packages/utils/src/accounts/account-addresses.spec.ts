import { AccountId } from '@leather.io/models';

import { createAccountAddresses, hasBitcoinAddress, hasStacksAddress } from './account-addresses';

describe(createAccountAddresses.name, () => {
  const mockAccountId: AccountId = {
    fingerprint: 'test-fingerprint',
    accountIndex: 0,
  };
  const mockBtcDescriptors = ['tr(xpub123)', 'wpkh(xpub456)'];
  const mockStxAddress = 'ST123TEST';

  it('creates account addresses with only account id when no descriptors or stx address provided', () => {
    const result = createAccountAddresses(mockAccountId);
    expect(result).toEqual({
      id: mockAccountId,
    });
  });

  it('creates account addresses with bitcoin info when valid descriptors provided', () => {
    const result = createAccountAddresses(mockAccountId, mockBtcDescriptors);
    expect(result).toEqual({
      id: mockAccountId,
      bitcoin: {
        taprootDescriptor: 'tr(xpub123)',
        nativeSegwitDescriptor: 'wpkh(xpub456)',
      },
    });
  });

  it('creates account addresses with stacks info when stx address provided', () => {
    const result = createAccountAddresses(mockAccountId, [], mockStxAddress);
    expect(result).toEqual({
      id: mockAccountId,
      stacks: {
        stxAddress: mockStxAddress,
      },
    });
  });

  it('skips bitcoin info if descriptors are incomplete', () => {
    const result = createAccountAddresses(mockAccountId, ['tr(xpub123)']);
    expect(result).toEqual({
      id: mockAccountId,
    });
  });
});

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
