import * as btc from '@scure/btc-signer';
import { describe, expect, it, vi } from 'vitest';

import { deriveChildKeychainFromMnemnonic } from '@leather.io/crypto';

const TEST_MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

vi.mock('@/store/secure-store/mnemonic-store', () => ({
  mnemonicStore: () => ({
    getMnemonic() {
      return Promise.resolve({ mnemonic: TEST_MNEMONIC, passphrase: undefined });
    },
  }),
}));

const { signTx } = await import('./signer');

const fingerprint = 0;

async function deriveAddr(change: number, addressIndex: number) {
  const keyOrigin = `${fingerprint}/84'/0'/0'/${change}/${addressIndex}`;
  const child = await deriveChildKeychainFromMnemnonic(keyOrigin, TEST_MNEMONIC, undefined);
  if (!child.publicKey) throw new Error('no pubkey');
  const derivation: [Uint8Array, { fingerprint: number; path: number[] }] = [
    child.publicKey,
    { fingerprint, path: btc.bip32Path(`m/84'/0'/0'/${change}/${addressIndex}`) },
  ];
  return {
    publicKey: child.publicKey,
    p2wpkh: btc.p2wpkh(child.publicKey, btc.NETWORK),
    derivation,
  };
}

function isSigned(tx: btc.Transaction, index: number) {
  return (tx.getInput(index).partialSig ?? []).length > 0;
}

describe('signTx signAtIndex', () => {
  it('does not sign an input outside signAtIndex, even when it reuses a signed input key origin', async () => {
    const addr0 = await deriveAddr(0, 0);
    const payout = await deriveAddr(0, 9);

    const tx = new btc.Transaction({ allowUnknownOutputs: true });
    tx.addInput({
      txid: new Uint8Array(32).fill(0x11),
      index: 0,
      witnessUtxo: { script: addr0.p2wpkh.script, amount: 10_000n },
      bip32Derivation: [addr0.derivation],
    });
    tx.addInput({
      txid: new Uint8Array(32).fill(0x22),
      index: 0,
      witnessUtxo: { script: addr0.p2wpkh.script, amount: 5_000_000n },
      bip32Derivation: [addr0.derivation],
    });
    tx.addOutputAddress(payout.p2wpkh.address!, 4_995_000n, btc.NETWORK);

    const signed = await signTx(tx.toPSBT(), { signAtIndex: [0] });
    const out = btc.Transaction.fromPSBT(signed.toPSBT());

    expect(isSigned(out, 0)).toBe(true);
    expect(isSigned(out, 1)).toBe(false);
  });

  it('signs only the requested index and leaves an input at a different key origin unsigned', async () => {
    const addr0 = await deriveAddr(0, 0);
    const addr1 = await deriveAddr(0, 1);

    const tx = new btc.Transaction({ allowUnknownOutputs: true });
    tx.addInput({
      txid: new Uint8Array(32).fill(0x11),
      index: 0,
      witnessUtxo: { script: addr0.p2wpkh.script, amount: 10_000n },
      bip32Derivation: [addr0.derivation],
    });
    tx.addInput({
      txid: new Uint8Array(32).fill(0x44),
      index: 0,
      witnessUtxo: { script: addr1.p2wpkh.script, amount: 5_000_000n },
      bip32Derivation: [addr1.derivation],
    });
    tx.addOutputAddress(addr0.p2wpkh.address!, 4_995_000n, btc.NETWORK);

    const signed = await signTx(tx.toPSBT(), { signAtIndex: [0] });
    const out = btc.Transaction.fromPSBT(signed.toPSBT());

    expect(isSigned(out, 0)).toBe(true);
    expect(isSigned(out, 1)).toBe(false);
  });

  it('signs every matching input when signAtIndex is not provided', async () => {
    const addr0 = await deriveAddr(0, 0);
    const payout = await deriveAddr(0, 9);

    const tx = new btc.Transaction({ allowUnknownOutputs: true });
    tx.addInput({
      txid: new Uint8Array(32).fill(0x11),
      index: 0,
      witnessUtxo: { script: addr0.p2wpkh.script, amount: 10_000n },
      bip32Derivation: [addr0.derivation],
    });
    tx.addInput({
      txid: new Uint8Array(32).fill(0x22),
      index: 0,
      witnessUtxo: { script: addr0.p2wpkh.script, amount: 5_000_000n },
      bip32Derivation: [addr0.derivation],
    });
    tx.addOutputAddress(payout.p2wpkh.address!, 4_995_000n, btc.NETWORK);

    const signed = await signTx(tx.toPSBT());
    const out = btc.Transaction.fromPSBT(signed.toPSBT());

    expect(isSigned(out, 0)).toBe(true);
    expect(isSigned(out, 1)).toBe(true);
  });

  it('honors signAtIndex for a non-zero index', async () => {
    const addr0 = await deriveAddr(0, 0);
    const payout = await deriveAddr(0, 9);

    const tx = new btc.Transaction({ allowUnknownOutputs: true });
    tx.addInput({
      txid: new Uint8Array(32).fill(0x11),
      index: 0,
      witnessUtxo: { script: addr0.p2wpkh.script, amount: 10_000n },
      bip32Derivation: [addr0.derivation],
    });
    tx.addInput({
      txid: new Uint8Array(32).fill(0x22),
      index: 0,
      witnessUtxo: { script: addr0.p2wpkh.script, amount: 5_000_000n },
      bip32Derivation: [addr0.derivation],
    });
    tx.addOutputAddress(payout.p2wpkh.address!, 4_995_000n, btc.NETWORK);

    const signed = await signTx(tx.toPSBT(), { signAtIndex: [1] });
    const out = btc.Transaction.fromPSBT(signed.toPSBT());

    expect(isSigned(out, 0)).toBe(false);
    expect(isSigned(out, 1)).toBe(true);
  });
});
