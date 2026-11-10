import { DefaultDescriptorTemplate, DefaultWallet } from '@ledgerhq/device-signer-kit-bitcoin';
import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';
import { Psbt } from 'bitcoinjs-lib';

import {
  addNativeSegwitSignaturesToPsbt,
  addTaprootInputSignaturesToPsbt,
  createNativeSegwitWalletPolicyKey,
  createTaprootWalletPolicyKey,
  makeNativeSegwitDefaultWallet,
  makeTaprootDefaultWallet,
} from './bitcoin-ledger-utils';

const masterFingerprint = '844b93a0';

function makeAccountXpub(path: string) {
  return HDKey.fromMasterSeed(new Uint8Array(32).fill(1)).derive(path).publicExtendedKey;
}

describe(createNativeSegwitWalletPolicyKey.name, () => {
  test('builds the persisted [fingerprint/path]xpub key', () => {
    const xpub = makeAccountXpub("m/84'/0'/2'");

    expect(
      createNativeSegwitWalletPolicyKey({
        fingerprint: masterFingerprint,
        network: 'mainnet',
        xpub,
        accountIndex: 2,
      })
    ).toBe(`[${masterFingerprint}/84'/0'/2']${xpub}`);
  });

  test('uses the testnet coin type on testnet', () => {
    const xpub = makeAccountXpub("m/84'/1'/0'");

    expect(
      createNativeSegwitWalletPolicyKey({
        fingerprint: masterFingerprint,
        network: 'testnet',
        xpub,
        accountIndex: 0,
      })
    ).toBe(`[${masterFingerprint}/84'/1'/0']${xpub}`);
  });
});

describe(createTaprootWalletPolicyKey.name, () => {
  test('builds the persisted [fingerprint/path]xpub key', () => {
    const xpub = makeAccountXpub("m/86'/0'/0'");

    expect(
      createTaprootWalletPolicyKey({
        fingerprint: masterFingerprint,
        network: 'mainnet',
        xpub,
        accountIndex: 0,
      })
    ).toBe(`[${masterFingerprint}/86'/0'/0']${xpub}`);
  });
});

describe(makeNativeSegwitDefaultWallet.name, () => {
  test('builds a native segwit default wallet without the m/ prefix', () => {
    const wallet = makeNativeSegwitDefaultWallet('mainnet', 2);

    expect(wallet).toBeInstanceOf(DefaultWallet);
    expect(wallet.derivationPath).toBe("84'/0'/2'");
    expect(wallet.template).toBe(DefaultDescriptorTemplate.NATIVE_SEGWIT);
  });
});

describe(makeTaprootDefaultWallet.name, () => {
  test('builds a taproot default wallet without the m/ prefix', () => {
    const wallet = makeTaprootDefaultWallet('testnet', 0);

    expect(wallet).toBeInstanceOf(DefaultWallet);
    expect(wallet.derivationPath).toBe("86'/1'/0'");
    expect(wallet.template).toBe(DefaultDescriptorTemplate.TAPROOT);
  });
});

const signingKey = HDKey.fromMasterSeed(new Uint8Array(32).fill(1)).derive("m/84'/0'/0'/0/0");

function makeTwoInputTx() {
  if (!signingKey.publicKey) throw new Error('Expected public key');
  const tx = new btc.Transaction();
  for (const index of [0, 1]) {
    tx.addInput({
      txid: new Uint8Array(32).fill(index + 1),
      index,
      witnessUtxo: { script: btc.p2wpkh(signingKey.publicKey).script, amount: 10_000n },
    });
  }
  tx.addOutput({ script: btc.p2wpkh(signingKey.publicKey).script, amount: 9_000n });
  return tx;
}

function makeTwoInputPsbt() {
  if (!signingKey.publicKey) throw new Error('Expected public key');
  return {
    psbt: Psbt.fromBuffer(Buffer.from(makeTwoInputTx().toPSBT())),
    pubkey: signingKey.publicKey,
  };
}

// A real DER signature for input 1: bip174 validates partialSig bytes on merge.
function makeInputOneSignature() {
  if (!signingKey.privateKey) throw new Error('Expected private key');
  const tx = makeTwoInputTx();
  tx.signIdx(signingKey.privateKey, 1);
  const partialSig = tx.getInput(1).partialSig;
  if (!partialSig?.[0]) throw new Error('Expected a partial signature');
  return partialSig[0][1];
}

describe(addNativeSegwitSignaturesToPsbt.name, () => {
  test('merges each partial signature into the input it was produced for', () => {
    const { psbt, pubkey } = makeTwoInputPsbt();
    const signature = makeInputOneSignature();

    addNativeSegwitSignaturesToPsbt(psbt, [{ inputIndex: 1, pubkey, signature }]);

    expect(psbt.data.inputs[0].partialSig).toBeUndefined();
    expect(psbt.data.inputs[1].partialSig).toEqual([{ pubkey, signature }]);
  });
});

describe(addTaprootInputSignaturesToPsbt.name, () => {
  test('sets the key-path signature on the input it was produced for', () => {
    const { psbt, pubkey } = makeTwoInputPsbt();
    const signature = new Uint8Array(64).fill(7);

    addTaprootInputSignaturesToPsbt(psbt, [{ inputIndex: 0, pubkey, signature }]);

    expect(psbt.data.inputs[0].tapKeySig).toEqual(signature);
    expect(psbt.data.inputs[1].tapKeySig).toBeUndefined();
  });
});
