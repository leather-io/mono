import {
  DefaultDescriptorTemplate,
  DefaultWallet,
  RegisteredWallet,
  type SignerBtc,
} from '@ledgerhq/device-signer-kit-bitcoin';
import { bytesToHex } from '@noble/hashes/utils';
import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';
import { Psbt } from 'bitcoinjs-lib';
import { throwError } from 'rxjs';

import { ecdsaPublicKeyToSchnorr } from '@leather.io/bitcoin';

import { fakeSignerAction, makeFakeLedgerBitcoinApp } from '../app/ledger-app.test-utils';
import { createLedgerBitcoinSigner } from './ledger-bitcoin-signer';

const fingerprintHex = '844b93a0';
const masterKey = HDKey.fromMasterSeed(new Uint8Array(32).fill(1));
const cosignerKey = HDKey.fromMasterSeed(new Uint8Array(32).fill(2));

function requireKey(key: HDKey) {
  if (!key.publicKey || !key.privateKey) throw new Error('Expected a full key');
  return { publicKey: key.publicKey, privateKey: key.privateKey };
}

const nativeSegwitKey = requireKey(masterKey.derive("m/84'/0'/0'/0/0"));
const secondAccountKey = requireKey(masterKey.derive("m/84'/0'/1'/0/0"));
const taprootKey = requireKey(masterKey.derive("m/86'/0'/0'/0/0"));

function makeFakeApp(signer: Partial<SignerBtc> = {}) {
  return makeFakeLedgerBitcoinApp({
    getMasterFingerprint: vi.fn(() =>
      fakeSignerAction({ masterFingerprint: Buffer.from(fingerprintHex, 'hex') })
    ),
    ...signer,
  });
}

function makeNativeSegwitTx(keys: { publicKey: Uint8Array }[]) {
  const tx = new btc.Transaction();
  keys.forEach(({ publicKey }, index) => {
    tx.addInput({
      txid: new Uint8Array(32).fill(index + 1),
      index,
      witnessUtxo: { script: btc.p2wpkh(publicKey).script, amount: 10_000n },
    });
  });
  tx.addOutput({ script: btc.p2wpkh(nativeSegwitKey.publicKey).script, amount: 9_000n });
  return tx;
}

function makeNativeSegwitSignature(inputIndex: number, privateKey: Uint8Array) {
  const tx = makeNativeSegwitTx([nativeSegwitKey, secondAccountKey]);
  tx.signIdx(privateKey, inputIndex);
  const partialSig = tx.getInput(inputIndex).partialSig;
  if (!partialSig?.[0]) throw new Error('Expected a partial signature');
  return partialSig[0][1];
}

function toHexDerivation(entry: {
  masterFingerprint: Uint8Array;
  pubkey: Uint8Array;
  path: string;
}) {
  return {
    masterFingerprint: bytesToHex(entry.masterFingerprint),
    pubkey: bytesToHex(entry.pubkey),
    path: entry.path,
  };
}

function toHexPartialSig(entry: { pubkey: Uint8Array; signature: Uint8Array }) {
  return { pubkey: bytesToHex(entry.pubkey), signature: bytesToHex(entry.signature) };
}

function decodePsbtArg(signPsbt: ReturnType<typeof vi.fn>, call = 0) {
  const base64: unknown = signPsbt.mock.calls[call]?.[1];
  if (typeof base64 !== 'string') throw new Error('Expected a base64 psbt argument');
  return Psbt.fromBase64(base64);
}

