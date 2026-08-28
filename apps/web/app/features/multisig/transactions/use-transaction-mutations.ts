import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { AuthNetworkId, MultisigTransaction, VaultAccount } from '@leather.io/models';
import { getMultisigService } from '@leather.io/services';

import { useSession } from '../auth/use-session';
import { multisigVaultKeys } from '../vaults/vault-query-keys';
import { getMySigningPubkey } from './signing/get-my-signing-pubkey';
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

export function useSignTransaction(network: AuthNetworkId) {
  const invalidate = useInvalidateTransaction(network);
  const myPublicKey = useSession(network)?.identity.publicKey;
  return useMutation<MultisigTransaction, Error, SignTransactionArgs>({
    async mutationFn({ transaction, account }) {
      const signatures = network.startsWith('btc')
        ? await signBtcTransaction(transaction, account, getMySigningPubkey(account, myPublicKey))
        : await signStxTransaction(transaction, account);
      if (signatures.length === 0) {
        throw new Error(
          'Your wallet did not add a signature. Make sure the account active in the extension is the one that joined this vault, then try again.'
        );
      }
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
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTransaction(network);
  return useMutation<MultisigTransaction, Error, string>({
    mutationFn(transactionId) {
      return getMultisigService().broadcastTransaction(network, transactionId);
    },
    onSuccess(transaction) {
      invalidate(transaction);
      void queryClient.invalidateQueries({ queryKey: ['asset-list-service--get-asset-list'] });
      void queryClient.invalidateQueries({
        queryKey: ['btc-balances-service--get-btc-account-balance'],
      });
      void queryClient.invalidateQueries({
        queryKey: ['stx-balances-service--get-stx-account-balance'],
      });
    },
  });
}
