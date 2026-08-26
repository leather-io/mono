import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { createBase58check } from '@scure/base';
import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';
import { Psbt } from 'bitcoinjs-lib';

import { compileWshDescriptor } from '@leather.io/bitcoin';
import { fingerprintAsNumberToHex } from '@leather.io/crypto';

import { useSignDescriptorPsbt } from './descriptor-psbt.hooks';

const mocks = vi.hoisted(() => {
  const walletState: { walletType: 'software' | 'ledger' } = { walletType: 'software' };
  return {
    walletState,
    signPsbt: vi.fn(),
    toConnectAndSignBitcoinTransactionStep: vi.fn(),
    listenForBitcoinTxLedgerSigning: vi.fn(),
  };
});

vi.mock('react-router', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useLocation: () => ({ pathname: '/' }) };
});

vi.mock('@app/common/use-wallet-type', () => ({
  useWalletType: () => ({
    walletType: mocks.walletState.walletType,
    whenWallet<T>(map: { software: T; ledger: T }) {
      return map[mocks.walletState.walletType];
    },
  }),
}));

vi.mock('@app/features/ledger/flows/bitcoin-tx-signing/bitcoin-tx-signing-event-listeners', () => ({
  listenForBitcoinTxLedgerSigning: mocks.listenForBitcoinTxLedgerSigning,
}));

vi.mock('@app/features/ledger/hooks/use-ledger-navigate', () => ({
  useLedgerNavigate: () => ({
    toConnectAndSignBitcoinTransactionStep: mocks.toConnectAndSignBitcoinTransactionStep,
  }),
}));

vi.mock('@app/features/psbt-signer/hooks/use-psbt-signer', () => ({
  usePsbtSigner: () => ({ signPsbt: mocks.signPsbt }),
}));

vi.mock('@app/store/networks/networks.selectors', () => ({
  useCurrentNetwork: () => ({ chain: { bitcoin: { mode: 'mainnet' } } }),
}));

vi.mock('@app/store/accounts/account', () => ({
  useCurrentAccountId: () => ({ fingerprint: 'deadbeef', accountIndex: 0 }),
}));

vi.mock('@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks', () => ({
  useCurrentNativeSegwitAccount: () => ({ keychain: accountKeychain }),
}));

function requireBytes(bytes: Uint8Array | null | undefined) {
  if (!bytes) throw new Error('Expected key bytes to be defined');
  return bytes;
}

function makeNativeSegwitAccountKeychain(seedByte: number) {
  return HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte)).derive("m/84'/0'/0'");
}

function makeFingerprint(fingerprint: number) {
  return hexToBytes(fingerprintAsNumberToHex(fingerprint));
}

function deriveAddressIndexKey(seedByte: number) {
  return makeNativeSegwitAccountKeychain(seedByte).deriveChild(0).deriveChild(0);
}

const accountKeychain = makeNativeSegwitAccountKeychain(1);
const accountAddressIndexKey = deriveAddressIndexKey(1);
const cosignerRootKeychain = HDKey.fromMasterSeed(new Uint8Array(32).fill(2));
const cosignerFingerprint = makeFingerprint(cosignerRootKeychain.fingerprint);
const cosignerAddressIndexKey = deriveAddressIndexKey(2);
const accountDerivationPath = "m/84'/0'/0'/0/0";
const multiSigDescriptor = `wsh(multi(2,${makeNativeSegwitAccountKeychain(2).publicExtendedKey}/0/0,${accountKeychain.publicExtendedKey}/0/0))`;
const rawPubkeyCosignerDescriptor = `wsh(multi(2,${bytesToHex(requireBytes(cosignerAddressIndexKey.publicKey))},${accountKeychain.publicExtendedKey}/0/0))`;
const foreignDescriptor = `wsh(multi(2,${makeNativeSegwitAccountKeychain(2).publicExtendedKey}/0/0,${makeNativeSegwitAccountKeychain(3).publicExtendedKey}/0/0))`;
const vaultIndexDescriptor = `wsh(sortedmulti(2,${makeNativeSegwitAccountKeychain(2).publicExtendedKey}/0/7,${accountKeychain.publicExtendedKey}/0/7))`;
const mixedKeyPathDescriptor = `wsh(multi(2,${makeNativeSegwitAccountKeychain(2).publicExtendedKey}/0/0,${accountKeychain.publicExtendedKey}/0/7))`;
const accountVaultIndexKey = makeNativeSegwitAccountKeychain(1).deriveChild(0).deriveChild(7);
const cosignerVaultIndexKey = makeNativeSegwitAccountKeychain(2).deriveChild(0).deriveChild(7);
const base58check = createBase58check(sha256);

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
    script: btc.p2wpkh(requireBytes(deriveAddressIndexKey(3).publicKey)).script,
    amount: 18_000n,
  });
  for (const key of signWith) tx.signIdx(requireBytes(key.privateKey), 0);
  return tx;
}

