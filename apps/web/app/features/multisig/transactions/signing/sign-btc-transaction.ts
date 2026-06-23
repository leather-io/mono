import { leather } from '~/utils/leather-sdk';

import { extractWshMultisigSignatures, psbtBase64ToHex } from '@leather.io/bitcoin';
import type { MultisigTransaction, VaultAccount } from '@leather.io/models';

import { getMultisigDescriptor } from '../btc-multisig-descriptor';
import { preSignVerification } from './pre-sign-verification';

// Signs a proposed BTC multisig transaction with the extension. Pre-signing
// verification runs first, as part of the ceremony; then we compile the descriptor,
// convert the PSBT to hex, sign each input the descriptor locks, and read the
// per-input signatures back off the signed PSBT.
export async function signBtcTransaction(
  transaction: MultisigTransaction,
  account: VaultAccount
): Promise<{ signature: string; inputIndex?: number }[]> {
  preSignVerification({ transaction, account });
  const descriptor = getMultisigDescriptor(account);
  const psbtHex = psbtBase64ToHex(transaction.proposalRawPayload);
  const { hex } = await leather.signPsbt({ hex: psbtHex, descriptor });
  return extractWshMultisigSignatures(hex);
}
