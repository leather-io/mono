import { hexToBytes } from '@noble/hashes/utils';
import * as btc from '@scure/btc-signer';
import { describe, expect, it } from 'vitest';

import { getPsbtTxInputs } from '../utils/bitcoin.utils';
import { createBitcoinAddress } from '../validation/bitcoin-address';
import { getInputsToSignWithDisallowedSighash, isDisallowedSighash } from './psbt-inputs';

const ownerPayment = btc.p2wpkh(hexToBytes('02'.padEnd(66, '3')), btc.NETWORK);
const otherPayment = btc.p2wpkh(hexToBytes('03'.padEnd(66, '7')), btc.NETWORK);
const ownerAddress = createBitcoinAddress(ownerPayment.address ?? '');

function buildInputs(inputSighashTypes: (number | undefined)[]) {
  const tx = new btc.Transaction();
  inputSighashTypes.forEach((sighashType, index) => {
    tx.addInput({
      txid: new Uint8Array(32).fill(0x11),
      index,
      witnessUtxo: { script: ownerPayment.script, amount: 20_000n },
      ...(sighashType === undefined ? {} : { sighashType }),
    });
  });
  tx.addOutput({ script: otherPayment.script, amount: 18_000n });
  return getPsbtTxInputs(tx);
}

describe(isDisallowedSighash.name, () => {
  it('allows an unset sighash type', () => {
    expect(isDisallowedSighash(undefined)).toBe(false);
  });

  it('allows DEFAULT and ALL', () => {
    expect(isDisallowedSighash(btc.SigHash.DEFAULT)).toBe(false);
    expect(isDisallowedSighash(btc.SigHash.ALL)).toBe(false);
  });

  it('disallows NONE, SINGLE and ANYONECANPAY variants by default', () => {
    expect(isDisallowedSighash(btc.SigHash.NONE)).toBe(true);
    expect(isDisallowedSighash(btc.SigHash.SINGLE)).toBe(true);
    expect(isDisallowedSighash(btc.SigHash.ALL_ANYONECANPAY)).toBe(true);
    expect(isDisallowedSighash(btc.SigHash.NONE_ANYONECANPAY)).toBe(true);
    expect(isDisallowedSighash(btc.SigHash.SINGLE_ANYONECANPAY)).toBe(true);
  });

  it('allows a disallowed type when the request opts into it', () => {
    expect(isDisallowedSighash(btc.SigHash.NONE, [btc.SigHash.NONE])).toBe(false);
    expect(isDisallowedSighash(btc.SigHash.SINGLE, [btc.SigHash.NONE])).toBe(true);
  });
});

describe(getInputsToSignWithDisallowedSighash.name, () => {
  it('returns no indexes when every input carries a safe sighash', () => {
    const inputs = buildInputs([undefined, btc.SigHash.DEFAULT, btc.SigHash.ALL]);

    const result = getInputsToSignWithDisallowedSighash({
      inputs,
      networkMode: 'mainnet',
      psbtAddresses: [ownerAddress],
    });

    expect(result).toEqual([]);
  });

  it('returns the index of an owned input carrying a disallowed sighash', () => {
    const inputs = buildInputs([btc.SigHash.ALL, btc.SigHash.NONE]);

    const result = getInputsToSignWithDisallowedSighash({
      inputs,
      networkMode: 'mainnet',
      psbtAddresses: [ownerAddress],
    });

    expect(result).toEqual([1]);
  });

  it('ignores inputs the given addresses do not own', () => {
    const inputs = buildInputs([btc.SigHash.NONE]);

    const result = getInputsToSignWithDisallowedSighash({
      inputs,
      networkMode: 'mainnet',
      psbtAddresses: [createBitcoinAddress(otherPayment.address ?? '')],
    });

    expect(result).toEqual([]);
  });

  it('ignores inputs outside the indexes to sign', () => {
    const inputs = buildInputs([btc.SigHash.NONE, btc.SigHash.NONE]);

    const result = getInputsToSignWithDisallowedSighash({
      inputs,
      indexesToSign: [1],
      networkMode: 'mainnet',
      psbtAddresses: [ownerAddress],
    });

    expect(result).toEqual([1]);
  });

  it('returns no indexes when the request opts into the sighash type', () => {
    const inputs = buildInputs([btc.SigHash.NONE]);

    const result = getInputsToSignWithDisallowedSighash({
      inputs,
      networkMode: 'mainnet',
      psbtAddresses: [ownerAddress],
      allowedSighash: [btc.SigHash.NONE],
    });

    expect(result).toEqual([]);
  });
});