function buildDescriptorPsbtHex(descriptor: string, signWith: HDKey[]) {
  return bytesToHex(buildDescriptorTx(descriptor, signWith).toPSBT());
}

function addCosignerXpubMetadata(psbtHex: string) {
  const psbt = Psbt.fromBuffer(hexToBytes(psbtHex));
  psbt.updateGlobal({
    globalXpub: [
      {
        extendedPubkey: base58check.decode(makeNativeSegwitAccountKeychain(2).publicExtendedKey),
        masterFingerprint: cosignerFingerprint,
        path: "m/84'/0'/0'",
      },
    ],
  });
  psbt.updateInput(0, {
    bip32Derivation: [
      {
        masterFingerprint: cosignerFingerprint,
        pubkey: requireBytes(cosignerAddressIndexKey.publicKey),
        path: "m/84'/0'/0'/0/0",
      },
    ],
  });
  return bytesToHex(psbt.toBuffer());
}

function buildNonDescriptorPsbtHex() {
  const key = deriveAddressIndexKey(5);
  const tx = new btc.Transaction();
  tx.addInput({
    txid: hexToBytes('22'.repeat(32)),
    index: 0,
    witnessUtxo: { script: btc.p2wpkh(requireBytes(key.publicKey)).script, amount: 20_000n },
  });
  tx.addOutput({
    script: btc.p2wpkh(requireBytes(deriveAddressIndexKey(6).publicKey)).script,
    amount: 18_000n,
  });
  return bytesToHex(tx.toPSBT());
}

function hasPartialSigFor(tx: btc.Transaction, inputIndex: number, publicKey: Uint8Array) {
  const pubkeyHex = bytesToHex(publicKey);
  return tx.getInput(inputIndex).partialSig?.some(([pubkey]) => bytesToHex(pubkey) === pubkeyHex);
}

