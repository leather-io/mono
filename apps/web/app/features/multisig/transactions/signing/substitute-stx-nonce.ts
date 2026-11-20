import { bytesToHex, hexToBytes } from '@stacks/common';
import { AddressHashMode, AuthType } from '@stacks/transactions';

import { nonceCodec, transactionUpToNonce } from './substitute-stx-nonce.kernel';

const standardAuthType: number = AuthType.Standard;
const p2shNonSequentialHashMode: number = AddressHashMode.P2SHNonSequential;

// Leather multisig STX transfers are always StandardAuth, P2SHNonSequential
// multisig, which fixes the serialized spending-condition prefix:
// version(1) | chain_id(4) | auth_type(1) | hash_mode(1) | signer_hash(20) |
// nonce(8) | ... The signer hash is a 20-byte Hash160 for every hash mode, so
// the nonce always starts at byte 27.

// Overwrites the placeholder nonce of a proposed Leather multisig STX transfer
// with the backend-assigned nonce, in place, after asserting the transaction is
// the expected shape.
export function substituteStxNonce({
  rawPayload,
  nonce,
}: {
  rawPayload: string;
  nonce: number;
}): string {
  const [[versionAndChainId, authType, hashMode, signerHash], afterNonce] =
    transactionUpToNonce.decode(hexToBytes(rawPayload));

  if (authType !== standardAuthType)
    throw new Error('Unexpected auth type; expected a StandardAuth multisig transaction');
  if (hashMode !== p2shNonSequentialHashMode)
    throw new Error('Unexpected hash mode; expected a P2SHNonSequential multisig transaction');

  return bytesToHex(
    transactionUpToNonce.encode(
      [versionAndChainId, authType, hashMode, signerHash, nonceCodec.encode(nonce)],
      afterNonce
    )
  );
}
