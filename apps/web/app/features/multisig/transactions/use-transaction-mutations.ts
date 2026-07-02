import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { AuthNetworkId, MultisigTransaction, VaultAccount } from '@leather.io/models';
import { getMultisigService } from '@leather.io/services';

import { useSession } from '../auth/use-session';
import { multisigVaultKeys } from '../vaults/vault-query-keys';
import { signBtcTransaction } from './signing/sign-btc-transaction';
import { signStxTransaction } from './signing/sign-stx-transaction';

export function useInvalidateTransaction(network: AuthNetworkId) {
  const queryClient = useQueryClient();
  const session = useSession(network);
  return function invalidate(transaction: MultisigTransaction) {
    const address = session?.identity.address;
    void queryClient.invalidateQueries({
      queryKey: multisigVaultKeys.transaction(network, address, transaction.id),
    });
    void queryClient.invalidateQueries({
      queryKey: multisigVaultKeys.accountTransactions(network, address, transaction.vaultAccountId),
    });
  };
}

interface SignTransactionArgs {
  transaction: MultisigTransaction;
  account: VaultAccount;
}

function findSignerPublicKey(account: VaultAccount, identityPublicKey?: string): string {
  const signer = account.signers.find(signer => signer.publicKey === identityPublicKey);
  if (!signer) throw new Error('You are not a signer on this account.');
  return signer.signingPubkey;
}

export function useSignTransaction(network: AuthNetworkId) {
  const session = useSession(network);
  const invalidate = useInvalidateTransaction(network);
  return useMutation<MultisigTransaction, Error, SignTransactionArgs>({
    async mutationFn({ transaction, account }) {
      const signatures = network.startsWith('btc')
        ? await signBtcTransaction(
            transaction,
            account,
            findSignerPublicKey(account, session?.identity.publicKey)
          )
        : await signStxTransaction(transaction, account);
      return getMultisigService().addTransactionSignatures(network, transaction.id, { signatures });
    },
    onSuccess: invalidate,
  });
}

export function useCancelTransaction(network: AuthNetworkId) {
  const invalidate = useInvalidateTransaction(network);
  return useMutation<MultisigTransaction, Error, string>({
    mutationFn(transactionId) {
      return getMultisigService().cancelTransaction(network, transactionId);
    },
    onSuccess: invalidate,
  });
}

export function useBroadcastTransaction(network: AuthNetworkId) {
  const invalidate = useInvalidateTransaction(network);
  return useMutation<MultisigTransaction, Error, string>({
    mutationFn(transactionId) {
      return getMultisigService().broadcastTransaction(network, transactionId);
    },
    onSuccess: invalidate,
  });
}
