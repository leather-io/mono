import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';

import { compileWshDescriptor } from '@leather.io/bitcoin';
import type { HardwareWalletInteraction, OperationContext } from '@leather.io/ledger';
import { makeFakeHardwareBitcoinSigner } from '@leather.io/ledger/test-utils';

import { useSignLedgerDescriptorTx } from './use-sign-ledger-descriptor-tx';

const mocks = vi.hoisted(() => ({
  signPsbt: vi.fn(),
  addNonWitnessUtxo: vi.fn(),
  loggerWarn: vi.fn(),
  toDeviceBusyStep: vi.fn(),
  toAwaitingDeviceOperation: vi.fn(),
}));

vi.mock('@shared/logger', () => ({
  logger: { warn: mocks.loggerWarn },
}));

vi.mock('@app/features/ledger/flow/ledger-flow.context', () => ({
  useLedgerSteps: () => ({
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
  useCurrentAccountNativeSegwitPayer:
    () =>
    ({ changeIndex, addressIndex }: { changeIndex: number; addressIndex: number }) => ({
      publicKey: requireDefined(
        accountKeychain.deriveChild(changeIndex).deriveChild(addressIndex).publicKey
      ),
    }),
  useUpdateLedgerSpecificNativeSegwitUtxoHexForAdddressIndexZero: () => mocks.addNonWitnessUtxo,
}));

vi.mock('@app/store/accounts/blockchain/bitcoin/taproot-account.hooks', () => ({
  useCurrentAccountTaprootPayer: () => undefined,
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

const masterFingerprintHex = 'deadbeef';
const accountKeyOrigin = `${masterFingerprintHex}/84'/0'/0'`;
const accountKeychain = makeNativeSegwitAccountKeychain(1);
const accountAddressIndexKey = accountKeychain.deriveChild(0).deriveChild(0);
const cosignerXpub = makeNativeSegwitAccountKeychain(2).publicExtendedKey;
const multiSigDescriptor = `wsh(multi(2,${cosignerXpub}/0/0,${accountKeychain.publicExtendedKey}/0/0))`;
const signingConfig = [{ index: 0, derivationPath: "m/84'/0'/0'/0/0" }];
const ledgerDescriptor = `wsh(multi(2,${cosignerXpub}/0/0,[${accountKeyOrigin}]${accountKeychain.publicExtendedKey}/0/0))`;

function buildDescriptorTx(descriptor: string) {
  const { scriptPubKey, witnessScript } = compileWshDescriptor(descriptor);
  const tx = new btc.Transaction({ allowUnknownInputs: true });
  tx.addInput({
    txid: new Uint8Array(32),
    index: 0,
    witnessUtxo: { script: scriptPubKey, amount: 20_000n },
    witnessScript,
  });
  tx.addOutput({
    script: btc.p2wpkh(requireDefined(accountAddressIndexKey.publicKey)).script,
    amount: 18_000n,
  });
  return tx;
}

describe(useSignLedgerDescriptorTx.name, () => {
  let signTx: ReturnType<typeof useSignLedgerDescriptorTx>;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.addNonWitnessUtxo.mockResolvedValue(undefined);
    mocks.signPsbt.mockImplementation(({ psbt }: { psbt: Uint8Array }) => Promise.resolve(psbt));
    signTx = useSignLedgerDescriptorTx();
  });

  function signLedgerDescriptorTx(ctx: OperationContext = {}) {
    const rawPsbt = buildDescriptorTx(multiSigDescriptor).toPSBT();
    const signer = makeFakeHardwareBitcoinSigner({ signPsbt: mocks.signPsbt });
    return signTx(signer, rawPsbt, multiSigDescriptor, signingConfig, ctx);
  }

  test('signs through the policy built from the account key carrying its origin', async () => {
    const signedTx = await signLedgerDescriptorTx();

    expect(mocks.signPsbt).toHaveBeenCalledOnce();
    const signPsbtCall: unknown[] = mocks.signPsbt.mock.calls[0];
    const [args] = signPsbtCall;
    expect(args).toMatchObject({
      network: 'mainnet',
      policyDescriptor: ledgerDescriptor,
      inputsToSign: [
        {
          index: 0,
          derivationPath: "m/84'/0'/0'/0/0",
          publicKey: requireDefined(accountAddressIndexKey.publicKey),
        },
      ],
    });
    expect(args).toHaveProperty('psbt', expect.any(Uint8Array));
    expect(signedTx).toBeInstanceOf(btc.Transaction);
    expect(mocks.addNonWitnessUtxo).toHaveBeenCalledWith(expect.anything(), signingConfig);
  });

  test('still signs when adding the non-witness utxo fails', async () => {
    mocks.addNonWitnessUtxo.mockRejectedValue(new Error('tx hex lookup failed'));

    await signLedgerDescriptorTx();

    expect(mocks.loggerWarn).toHaveBeenCalledWith(
      'Failed to add non-witness UTXO; Ledger will sign with unverified inputs warning'
    );
    expect(mocks.signPsbt).toHaveBeenCalledOnce();
  });

  test('maps device interactions onto the policy prompt and the approval screen', async () => {
    const onInteraction = vi.fn();
    mocks.signPsbt.mockImplementation(
      ({ psbt }: { psbt: Uint8Array }, ctx: OperationContext): Promise<Uint8Array> => {
        const interactions: HardwareWalletInteraction[] = [
          { type: 'approve-policy' },
          { type: 'confirm-on-device' },
        ];
        interactions.forEach(interaction => ctx.onInteraction?.(interaction));
        return Promise.resolve(psbt);
      }
    );

    await signLedgerDescriptorTx({ onInteraction });

    expect(mocks.toDeviceBusyStep).toHaveBeenCalledWith(
      'Approve the Leather wallet policy on your Ledger…'
    );
    expect(mocks.toAwaitingDeviceOperation).toHaveBeenCalledWith({ hasApprovedOperation: false });
    expect(onInteraction).toHaveBeenCalledTimes(2);
  });

  test('refuses a descriptor the current account is not part of', async () => {
    const foreignDescriptor = `wsh(multi(2,${cosignerXpub}/0/0,${makeNativeSegwitAccountKeychain(3).publicExtendedKey}/0/0))`;
    const rawPsbt = buildDescriptorTx(foreignDescriptor).toPSBT();

    await expect(
      signTx(makeFakeHardwareBitcoinSigner(), rawPsbt, foreignDescriptor, signingConfig, {})
    ).rejects.toThrow('Current account is not part of this descriptor');
  });
});
