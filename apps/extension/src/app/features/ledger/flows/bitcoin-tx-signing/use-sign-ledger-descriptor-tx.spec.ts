import { type DescriptorInstance } from '@bitcoinerlab/descriptors';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';
import { type Psbt } from 'bitcoinjs-lib';
import AppClient from 'ledger-bitcoin';

import { compileWshDescriptor } from '@leather.io/bitcoin';

import { useSignLedgerDescriptorTx } from './use-sign-ledger-descriptor-tx';

const mocks = vi.hoisted(() => ({
  registerLedgerWallet: vi.fn(),
  signLedger: vi.fn(),
  addNonWitnessUtxo: vi.fn(),
  addNativeSegwitBip32Derivation: vi.fn(),
  loggerWarn: vi.fn(),
}));

vi.mock('@bitcoinerlab/descriptors', async importOriginal => {
  const actual = await importOriginal<typeof import('@bitcoinerlab/descriptors')>();
  return {
    ...actual,
    ledger: { ...actual.ledger, registerLedgerWallet: mocks.registerLedgerWallet },
    signers: { ...actual.signers, signLedger: mocks.signLedger },
  };
});

vi.mock('@shared/logger', () => ({
  logger: { warn: mocks.loggerWarn },
}));

vi.mock('@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks', () => ({
  useCurrentNativeSegwitAccount: () => ({
    keychain: accountKeychain,
    xpub: accountKeychain.publicExtendedKey,
    keyOrigin: accountKeyOrigin,
  }),
  useUpdateLedgerSpecificNativeSegwitBip32DerivationForAdddressIndexZero: () =>
    mocks.addNativeSegwitBip32Derivation,
  useUpdateLedgerSpecificNativeSegwitUtxoHexForAdddressIndexZero: () => mocks.addNonWitnessUtxo,
}));

vi.mock('@app/store/networks/networks.selectors', () => ({
  useCurrentNetwork: () => ({ chain: { bitcoin: { mode: 'mainnet' } } }),
}));

function requireDefined<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Expected value to be defined');
  return value;
}

function makeNativeSegwitAccountKeychain(seedByte: number) {
  return HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte)).derive("m/84'/0'/0'");
}

function deriveAddressIndexKey(seedByte: number) {
  return makeNativeSegwitAccountKeychain(seedByte).deriveChild(0).deriveChild(0);
}

const masterFingerprintHex = 'deadbeef';
const accountKeyOrigin = `${masterFingerprintHex}/84'/0'/0'`;
const accountKeychain = makeNativeSegwitAccountKeychain(1);
const accountAddressIndexKey = deriveAddressIndexKey(1);
const cosignerAddressIndexKey = deriveAddressIndexKey(2);
const multiSigDescriptor = `wsh(multi(2,${makeNativeSegwitAccountKeychain(2).publicExtendedKey}/0/0,${accountKeychain.publicExtendedKey}/0/0))`;
const signingConfig = [{ index: 0, derivationPath: "m/84'/0'/0'/0/0" }];

function makeFakeLedgerApp(): AppClient {
  const app: AppClient = Object.create(AppClient.prototype);
  app.getMasterFingerprint = () => Promise.resolve(masterFingerprintHex);
  return app;
}

function buildDescriptorTx(descriptor: string, signWith: HDKey[]) {
  const { scriptPubKey, witnessScript } = compileWshDescriptor(descriptor);
  const tx = new btc.Transaction({ allowUnknownInputs: true });
  tx.addInput({
    txid: hexToBytes('00'.repeat(32)),
    index: 0,
    witnessUtxo: { script: scriptPubKey, amount: 20_000n },
    witnessScript,
  });
  tx.addOutput({
    script: btc.p2wpkh(requireDefined(deriveAddressIndexKey(3).publicKey)).script,
    amount: 18_000n,
  });
  for (const key of signWith) tx.signIdx(requireDefined(key.privateKey), 0);
  return tx;
}

// The signature the device would produce: signing is deterministic (RFC 6979),
// so signing the same tx with the account key yields the exact bytes a real
// device merge would.
function makeDevicePartialSig() {
  const tx = buildDescriptorTx(multiSigDescriptor, [accountAddressIndexKey]);
  const [pubkey, signature] = requireDefined(tx.getInput(0).partialSig)[0];
  return { pubkey: Buffer.from(pubkey), signature: Buffer.from(signature) };
}

function hasPartialSigFor(tx: btc.Transaction, inputIndex: number, publicKey: Uint8Array) {
  const pubkeyHex = bytesToHex(publicKey);
  return tx.getInput(inputIndex).partialSig?.some(([pubkey]) => bytesToHex(pubkey) === pubkeyHex);
}