describe(createLedgerBitcoinSigner.name, () => {
  describe('requestAccountKeys', () => {
    test('returns one policy descriptor per standard and account index', async () => {
      const getExtendedPublicKey = vi.fn<SignerBtc['getExtendedPublicKey']>(path =>
        fakeSignerAction({ extendedPublicKey: `xpub-${path}` })
      );
      const app = makeFakeApp({ getExtendedPublicKey });
      const onRequestKey = vi.fn();

      const result = await createLedgerBitcoinSigner(app).requestAccountKeys(
        {
          network: 'mainnet',
          accountIndexes: [0, 1],
          standards: ['nativeSegwit', 'taproot'],
          onRequestKey,
        },
        {}
      );

      expect(result.fingerprint).toBe(fingerprintHex);
      expect(result.keys.map(key => key.descriptor)).toEqual([
        `[${fingerprintHex}/84'/0'/0']xpub-84'/0'/0'`,
        `[${fingerprintHex}/84'/0'/1']xpub-84'/0'/1'`,
        `[${fingerprintHex}/86'/0'/0']xpub-86'/0'/0'`,
        `[${fingerprintHex}/86'/0'/1']xpub-86'/0'/1'`,
      ]);
      expect(result.keys[0]).toMatchObject({
        standard: 'nativeSegwit',
        accountIndex: 0,
        path: "m/84'/0'/0'",
        xpub: "xpub-84'/0'/0'",
      });
      expect(onRequestKey.mock.calls).toEqual([
        [{ standard: 'nativeSegwit', accountIndex: 0 }],
        [{ standard: 'nativeSegwit', accountIndex: 1 }],
        [{ standard: 'taproot', accountIndex: 0 }],
        [{ standard: 'taproot', accountIndex: 1 }],
      ]);
    });
  });

  describe('signPsbt', () => {
    test('signs native segwit inputs with the account default wallet and merges signatures', async () => {
      const signature = makeNativeSegwitSignature(0, nativeSegwitKey.privateKey);
      const signPsbt = vi.fn<SignerBtc['signPsbt']>(() =>
        fakeSignerAction([{ inputIndex: 0, pubkey: nativeSegwitKey.publicKey, signature }])
      );
      const app = makeFakeApp({ signPsbt });
      const onInteraction = vi.fn();

      const signed = await createLedgerBitcoinSigner(app).signPsbt(
        {
          psbt: makeNativeSegwitTx([nativeSegwitKey]).toPSBT(),
          network: 'mainnet',
          inputsToSign: [
            { index: 0, derivationPath: "m/84'/0'/0'/0/0", publicKey: nativeSegwitKey.publicKey },
          ],
        },
        { onInteraction }
      );

      expect(signPsbt).toHaveBeenCalledOnce();
      const [wallet] = signPsbt.mock.calls[0];
      expect(wallet).toBeInstanceOf(DefaultWallet);
      expect(wallet).toMatchObject({
        derivationPath: "84'/0'/0'",
        template: DefaultDescriptorTemplate.NATIVE_SEGWIT,
      });
      const sentPsbt = decodePsbtArg(signPsbt);
      expect(sentPsbt.data.inputs[0].bip32Derivation?.map(toHexDerivation)).toEqual([
        {
          masterFingerprint: fingerprintHex,
          pubkey: bytesToHex(nativeSegwitKey.publicKey),
          path: "m/84'/0'/0'/0/0",
        },
      ]);
      const result = Psbt.fromBuffer(Buffer.from(signed));
      expect(result.data.inputs[0].partialSig?.map(toHexPartialSig)).toEqual([
        { pubkey: bytesToHex(nativeSegwitKey.publicKey), signature: bytesToHex(signature) },
      ]);
    });

    test('signs once per account wallet when inputs span accounts', async () => {
      const signPsbt = vi.fn<SignerBtc['signPsbt']>(() => fakeSignerAction([]));
      const app = makeFakeApp({ signPsbt });

      await createLedgerBitcoinSigner(app).signPsbt(
        {
          psbt: makeNativeSegwitTx([nativeSegwitKey, secondAccountKey]).toPSBT(),
          network: 'mainnet',
          inputsToSign: [
            { index: 0, derivationPath: "m/84'/0'/0'/0/0", publicKey: nativeSegwitKey.publicKey },
            { index: 1, derivationPath: "m/84'/0'/1'/0/0", publicKey: secondAccountKey.publicKey },
          ],
        },
        {}
      );

      expect(signPsbt).toHaveBeenCalledTimes(2);
      expect(signPsbt.mock.calls.map(([wallet]) => wallet)).toEqual([
        expect.objectContaining({ derivationPath: "84'/0'/0'" }),
        expect.objectContaining({ derivationPath: "84'/0'/1'" }),
      ]);
    });

    test('signs taproot inputs with the taproot wallet and a schnorr derivation entry', async () => {
      const schnorrSignature = new Uint8Array(64).fill(7);
      const signPsbt = vi.fn<SignerBtc['signPsbt']>(() =>
        fakeSignerAction([
          { inputIndex: 0, pubkey: taprootKey.publicKey, signature: schnorrSignature },
        ])
      );
      const app = makeFakeApp({ signPsbt });
      const tx = new btc.Transaction();
      tx.addInput({
        txid: new Uint8Array(32).fill(1),
        index: 0,
        witnessUtxo: {
          script: btc.p2tr(ecdsaPublicKeyToSchnorr(taprootKey.publicKey)).script,
          amount: 10_000n,
        },
      });
      tx.addOutput({ script: btc.p2wpkh(nativeSegwitKey.publicKey).script, amount: 9_000n });

      const signed = await createLedgerBitcoinSigner(app).signPsbt(
        {
          psbt: tx.toPSBT(),
          network: 'mainnet',
          inputsToSign: [
            { index: 0, derivationPath: "m/86'/0'/0'/0/0", publicKey: taprootKey.publicKey },
          ],
        },
        {}
      );

      expect(signPsbt.mock.calls[0][0]).toMatchObject({
        derivationPath: "86'/0'/0'",
        template: DefaultDescriptorTemplate.TAPROOT,
      });
      const sentPsbt = decodePsbtArg(signPsbt);
      expect(sentPsbt.data.inputs[0].tapBip32Derivation?.map(toHexDerivation)).toEqual([
        {
          masterFingerprint: fingerprintHex,
          pubkey: bytesToHex(ecdsaPublicKeyToSchnorr(taprootKey.publicKey)),
          path: "m/86'/0'/0'/0/0",
        },
      ]);
      const tapKeySig = Psbt.fromBuffer(Buffer.from(signed)).data.inputs[0].tapKeySig;
      expect(tapKeySig && bytesToHex(tapKeySig)).toBe(bytesToHex(schnorrSignature));
    });

    test('rejects inputs whose path is not a supported standard', async () => {
      const app = makeFakeApp({ signPsbt: vi.fn() });

      await expect(
        createLedgerBitcoinSigner(app).signPsbt(
          {
            psbt: makeNativeSegwitTx([nativeSegwitKey]).toPSBT(),
            network: 'mainnet',
            inputsToSign: [
              { index: 0, derivationPath: "m/44'/0'/0'/0/0", publicKey: nativeSegwitKey.publicKey },
            ],
          },
          {}
        )
      ).rejects.toMatchObject({ kind: 'unsupported' });
    });

    test('registers a policy and signs with it when a policy descriptor is given', async () => {
      const deviceXpub = masterKey.derive("m/84'/0'/0'").publicExtendedKey;
      const cosignerXpub = cosignerKey.derive("m/84'/0'/0'").publicExtendedKey;
      const descriptor = `wsh(multi(2,${cosignerXpub}/0/0,[${fingerprintHex}/84'/0'/0']${deviceXpub}/0/0))`;
      const registered = new RegisteredWallet(
        'Leather',
        'wsh(multi(2,@0/**,@1/**))',
        [],
        new Uint8Array(32)
      );
      const registerWallet = vi.fn<SignerBtc['registerWallet']>(() => fakeSignerAction(registered));
      const signPsbt = vi.fn<SignerBtc['signPsbt']>(() => fakeSignerAction([]));
      const app = makeFakeApp({ registerWallet, signPsbt });
      const psbt = Psbt.fromBuffer(Buffer.from(makeNativeSegwitTx([nativeSegwitKey]).toPSBT()));
      psbt.updateInput(0, {
        partialSig: [
          {
            pubkey: Buffer.from(nativeSegwitKey.publicKey),
            signature: Buffer.from(makeNativeSegwitSignature(0, nativeSegwitKey.privateKey)),
          },
        ],
      });

      await createLedgerBitcoinSigner(app).signPsbt(
        {
          psbt: new Uint8Array(psbt.toBuffer()),
          network: 'mainnet',
          inputsToSign: [
            { index: 0, derivationPath: "m/84'/0'/0'/0/0", publicKey: nativeSegwitKey.publicKey },
          ],
          policyDescriptor: descriptor,
        },
        {}
      );

      expect(registerWallet.mock.calls[0][0]).toMatchObject({
        descriptorTemplate: 'wsh(multi(2,@0/**,@1/**))',
        keys: [cosignerXpub, `[${fingerprintHex}/84'/0'/0']${deviceXpub}`],
      });
      expect(signPsbt.mock.calls[0][0]).toBe(registered);
      const sentPsbt = decodePsbtArg(signPsbt);
      expect(sentPsbt.data.inputs[0].partialSig).toBeUndefined();
      expect(sentPsbt.data.inputs[0].bip32Derivation?.map(toHexDerivation)).toEqual([
        {
          masterFingerprint: fingerprintHex,
          pubkey: bytesToHex(nativeSegwitKey.publicKey),
          path: "m/84'/0'/0'/0/0",
        },
      ]);
    });
  });

  describe('showAddress', () => {
    test('shows an account address with the default wallet', async () => {
      const getWalletAddress = vi.fn<SignerBtc['getWalletAddress']>(() =>
        fakeSignerAction({ address: 'bc1qaddress' })
      );
      const app = makeFakeApp({ getWalletAddress });

      const address = await createLedgerBitcoinSigner(app).showAddress(
        {
          kind: 'account',
          network: 'testnet',
          standard: 'taproot',
          accountIndex: 2,
          changeIndex: 1,
          addressIndex: 5,
        },
        {}
      );

      expect(address).toBe('bc1qaddress');
      const [wallet, addressIndex, options] = getWalletAddress.mock.calls[0];
      expect(wallet).toMatchObject({
        derivationPath: "86'/1'/2'",
        template: DefaultDescriptorTemplate.TAPROOT,
      });
      expect(addressIndex).toBe(5);
      expect(options).toMatchObject({ change: true, checkOnDevice: true });
    });

    test('maps a refused confirmation to a rejected error', async () => {
      const refusal = { _tag: 'RefusedByUserDAError' };
      const getWalletAddress = vi.fn<SignerBtc['getWalletAddress']>(() => ({
        observable: throwError(() => refusal),
        cancel: vi.fn(),
      }));
      const app = makeFakeApp({ getWalletAddress });

      await expect(
        createLedgerBitcoinSigner(app).showAddress(
          {
            kind: 'account',
            network: 'mainnet',
            standard: 'nativeSegwit',
            accountIndex: 0,
            changeIndex: 0,
            addressIndex: 0,
          },
          {}
        )
      ).rejects.toMatchObject({ kind: 'rejected' });
    });
  });

  test('reports the fingerprint it signs with as hex', async () => {
    const app = makeFakeApp();

    const keys = await createLedgerBitcoinSigner(app).requestAccountKeys(
      { network: 'mainnet', accountIndexes: [], standards: [] },
      {}
    );

    expect(keys).toEqual({ fingerprint: bytesToHex(Buffer.from(fingerprintHex, 'hex')), keys: [] });
  });
});
