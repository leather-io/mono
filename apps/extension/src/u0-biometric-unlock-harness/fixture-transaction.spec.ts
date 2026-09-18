import { base64urlnopad } from '@scure/base';

import {
  persistFixtureStateAtomically,
  prepareFixtureState,
  validateFixtureState,
} from './fixture-transaction';

const credentialConfig = {
  credentialId: base64urlnopad.encode(new Uint8Array([1, 2, 3, 4])),
  prfInput: base64urlnopad.encode(new Uint8Array(32).fill(5)),
  registrationTag: 'ABC234',
};

describe(prepareFixtureState.name, () => {
  test('wraps a fresh 48-byte wallet encryption key and validates the encrypted wallet', async () => {
    const prfOutput = new Uint8Array(32).fill(7);
    const state = await prepareFixtureState(credentialConfig, prfOutput);

    expect(base64urlnopad.decode(state.platformUnlock.iv)).toHaveLength(12);
    expect(base64urlnopad.decode(state.platformUnlock.wrappedEncryptionKey)).toHaveLength(112);
    await expect(validateFixtureState(state, prfOutput)).resolves.toBe(true);
  });

  test('produces distinct wrapper material for separate fixture transactions', async () => {
    const prfOutput = new Uint8Array(32).fill(8);
    const first = await prepareFixtureState(credentialConfig, prfOutput);
    const second = await prepareFixtureState(credentialConfig, prfOutput);

    expect(first.platformUnlock.iv).not.toBe(second.platformUnlock.iv);
    expect(first.platformUnlock.wrappedEncryptionKey).not.toBe(
      second.platformUnlock.wrappedEncryptionKey
    );
    expect(first.encryptedWallet.encryptedSecretKey).not.toBe(
      second.encryptedWallet.encryptedSecretKey
    );
  });

  test('fails validation for wrong PRF output or authenticated metadata tampering', async () => {
    const prfOutput = new Uint8Array(32).fill(9);
    const state = await prepareFixtureState(credentialConfig, prfOutput);
    const wrongPrfOutput = new Uint8Array(32).fill(10);
    const tamperedCredential = structuredClone(state);
    tamperedCredential.platformUnlock.credentialId = base64urlnopad.encode(
      new Uint8Array([9, 9, 9])
    );
    const tamperedCiphertext = structuredClone(state);
    const tamperedRegistrationTag = structuredClone(state);
    tamperedRegistrationTag.platformUnlock.registrationTag = 'XYZ789';
    const wrapped = base64urlnopad.decode(tamperedCiphertext.platformUnlock.wrappedEncryptionKey);
    wrapped[0] ^= 1;
    tamperedCiphertext.platformUnlock.wrappedEncryptionKey = base64urlnopad.encode(wrapped);

    await expect(validateFixtureState(state, wrongPrfOutput)).resolves.toBe(false);
    await expect(validateFixtureState(tamperedCredential, prfOutput)).resolves.toBe(false);
    await expect(validateFixtureState(tamperedRegistrationTag, prfOutput)).resolves.toBe(false);
    await expect(validateFixtureState(tamperedCiphertext, prfOutput)).resolves.toBe(false);
  });
});

describe(persistFixtureStateAtomically.name, () => {
  test('initializes session state only after the complete persisted write succeeds', async () => {
    const state = await prepareFixtureState(credentialConfig, new Uint8Array(32).fill(11));
    const order: string[] = [];

    await persistFixtureStateAtomically(state, {
      initialize() {
        order.push('initialize');
        return Promise.resolve();
      },
      persist() {
        order.push('persist');
        return Promise.resolve();
      },
    });

    expect(order).toEqual(['persist', 'initialize']);
  });

  test('does not initialize session state when persistence fails', async () => {
    const state = await prepareFixtureState(credentialConfig, new Uint8Array(32).fill(12));
    const initialize = vi.fn();

    await expect(
      persistFixtureStateAtomically(state, {
        initialize() {
          initialize();
          return Promise.resolve();
        },
        persist() {
          return Promise.reject(new Error('forced persistence failure'));
        },
      })
    ).rejects.toThrowError('forced persistence failure');
    expect(initialize).not.toHaveBeenCalled();
  });
});
