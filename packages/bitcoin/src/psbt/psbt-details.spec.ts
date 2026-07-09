import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import * as btc from '@scure/btc-signer';
import { describe, expect, it } from 'vitest';

import { createBitcoinAddress } from '../validation/bitcoin-address';
import { getPsbtDetails } from './psbt-details';

const NETWORK = btc.NETWORK;
const ownerPubKey = hexToBytes('02'.padEnd(66, '3'));
const ownerPayment = btc.p2wpkh(ownerPubKey, NETWORK);
const ownerAddress = createBitcoinAddress(ownerPayment.address ?? '');
const recipientAddress = createBitcoinAddress(
  btc.p2wpkh(hexToBytes('03'.padEnd(66, '7')), NETWORK).address ?? ''
);
const dummyTxid = hexToBytes('a'.repeat(64));

function buildPsbtHex(sighashType?: number) {
  const tx = new btc.Transaction();
  tx.addInput({
    txid: dummyTxid,
    index: 0,
    witnessUtxo: { script: ownerPayment.script, amount: 100_000_000n },
    ...(sighashType === undefined ? {} : { sighashType }),
  });
  tx.addOutputAddress(recipientAddress, 99_900_000n, NETWORK);
  return bytesToHex(tx.toPSBT());
}

function isMutable(sighashType?: number) {
  return getPsbtDetails({
    psbtHex: buildPsbtHex(sighashType),
    psbtAddresses: [ownerAddress],
    networkMode: 'mainnet',
  }).isPsbtMutable;
}

describe('getPsbtDetails isPsbtMutable', () => {
  it('flags an input signed with SIGHASH_NONE as mutable', () => {
    expect(isMutable(btc.SigHash.NONE)).toBe(true);
  });

  it('flags an input signed with SIGHASH_SINGLE as mutable', () => {
    expect(isMutable(btc.SigHash.SINGLE)).toBe(true);
  });

  it('flags ANYONECANPAY variants as mutable', () => {
    expect(isMutable(btc.SigHash.NONE_ANYONECANPAY)).toBe(true);
    expect(isMutable(btc.SigHash.ALL_ANYONECANPAY)).toBe(true);
  });

  it('does not flag SIGHASH_ALL as mutable', () => {
    expect(isMutable(btc.SigHash.ALL)).toBe(false);
  });

  it('does not flag an input with the default sighash as mutable', () => {
    expect(isMutable(undefined)).toBe(false);
  });

  it('does not flag a mutation-enabling sighash on an input the wallet does not own', () => {
    const details = getPsbtDetails({
      psbtHex: buildPsbtHex(btc.SigHash.NONE),
      psbtAddresses: [recipientAddress],
      networkMode: 'mainnet',
    });
    expect(details.isPsbtMutable).toBe(false);
  });
});
