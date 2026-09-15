import { DeviceActionStatus, UserInteractionRequired } from '@ledgerhq/device-management-kit';
import { RegisteredWallet, WalletPolicy } from '@ledgerhq/device-signer-kit-bitcoin';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';
import { Psbt } from 'bitcoinjs-lib';
import { of } from 'rxjs';

import { compileWshDescriptor } from '@leather.io/bitcoin';

import { fakeSignerAction, makeFakeLedgerBitcoinApp } from '../../utils/ledger-app.mocks';
import { useSignLedgerDescriptorTx } from './use-sign-ledger-descriptor-tx';

const mocks = vi.hoisted(() => ({
  registerWallet: vi.fn(),
  signPsbt: vi.fn(),
  addNonWitnessUtxo: vi.fn(),
  addNativeSegwitBip32Derivation: vi.fn(),
  loggerWarn: vi.fn(),
  toDeviceBusyStep: vi.fn(),
  toAwaitingDeviceOperation: vi.fn(),
}));

vi.mock('@shared/logger', () => ({
  logger: { warn: mocks.loggerWarn },
}));

vi.mock('@app/features/ledger/hooks/use-ledger-navigate', () => ({
  useLedgerNavigate: () => ({
    toDeviceBusyStep: mocks.toDeviceBusyStep,
    toAwaitingDeviceOperation: mocks.toAwaitingDeviceOperation,
  }),
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
const cosignerXpub = makeNativeSegwitAccountKeychain(2).publicExtendedKey;
const multiSigDescriptor = `wsh(multi(2,${cosignerXpub}/0/0,${accountKeychain.publicExtendedKey}/0/0))`;
const signingConfig = [{ index: 0, derivationPath: "m/84'/0'/0'/0/0" }];
const registeredLedgerTemplate = 'wsh(multi(2,@0/**,@1/**))';
const registeredPolicyHmac = new Uint8Array(32).fill(7);

function fakeRegisterWallet(policy: WalletPolicy) {
  return fakeSignerAction(
    new RegisteredWallet(policy.name, policy.descriptorTemplate, policy.keys, registeredPolicyHmac)
  );
}

function makeFakeLedgerApp() {
  return makeFakeLedgerBitcoinApp({
    getMasterFingerprint: () =>
      fakeSignerAction({ masterFingerprint: hexToBytes(masterFingerprintHex) }),
    registerWallet: mocks.registerWallet,
    signPsbt: mocks.signPsbt,
  });
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
  return { inputIndex: 0, pubkey, signature };
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
    mocks.registerWallet.mockImplementation(fakeRegisterWallet);
    const deviceSig = makeDevicePartialSig();
    mocks.signPsbt.mockImplementation((_wallet: unknown, psbtBase64: string) => {
      partialSigPubkeysAtSignTime = Psbt.fromBase64(psbtBase64).data.inputs[0]?.partialSig?.map(
        sig => bytesToHex(sig.pubkey)
      );
      return fakeSignerAction([deviceSig]);
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

  test('strips the stale account signature at the descriptor key path index', async () => {
    const vaultIndexDescriptor = `wsh(multi(2,${cosignerXpub}/0/7,${accountKeychain.publicExtendedKey}/0/7))`;
    const accountVaultIndexKey = accountKeychain.deriveChild(0).deriveChild(7);
    const cosignerVaultIndexKey = makeNativeSegwitAccountKeychain(2).deriveChild(0).deriveChild(7);
    const vaultSigningConfig = [{ index: 0, derivationPath: "m/84'/0'/0'/0/7" }];
    const rawPsbt = buildDescriptorTx(vaultIndexDescriptor, [
      accountVaultIndexKey,
      cosignerVaultIndexKey,
    ]).toPSBT();

    await signTx(makeFakeLedgerApp(), rawPsbt, vaultIndexDescriptor, vaultSigningConfig);

    expect(partialSigPubkeysAtSignTime).toEqual([
      bytesToHex(requireDefined(cosignerVaultIndexKey.publicKey)),
    ]);
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

  test('signs when the psbt carries a foreign input without derivation metadata', async () => {
    const tx = buildDescriptorTx(multiSigDescriptor, []);
    tx.addInput({
      txid: hexToBytes('11'.repeat(32)),
      index: 0,
      witnessUtxo: {
        script: btc.p2wpkh(requireDefined(deriveAddressIndexKey(4).publicKey)).script,
        amount: 30_000n,
      },
    });

    const signedTx = await signTx(
      makeFakeLedgerApp(),
      tx.toPSBT(),
      multiSigDescriptor,
      signingConfig
    );

    expect(hasPartialSigFor(signedTx, 0, requireDefined(accountAddressIndexKey.publicKey))).toBe(
      true
    );
    expect(signedTx.getInput(1).partialSig).toBeUndefined();
  });

  test('registers the Leather policy with the account key carrying its origin', async () => {
    await signLedgerDescriptorTx([]);

    expect(mocks.registerWallet).toHaveBeenCalledTimes(1);
    const [policy, options] = mocks.registerWallet.mock.calls[0];
    expect(policy).toBeInstanceOf(WalletPolicy);
    expect(policy).toMatchObject({
      name: 'Leather',
      descriptorTemplate: registeredLedgerTemplate,
      keys: [cosignerXpub, `[${accountKeyOrigin}]${accountKeychain.publicExtendedKey}`],
    });
    expect(options).toEqual({ skipOpenApp: true });
    expect(mocks.addNativeSegwitBip32Derivation).toHaveBeenCalledWith(
      expect.anything(),
      masterFingerprintHex,
      signingConfig
    );
  });

  test('signs with the registered wallet returned by the device', async () => {
    await signLedgerDescriptorTx([]);

    expect(mocks.signPsbt).toHaveBeenCalledTimes(1);
    const [wallet, psbtBase64, options] = mocks.signPsbt.mock.calls[0];
    expect(wallet).toBeInstanceOf(RegisteredWallet);
    expect(wallet).toMatchObject({
      name: 'Leather',
      descriptorTemplate: registeredLedgerTemplate,
      hmac: registeredPolicyHmac,
    });
    expect(typeof psbtBase64).toBe('string');
    expect(options).toEqual({ skipOpenApp: true });
    expect(mocks.toAwaitingDeviceOperation).toHaveBeenCalledWith({ hasApprovedOperation: false });
  });

  test('shows the register-wallet prompt while the device awaits policy approval', async () => {
    mocks.registerWallet.mockImplementation((policy: WalletPolicy) => ({
      observable: of(
        {
          status: DeviceActionStatus.Pending,
          intermediateValue: { requiredUserInteraction: UserInteractionRequired.RegisterWallet },
        },
        {
          status: DeviceActionStatus.Completed,
          output: new RegisteredWallet(
            policy.name,
            policy.descriptorTemplate,
            policy.keys,
            registeredPolicyHmac
          ),
        }
      ),
      cancel: vi.fn(),
    }));

    await signLedgerDescriptorTx([]);

    expect(mocks.toDeviceBusyStep).toHaveBeenCalledWith(
      'Approve the Leather wallet policy on your Ledger…'
    );
  });
});
