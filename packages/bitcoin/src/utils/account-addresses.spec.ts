import { AccountId } from '@leather.io/models';

import { createAccountAddresses } from './account-addresses';

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
