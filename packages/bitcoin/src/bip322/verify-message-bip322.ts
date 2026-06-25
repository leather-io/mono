import ecc from '@bitcoinerlab/secp256k1';
import { base64 } from '@scure/base';
import * as bitcoin from 'bitcoinjs-lib';
import { decode as decodeVaruint } from 'varuint-bitcoin';

import { getBitcoinJsLibNetworkConfigByMode } from '../utils/bitcoin.network';
import { inferNetworkFromAddress } from '../utils/bitcoin.utils';
import { createBitcoinAddress } from '../validation/bitcoin-address';
import { createToSpendTx } from './sign-message-bip322-bitcoinjs';

// Decodes a serialized witness stack: a varint item count followed by each item
// as a varint length prefix plus its bytes.
function decodeWitnessStack(bytes: Uint8Array): Buffer[] {
  const buffer = Buffer.from(bytes);
  let offset = 0;
  const count = decodeVaruint(buffer, offset);
  offset += decodeVaruint.bytes;

  const items: Buffer[] = [];
  for (let i = 0; i < count; i++) {
    const length = decodeVaruint(buffer, offset);
    offset += decodeVaruint.bytes;
    items.push(buffer.subarray(offset, offset + length));
    offset += length;
  }
  if (offset !== buffer.length) throw new Error('Trailing bytes after witness stack');
  return items;
}

// Verifies a BIP-322 "simple" signature for a P2WPKH address: rebuilds the
// to_spend/to_sign virtual transactions, checks the witness signature against the
// P2WPKH sighash, and confirms the witness public key hashes to the address. The
// network is taken from the address. Returns false rather than throwing on
// malformed input.
export function verifyP2wpkhBip322Signature(
  address: string,
  message: string,
  signature: string
): boolean {
  try {
    const witness = decodeWitnessStack(base64.decode(signature));
    // A P2WPKH simple-signature witness is exactly [signature, publicKey].
    if (witness.length !== 2) return false;
    const [encodedSignature, publicKey] = witness;

    const bitcoinAddress = createBitcoinAddress(address);
    const network = inferNetworkFromAddress(bitcoinAddress);
    const networkConfig = getBitcoinJsLibNetworkConfigByMode(network);

    // The public key in the witness must hash to the claimed address; otherwise a
    // signature from any key would verify.
    if (bitcoin.payments.p2wpkh({ pubkey: publicKey, network: networkConfig }).address !== address)
      return false;

    const { virtualToSpend } = createToSpendTx(bitcoinAddress, message, network);
    const toSign = new bitcoin.Transaction();
    toSign.version = 0;
    toSign.addInput(virtualToSpend.getHash(), 0, 0);
    toSign.addOutput(bitcoin.script.compile([bitcoin.script.OPS.OP_RETURN]), 0);

    const scriptCode = bitcoin.payments.p2pkh({ pubkey: publicKey, network: networkConfig }).output;
    if (!scriptCode) return false;

    const { signature: compactSignature, hashType } =
      bitcoin.script.signature.decode(encodedSignature);
    const sighash = toSign.hashForWitnessV0(0, scriptCode, 0, hashType);

    return ecc.verify(sighash, publicKey, compactSignature);
  } catch {
    return false;
  }
}
