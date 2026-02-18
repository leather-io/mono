import { useCallback } from 'react';

import type { StacksTransactionWire } from '@stacks/transactions';

import { FeeTypes } from '@leather.io/models';
import { defaultFeesMaxValuesAsMoney } from '@leather.io/query';

import { logger } from '@shared/logger';
import { RouteUrls } from '@shared/route-urls';

import { useToast } from '@app/features/toasts/use-toast';
import { useConfigSbtc } from '@app/query/common/remote-config/remote-config.query';
import {
  type TransactionBase,
  submitSponsoredSbtcTransaction,
  verifySponsoredSbtcTransaction,
} from '@app/query/sbtc/sponsored-transactions.query';
import { useNavigate } from '@app/routes/compat';
import { useAppDispatch } from '@app/store';
import { miscNavigationSlice } from '@app/store/navigation/misc-navigation.slice';
import { useSignStacksTransaction } from '@app/store/transactions/transaction.hooks';
import { LoadingKeys, useLoading } from '@app/store/ui/ui.hooks';

export function useSponsorTransactionFees() {
  const { sponsorshipApiUrl } = useConfigSbtc();
  const { setIsIdle } = useLoading(LoadingKeys.SUBMIT_SWAP_TRANSACTION);
  const signTx = useSignStacksTransaction();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();

  async function checkEligibilityForSponsor(baseTx: TransactionBase) {
    return await verifySponsoredSbtcTransaction({
      apiUrl: sponsorshipApiUrl,
      baseTx,
      nonce: Number(baseTx.options.nonce),
      fee: defaultFeesMaxValuesAsMoney[FeeTypes.Middle].amount.toNumber(),
    });
  }

  const submitSponsoredTx = useCallback(
    async (unsignedSponsoredTx: StacksTransactionWire) => {
      try {
        const signedSponsoredTx = await signTx(unsignedSponsoredTx);
        if (!signedSponsoredTx) return logger.error('Unable to sign sponsored transaction');

        const result = await submitSponsoredSbtcTransaction(sponsorshipApiUrl, signedSponsoredTx);
        if (!result.txid) {
          dispatch(
            miscNavigationSlice.actions.setErrorState({ message: result.error ?? '', title: '' })
          );
          void navigate(RouteUrls.SwapError);
          return;
        }

        toast.success('Transaction submitted!');
        setIsIdle();
        void navigate(RouteUrls.Activity);
      } catch (error) {
        return logger.error('Failed to submit sponsor transaction', error);
      }
    },
    [dispatch, navigate, setIsIdle, signTx, toast, sponsorshipApiUrl]
  );

  return {
    checkEligibilityForSponsor,
    submitSponsoredTx,
  };
}