describe(useSignLedgerDescriptorTx.name, () => {
  let partialSigPubkeysAtSignTime: string[] | undefined;
  let signTx: ReturnType<typeof useSignLedgerDescriptorTx>;

  beforeEach(() => {
    vi.clearAllMocks();
    partialSigPubkeysAtSignTime = undefined;
    mocks.addNonWitnessUtxo.mockResolvedValue(undefined);
    mocks.registerLedgerWallet.mockResolvedValue(undefined);
    const deviceSig = makeDevicePartialSig();
    mocks.signLedger.mockImplementation(({ psbt }: { psbt: Psbt }) => {
      partialSigPubkeysAtSignTime = psbt.data.inputs[0].partialSig?.map(sig =>
        sig.pubkey.toString('hex')
      );
      psbt.updateInput(0, { partialSig: [deviceSig] });
      return Promise.resolve();
    });
    signTx = useSignLedgerDescriptorTx();
  });

  function signLedgerDescriptorTx(signWith: HDKey[]) {
    const rawPsbt = buildDescriptorTx(multiSigDescriptor, signWith).toPSBT();
    return signTx(makeFakeLedgerApp(), rawPsbt, multiSigDescriptor, signingConfig);
  }

  test('signs a psbt with no existing signatures', async () => {
    const signedTx = await signLedgerDescriptorTx([]);

    expect(partialSigPubkeysAtSignTime).toBeUndefined();
    expect(hasPartialSigFor(signedTx, 0, requireDefined(accountAddressIndexKey.publicKey))).toBe(
      true
    );
  });

  test('leaves a co-signer signature untouched when the account has not signed', async () => {
    const signedTx = await signLedgerDescriptorTx([cosignerAddressIndexKey]);

    expect(partialSigPubkeysAtSignTime).toEqual([
      bytesToHex(requireDefined(cosignerAddressIndexKey.publicKey)),
    ]);
    expect(hasPartialSigFor(signedTx, 0, requireDefined(accountAddressIndexKey.publicKey))).toBe(
      true
    );
    expect(hasPartialSigFor(signedTx, 0, requireDefined(cosignerAddressIndexKey.publicKey))).toBe(
      true
    );
  });

  test('strips only the stale account signature, keeping the co-signer signature', async () => {
    const signedTx = await signLedgerDescriptorTx([
      accountAddressIndexKey,
      cosignerAddressIndexKey,
    ]);

    expect(partialSigPubkeysAtSignTime).toEqual([
      bytesToHex(requireDefined(cosignerAddressIndexKey.publicKey)),
    ]);
    expect(hasPartialSigFor(signedTx, 0, requireDefined(accountAddressIndexKey.publicKey))).toBe(
      true
    );
    expect(hasPartialSigFor(signedTx, 0, requireDefined(cosignerAddressIndexKey.publicKey))).toBe(
      true
    );
  });

  test('removes the partialSig field entirely when only the account had signed', async () => {
    const signedTx = await signLedgerDescriptorTx([accountAddressIndexKey]);

    expect(partialSigPubkeysAtSignTime).toBeUndefined();
    expect(hasPartialSigFor(signedTx, 0, requireDefined(accountAddressIndexKey.publicKey))).toBe(
      true
    );
  });

  test('still signs when adding the non-witness utxo fails', async () => {
    mocks.addNonWitnessUtxo.mockRejectedValue(new Error('tx hex lookup failed'));

    const signedTx = await signLedgerDescriptorTx([]);

    expect(mocks.loggerWarn).toHaveBeenCalledWith(
      'Failed to add non-witness UTXO; Ledger will sign with unverified inputs warning'
    );
    expect(hasPartialSigFor(signedTx, 0, requireDefined(accountAddressIndexKey.publicKey))).toBe(
      true
    );
  });

  test('registers a ledger policy with the account key rewritten to carry its origin', async () => {
    let registered:
      | { descriptor: DescriptorInstance; policyName: string; ledgerClient: AppClient }
      | undefined;
    mocks.registerLedgerWallet.mockImplementation(
      (args: { descriptor: DescriptorInstance; policyName: string; ledgerClient: AppClient }) => {
        registered = args;
        return Promise.resolve();
      }
    );

    await signLedgerDescriptorTx([]);

    const { policyName, descriptor } = requireDefined(registered);
    expect(policyName).toEqual('Leather');
    const { expansionMap } = descriptor.expand();
    const accountPubkeyHex = bytesToHex(requireDefined(accountAddressIndexKey.publicKey));
    const accountKeyInfo = requireDefined(
      Object.values(requireDefined(expansionMap)).find(
        key => key.pubkey && bytesToHex(key.pubkey) === accountPubkeyHex
      )
    );
    expect(accountKeyInfo.keyExpression.startsWith(`[${accountKeyOrigin}]`)).toBe(true);
    expect(requireDefined(accountKeyInfo.masterFingerprint).toString('hex')).toEqual(
      masterFingerprintHex
    );
    expect(mocks.addNativeSegwitBip32Derivation).toHaveBeenCalledWith(
      expect.anything(),
      masterFingerprintHex,
      signingConfig
    );
  });
});
