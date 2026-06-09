import { HDKey } from '@scure/bip32';
import { Psbt } from 'bitcoinjs-lib';

import { useUpdateLedgerSpecificNativeSegwitBip32DerivationForAdddressIndexZero } from './native-segwit-account.hooks';

vi.mock('react', async importOriginal => {
  const actual = await importOriginal<typeof import('react')>();
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
  useSelector: () => () => testNativeSegwitAccount,
}));

vi.mock('@shared/utils/analytics', () => ({
  analytics: { track: vi.fn() },
}));

vi.mock('@app/query/bitcoin/clients/bitcoin-client', () => ({
  useBitcoinClient: () => ({ transactionsApi: { getBitcoinTransactionHex: vi.fn() } }),
}));

vi.mock('@app/store/networks/networks.selectors', () => ({
  useCurrentNetwork: () => ({ chain: { bitcoin: { mode: 'mainnet' } } }),
}));

vi.mock('@app/store/software-keys/software-key.selectors', () => ({
  selectCurrentAccount: () => undefined,
}));

vi.mock('../../account', () => ({
  useCurrentAccountId: () => ({ fingerprint: 'deadbeef', accountIndex: 0 }),
}));

vi.mock('./bitcoin-keychain', () => ({
  selectCurrentNetworkBitcoinAccountLookup: () => () => undefined,
  useBitcoinExtendedPublicKeyVersions: () => undefined,
}));

function requireDefined<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Expected value to be defined');
  return value;
}

function makeAccountKeychain(seedByte: number) {
  return HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte)).derive("m/84'/0'/0'");
}

const accountKeychain = makeAccountKeychain(1);
const accountPubkey = Buffer.from(
  requireDefined(accountKeychain.deriveChild(0).deriveChild(0).publicKey)
);
const cosignerPubkey = Buffer.from(
  requireDefined(makeAccountKeychain(2).deriveChild(0).deriveChild(0).publicKey)
);
const derivationPath = "m/84'/0'/0'/0/0";
const masterFingerprintHex = 'deadbeef';

const testNativeSegwitAccount = {
  keychain: accountKeychain,
  keyOrigin: `${masterFingerprintHex}/84'/0'/0'`,
  masterKeyFingerprint: masterFingerprintHex,
};

function makePsbtWithOneInput() {
  const psbt = new Psbt();
  psbt.addInput({ hash: '00'.repeat(32), index: 0 });
  return psbt;
}

describe(useUpdateLedgerSpecificNativeSegwitBip32DerivationForAdddressIndexZero.name, () => {
  test('adds the account bip32 derivation when the input has none', () => {
    const updateBip32Derivation =
      useUpdateLedgerSpecificNativeSegwitBip32DerivationForAdddressIndexZero();
    const psbt = makePsbtWithOneInput();

    updateBip32Derivation(psbt, masterFingerprintHex, [{ index: 0, derivationPath }]);

    const entries = requireDefined(psbt.data.inputs[0].bip32Derivation);
    expect(entries).toHaveLength(1);
    expect(entries[0].pubkey.equals(accountPubkey)).toBe(true);
    expect(entries[0].masterFingerprint.toString('hex')).toBe(masterFingerprintHex);
    expect(entries[0].path).toBe(derivationPath);
  });

  test('skips the input when a coordinator already wrote the account derivation', () => {
    const updateBip32Derivation =
      useUpdateLedgerSpecificNativeSegwitBip32DerivationForAdddressIndexZero();
    const psbt = makePsbtWithOneInput();
    psbt.updateInput(0, {
      bip32Derivation: [
        {
          masterFingerprint: Buffer.from('11223344', 'hex'),
          pubkey: accountPubkey,
          path: "m/48'/0'/0'/2'/0/0",
        },
      ],
    });

    updateBip32Derivation(psbt, masterFingerprintHex, [{ index: 0, derivationPath }]);

    const entries = requireDefined(psbt.data.inputs[0].bip32Derivation);
    expect(entries).toHaveLength(1);
    expect(entries[0].masterFingerprint.toString('hex')).toBe('11223344');
  });

  test('adds the account derivation alongside a co-signer derivation', () => {
    const updateBip32Derivation =
      useUpdateLedgerSpecificNativeSegwitBip32DerivationForAdddressIndexZero();
    const psbt = makePsbtWithOneInput();
    psbt.updateInput(0, {
      bip32Derivation: [
        {
          masterFingerprint: Buffer.from('55667788', 'hex'),
          pubkey: cosignerPubkey,
          path: "m/48'/0'/0'/2'/0/0",
        },
      ],
    });

    updateBip32Derivation(psbt, masterFingerprintHex, [{ index: 0, derivationPath }]);

    const entries = requireDefined(psbt.data.inputs[0].bip32Derivation);
    expect(entries).toHaveLength(2);
    expect(entries.some(entry => entry.pubkey.equals(cosignerPubkey))).toBe(true);
    expect(entries.some(entry => entry.pubkey.equals(accountPubkey))).toBe(true);
  });
});
