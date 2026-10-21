import type * as ReactModule from 'react';

import { HDKey } from '@scure/bip32';

import { useHardwareBitcoinInputsToSign } from './use-hardware-bitcoin-inputs-to-sign';

vi.mock('react', async importOriginal => {
  const actual = await importOriginal<typeof ReactModule>();
  return {
    ...actual,
    useMemo<T>(factory: () => T) {
      return factory();
    },
    useCallback<T>(callback: T) {
      return callback;
    },
  };
});

vi.mock('react-redux', () => ({
  useSelector: () => () => testAccount,
}));

vi.mock('@app/store/networks/networks.selectors', () => ({
  useCurrentNetwork: () => ({ chain: { bitcoin: { mode: 'mainnet' } } }),
}));

vi.mock('@app/store/in-memory-key/use-in-memory-keys', () => ({
  useInMemoryKeys: () => ({ version: 0 }),
}));

vi.mock('@app/store/software-keys/software-key.selectors', () => ({
  selectCurrentAccount: () => undefined,
}));

vi.mock('../../account', () => ({
  useCurrentAccountId: () => ({ fingerprint: 'deadbeef', accountIndex: 0 }),
}));

vi.mock('./bitcoin-keychain', () => ({
  selectCurrentNetworkBitcoinAccountLookup: () => () => undefined,
}));

function requireDefined<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Expected value to be defined');
  return value;
}

const accountKeychain = HDKey.fromMasterSeed(new Uint8Array(32).fill(1)).derive("m/84'/0'/0'");
const masterFingerprintHex = 'deadbeef';

const testAccount = {
  keychain: accountKeychain,
  keyOrigin: `${masterFingerprintHex}/84'/0'/0'`,
  masterKeyFingerprint: masterFingerprintHex,
};

function publicKeyAt(changeIndex: number, addressIndex: number) {
  return requireDefined(
    accountKeychain.deriveChild(changeIndex).deriveChild(addressIndex).publicKey
  );
}

describe(useHardwareBitcoinInputsToSign.name, () => {
  test('pairs each input with the public key derived at its path', () => {
    const toInputsToSign = useHardwareBitcoinInputsToSign();

    const inputs = toInputsToSign([
      { index: 0, derivationPath: "m/84'/0'/0'/0/0" },
      { index: 2, derivationPath: "m/84'/0'/0'/1/3" },
    ]);

    expect(inputs).toEqual([
      { index: 0, derivationPath: "m/84'/0'/0'/0/0", publicKey: publicKeyAt(0, 0) },
      { index: 2, derivationPath: "m/84'/0'/0'/1/3", publicKey: publicKeyAt(1, 3) },
    ]);
  });

  test('uses the taproot payer for taproot paths', () => {
    const toInputsToSign = useHardwareBitcoinInputsToSign();

    const [input] = toInputsToSign([{ index: 1, derivationPath: "m/86'/0'/0'/0/5" }]);

    expect(input).toMatchObject({ index: 1, derivationPath: "m/86'/0'/0'/0/5" });
    expect(input.publicKey).toHaveLength(33);
  });
});
