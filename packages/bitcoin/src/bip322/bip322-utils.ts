import ecc from '@bitcoinerlab/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import { hexToBytes } from '@noble/hashes/utils';
import { RawWitness } from '@scure/btc-signer';
import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';

import { type PaymentTypes } from '@leather.io/rpc';
import { isString } from '@leather.io/utils';

import { toXOnly } from '../utils/bitcoin.utils';
import { taggedMessageBytes, taggedMessageText } from './tagged-message.kernel';

const ECPair = ECPairFactory(ecc);
bitcoin.initEccLib(ecc);

export function ecPairFromPrivateKey(key: Uint8Array) {
  return ECPair.fromPrivateKey(Buffer.from(key));
}

// See tagged hashes section of BIP-340
// https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki#design
export function hashBip322Message(message: Uint8Array | string) {
  return sha256(
    isString(message)
      ? taggedMessageText.encode([undefined, message])
      : taggedMessageBytes.encode([undefined, message])
  );
}

export const bip322TransactionToSignValues = {
  prevoutHash: hexToBytes('0000000000000000000000000000000000000000000000000000000000000000'),
  prevoutIndex: 0xffffffff,
  sequence: 0,
};

const supportedMessageSigningPaymentTypes: PaymentTypes[] = ['p2wpkh', 'p2tr'];

export function isSupportedMessageSigningPaymentType(paymentType: string) {
  return supportedMessageSigningPaymentTypes.some(type => type === paymentType);
}

/**
 * Encode witness data for a BIP322 message
 * TODO: Refactor to remove `Buffer` use
 */
export function encodeMessageWitnessData(witnessArray: Uint8Array[]) {
  return Buffer.from(RawWitness.encode(witnessArray));
}

function tapTweakHash(pubKey: Uint8Array, h: Uint8Array | undefined): Uint8Array {
  return bitcoin.crypto.taggedHash('TapTweak', Buffer.concat(h ? [pubKey, h] : [pubKey]));
}

interface TweakSignerOptions {
  tweakHash?: Uint8Array;
  network?: bitcoin.Network;
}

export function tweakSigner(signer: bitcoin.Signer, opts: TweakSignerOptions = {}): bitcoin.Signer {
  let privateKey =
    'privateKey' in signer && signer.privateKey instanceof Uint8Array
      ? signer.privateKey
      : undefined;
  if (!privateKey) {
    throw new Error('Private key is required for tweaking signer!');
  }
  if (signer.publicKey[0] === 3) {
    privateKey = ecc.privateNegate(privateKey);
  }

  const tweakedPrivateKey = ecc.privateAdd(
    privateKey,
    tapTweakHash(toXOnly(signer.publicKey), opts.tweakHash)
  );
  if (!tweakedPrivateKey) {
    throw new Error('Invalid tweaked private key!');
  }

  return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
    network: opts.network,
  });
}
