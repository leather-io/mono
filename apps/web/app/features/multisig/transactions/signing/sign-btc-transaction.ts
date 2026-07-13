import { leather } from '~/utils/leather-sdk';

import { extractWshMultisigSignatures, psbtBase64ToHex } from '@leather.io/bitcoin';
import type { MultisigTransaction, VaultAccount } from '@leather.io/models';

import { resolveWalletRpcNetwork } from '../../network/resolve-wallet-rpc-network';
import { getMultisigDescriptor } from '../btc-multisig-descriptor';
import { preSignVerification } from './pre-sign-verification';

function walletAccountIndexFromPath(path: string | null): number | undefined {
  if (!path) return undefined;
  const last = path
    .split('/')
    .filter(segment => segment && segment !== 'm')
    .at(-1);
  if (!last) return undefined;
  const index = Number.parseInt(last.replace(/['h]/gi, ''), 10);
  return Number.isNaN(index) ? undefined : index;
}

export async function signBtcTransaction(
  transaction: MultisigTransaction,
  account: VaultAccount,
  signerPubkey: string
): Promise<{ signature: string; inputIndex?: number }[]> {
  preSignVerification({ transaction, account });
  const descriptor = getMultisigDescriptor(account);
  const psbtHex = psbtBase64ToHex(transaction.proposalRawPayload);
  const mySigner = account.signers.find(signer => signer.signingPubkey === signerPubkey);
  const walletAccount = walletAccountIndexFromPath(mySigner?.xpubOriginPath ?? null);
  const { hex } = await leather.signPsbt({
    hex: psbtHex,
    descriptor,
    network: resolveWalletRpcNetwork(transaction.network),
    ...(walletAccount !== undefined ? { account: walletAccount } : {}),
  });
  return extractWshMultisigSignatures(hex, signerPubkey);
}
