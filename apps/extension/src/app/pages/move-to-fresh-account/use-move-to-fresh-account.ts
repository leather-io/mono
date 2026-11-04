import { useState } from 'react';
import { useNavigate } from 'react-router';

import { type StacksTransactionWire } from '@stacks/transactions';
import { useQuery } from '@tanstack/react-query';

import { getHiroStacksApiClient } from '@leather.io/services';
import { isDefined, isString, noop } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { useKeyActions } from '@app/common/hooks/use-key-actions';
import { useSubmitTransactionCallback } from '@app/common/hooks/use-submit-stx-transaction';
import { toastDurations, useToast } from '@app/features/toasts/use-toast';
import { useStxAccountBalance } from '@app/query/stacks/balance/stx-balance.hooks';
import { useNextNonce } from '@app/query/stacks/nonce/account-nonces.hooks';
import { useSip10AddressTransferableTokenBalances } from '@app/query/stacks/sip10/sip10-balance.hooks';
import { useCurrentAccountId } from '@app/store/accounts/account';
import {
  useCurrentStacksAccount,
  useCurrentStacksAccountAddress,
  useFreshStacksAccount,
  useFreshStacksAccountAddress,
} from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentStacksNetworkState } from '@app/store/networks/networks.hooks';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';
import { useSignStacksTransaction } from '@app/store/transactions/transaction.hooks';
import { LoadingKeys } from '@app/store/ui/ui.hooks';

import { buildMovePlan } from './move-to-fresh-account.utils';

export function useMoveToFreshAccount() {
  const navigate = useNavigate();
  const toast = useToast();
  const keyActions = useKeyActions();
  const signStacksTransaction = useSignStacksTransaction();
  const submitTransaction = useSubmitTransactionCallback({
    loadingKey: LoadingKeys.SUBMIT_STACKS_TRANSACTION,
  });
  const [isMoving, setIsMoving] = useState(false);

  const policy = useCurrentPolicy();
  const network = useCurrentStacksNetworkState();
  const currentAccount = useCurrentStacksAccount();
  const sender = useCurrentStacksAccountAddress();
  const freshAccount = useFreshStacksAccount();
  const recipient = useFreshStacksAccountAddress();

  const { data: senderNonce } = useNextNonce(sender);
  const { data: recipientNonce } = useNextNonce(recipient);
  const isFreshAccountUnused = recipientNonce?.nonce === 0;

  const stxBalance = useStxAccountBalance(useCurrentAccountId());
  const availableStx = stxBalance.value?.stx.availableUnlockedBalance;
  const { sip10s, isLoading: isLoadingTokens } = useSip10AddressTransferableTokenBalances(sender);
  const nftHoldings = useQuery({
    queryKey: ['move-to-fresh-account-nft-holdings', sender],
    queryFn: ({ signal }) =>
      getHiroStacksApiClient().getNftHoldings(sender, { allPages: true }, { signal }),
    enabled: Boolean(sender),
  });

  const isAvailable = !policy && Boolean(freshAccount) && isFreshAccountUnused;

  const startNonce = senderNonce?.nonce;
  const planArgs =
    isAvailable &&
    currentAccount &&
    availableStx &&
    isDefined(startNonce) &&
    !isLoadingTokens &&
    nftHoldings.data
      ? {
          publicKey: currentAccount.stxPublicKey,
          network,
          sender,
          recipient,
          startNonce,
          availableStx,
          tokens: sip10s.map(token => ({
            assetId: token.asset.assetId,
            symbol: token.asset.symbol,
            decimals: token.asset.decimals,
            amount: token.crypto.availableBalance.amount,
          })),
          nfts: nftHoldings.data.map(nft => ({
            assetIdentifier: nft.asset_identifier,
            tokenIdHex: nft.value.hex,
            tokenIdRepr: nft.value.repr,
          })),
        }
      : null;

  const plan = useQuery({
    queryKey: ['move-to-fresh-account-plan', planArgs],
    enabled: Boolean(planArgs),
    gcTime: 0,
    queryFn: () => (planArgs ? buildMovePlan(planArgs) : null),
  });

  async function broadcast(tx: StacksTransactionWire) {
    let errorMessage = 'Unknown error';
    const result = await submitTransaction({
      onSuccess: noop,
      onError(error) {
        errorMessage = isString(error) ? error : error.message;
      },
    })(tx);
    return result ? null : errorMessage;
  }

  function switchToFreshAccount() {
    if (!freshAccount) return;
    if (freshAccount.type === 'software') return void keyActions.createNewAccount();
    keyActions.switchAccount({
      fingerprint: freshAccount.fingerprint,
      accountIndex: freshAccount.accountIndex,
    });
  }

  async function moveEverything() {
    if (!plan.data) return;
    const { transactions } = plan.data;
    setIsMoving(true);
    try {
      // TODO: test ledger flow
      const signed: StacksTransactionWire[] = [];
      for (const tx of transactions) {
        const signedTx = await signStacksTransaction(tx);
        if (!signedTx) return toast.error('Signing was cancelled. Nothing was sent.');
        signed.push(signedTx);
      }

      for (const [index, tx] of signed.entries()) {
        const error = await broadcast(tx);
        if (error)
          return toast.error(
            `Sent ${index} of ${signed.length} transactions, then stopped: ${error}`
          );
      }

      switchToFreshAccount();
      toast.success('Moved everything and switched to the fresh account', {
        duration: toastDurations.standard,
      });
      return void navigate(RouteUrls.Home);
    } catch {
      return toast.error('Signing was cancelled. Nothing was sent.');
    } finally {
      setIsMoving(false);
    }
  }

  return {
    isAvailable,
    isCheckingFreshAccount: Boolean(recipient) && !recipientNonce,
    isLoading: isAvailable && !plan.data && !plan.error,
    isMoving,
    freshAddress: recipient,
    plan: plan.data,
    planError: plan.error?.message,
    moveEverything,
  };
}