describe(useSignDescriptorPsbt.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.walletState.walletType = 'software';
  });

  describe('software signing', () => {
    test('rejects when the wallet signature is missing even though a co-signer already signed', async () => {
      const psbtHex = buildDescriptorPsbtHex(multiSigDescriptor, [cosignerAddressIndexKey]);
      mocks.signPsbt.mockImplementation(({ tx }: { tx: btc.Transaction }) => tx);

      await expect(useSignDescriptorPsbt()(psbtHex, multiSigDescriptor)).rejects.toThrow(
        'Failed to add signature to descriptor input'
      );
    });

    test('rejects when no signature is added at all', async () => {
      const psbtHex = buildDescriptorPsbtHex(multiSigDescriptor, []);
      mocks.signPsbt.mockImplementation(({ tx }: { tx: btc.Transaction }) => tx);

      await expect(useSignDescriptorPsbt()(psbtHex, multiSigDescriptor)).rejects.toThrow(
        'Failed to add signature to descriptor input'
      );
    });

    test('resolves with the signed psbt when the wallet adds its own signature', async () => {
      const psbtHex = buildDescriptorPsbtHex(multiSigDescriptor, [cosignerAddressIndexKey]);
      mocks.signPsbt.mockImplementation(({ tx }: { tx: btc.Transaction }) => {
        tx.signIdx(requireBytes(accountAddressIndexKey.privateKey), 0);
        return tx;
      });

      const signedTx = await useSignDescriptorPsbt()(psbtHex, multiSigDescriptor);

      expect(hasPartialSigFor(signedTx, 0, requireBytes(accountAddressIndexKey.publicKey))).toBe(
        true
      );
      expect(hasPartialSigFor(signedTx, 0, requireBytes(cosignerAddressIndexKey.publicKey))).toBe(
        true
      );
    });

    test('signs at the descriptor key path with the matching derivation path', async () => {
      const psbtHex = buildDescriptorPsbtHex(vaultIndexDescriptor, [cosignerVaultIndexKey]);
      mocks.signPsbt.mockImplementation(({ tx }: { tx: btc.Transaction }) => {
        tx.signIdx(requireBytes(accountVaultIndexKey.privateKey), 0);
        return tx;
      });

      const signedTx = await useSignDescriptorPsbt()(psbtHex, vaultIndexDescriptor);

      expect(mocks.signPsbt).toHaveBeenCalledWith(
        expect.objectContaining({
          signingConfig: [{ index: 0, derivationPath: "m/84'/0'/0'/0/7" }],
        })
      );
      expect(hasPartialSigFor(signedTx, 0, requireBytes(accountVaultIndexKey.publicKey))).toBe(
        true
      );
    });
  });

  describe('signing plan validation', () => {
    test('rejects when no psbt input is locked by the descriptor', async () => {
      const psbtHex = buildNonDescriptorPsbtHex();

      await expect(useSignDescriptorPsbt()(psbtHex, multiSigDescriptor)).rejects.toThrow(
        'No PSBT input is locked by the provided descriptor'
      );
      expect(mocks.signPsbt).not.toHaveBeenCalled();
    });

    test('rejects when the current account is not part of the descriptor', async () => {
      const psbtHex = buildDescriptorPsbtHex(foreignDescriptor, []);

      await expect(useSignDescriptorPsbt()(psbtHex, foreignDescriptor)).rejects.toThrow(
        'is not part of this descriptor'
      );
      expect(mocks.signPsbt).not.toHaveBeenCalled();
    });

    test('rejects a descriptor whose extended keys use different key paths', async () => {
      await expect(
        useSignDescriptorPsbt()(buildNonDescriptorPsbtHex(), mixedKeyPathDescriptor)
      ).rejects.toThrow('must use the same key path');
      expect(mocks.signPsbt).not.toHaveBeenCalled();
    });
  });

  describe('ledger signing', () => {
    beforeEach(() => {
      mocks.walletState.walletType = 'ledger';
    });

    test('fails fast when a co-signer key is a raw public key', async () => {
      const psbtHex = buildDescriptorPsbtHex(rawPubkeyCosignerDescriptor, []);

      await expect(useSignDescriptorPsbt()(psbtHex, rawPubkeyCosignerDescriptor)).rejects.toThrow(
        'Ledger cannot sign this descriptor'
      );
      expect(mocks.toConnectAndSignBitcoinTransactionStep).not.toHaveBeenCalled();
      expect(mocks.listenForBitcoinTxLedgerSigning).not.toHaveBeenCalled();
    });

    test('hydrates a raw co-signer key from psbt xpub metadata', async () => {
      const psbtHex = addCosignerXpubMetadata(
        buildDescriptorPsbtHex(rawPubkeyCosignerDescriptor, [])
      );
      const deviceSignedTx = buildDescriptorTx(rawPubkeyCosignerDescriptor, [
        accountAddressIndexKey,
      ]);
      mocks.listenForBitcoinTxLedgerSigning.mockResolvedValue(deviceSignedTx);

      const signedTx = await useSignDescriptorPsbt()(psbtHex, rawPubkeyCosignerDescriptor);

      expect(signedTx).toBe(deviceSignedTx);
      const navigationCall = mocks.toConnectAndSignBitcoinTransactionStep.mock.calls[0];
      if (!navigationCall) throw new Error('Expected Ledger navigation');
      const ledgerDescriptor = navigationCall[3];
      if (typeof ledgerDescriptor !== 'string') throw new Error('Expected Ledger descriptor');
      expect(ledgerDescriptor).toContain(
        `[${bytesToHex(cosignerFingerprint)}/84'/0'/0']${makeNativeSegwitAccountKeychain(2).publicExtendedKey}/0/0`
      );
      expect(bytesToHex(compileWshDescriptor(ledgerDescriptor).scriptPubKey)).toBe(
        bytesToHex(compileWshDescriptor(rawPubkeyCosignerDescriptor).scriptPubKey)
      );
    });

    test('threads the prepared psbt, signing config, location and descriptor through the ledger flow', async () => {
      const psbtHex = buildDescriptorPsbtHex(multiSigDescriptor, [cosignerAddressIndexKey]);
      const deviceSignedTx = buildDescriptorTx(multiSigDescriptor, [
        cosignerAddressIndexKey,
        accountAddressIndexKey,
      ]);
      let threadedPsbt: Uint8Array | undefined;
      mocks.toConnectAndSignBitcoinTransactionStep.mockImplementation((psbt: Uint8Array) => {
        threadedPsbt = psbt;
      });
      mocks.listenForBitcoinTxLedgerSigning.mockResolvedValue(deviceSignedTx);

      const signedTx = await useSignDescriptorPsbt()(psbtHex, multiSigDescriptor);

      expect(signedTx).toBe(deviceSignedTx);
      expect(mocks.toConnectAndSignBitcoinTransactionStep).toHaveBeenCalledWith(
        expect.any(Uint8Array),
        [{ index: 0, derivationPath: accountDerivationPath }],
        { pathname: '/' },
        multiSigDescriptor
      );
      const threadedTx = btc.Transaction.fromPSBT(requireBytes(threadedPsbt));
      const { witnessScript } = compileWshDescriptor(multiSigDescriptor);
      expect(bytesToHex(requireBytes(threadedTx.getInput(0).witnessScript))).toEqual(
        bytesToHex(witnessScript)
      );
      expect(mocks.listenForBitcoinTxLedgerSigning).toHaveBeenCalledWith(
        bytesToHex(requireBytes(threadedPsbt))
      );
    });

    test('rejects when the device result lacks the wallet signature', async () => {
      const psbtHex = buildDescriptorPsbtHex(multiSigDescriptor, [cosignerAddressIndexKey]);
      mocks.listenForBitcoinTxLedgerSigning.mockResolvedValue(
        buildDescriptorTx(multiSigDescriptor, [cosignerAddressIndexKey])
      );

      await expect(useSignDescriptorPsbt()(psbtHex, multiSigDescriptor)).rejects.toThrow(
        'Failed to add signature to descriptor input'
      );
    });
  });
});
