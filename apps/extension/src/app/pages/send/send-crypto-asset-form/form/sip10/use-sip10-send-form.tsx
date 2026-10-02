import { useMemo, useState } from 'react';

import BigNumber from 'bignumber.js';
import { FormikHelpers } from 'formik';
import * as yup from 'yup';

import type { CryptoAssetBalance, Money, Sip10Asset } from '@leather.io/models';
import { convertAmountToBaseUnit, subtractMoney } from '@leather.io/utils';

import { logger } from '@shared/logger';
import { StacksSendFormValues } from '@shared/models/form.model';

import { getSafeImageCanonicalUri } from '@app/common/stacks-utils';
import {
  getSbtcSponsorshipErrorMessage,
  getSbtcSponsorshipFeeTier,
  isSbtcContractPrincipal,
} from '@app/common/transactions/stacks/sbtc-sponsorship.utils';
import { useBuildSbtcSponsoredTransfer } from '@app/common/transactions/stacks/use-build-sbtc-sponsored-transfer';
import { stacksFungibleTokenAmountValidator } from '@app/common/validation/forms/amount-validators';
import { stxFeeCurrency } from '@app/components/fees-row/fees-row.constants';
import { useToast } from '@app/features/toasts/use-toast';
import { useStxAddressBalance } from '@app/query/stacks/balance/stx-balance.hooks';
import { useStacksTransactionFees } from '@app/query/stacks/fees/stacks-transaction-fees.hooks';
import { useCurrentStacksAccountAddress } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';
import {
  useFtTokenTransferUnsignedTx,
  useGenerateFtTokenTransferUnsignedTx,
} from '@app/store/transactions/token-transfer.hooks';

import { useStacksCommonSendForm } from '../../family/stacks/use-stacks-common-send-form';
import { useSendFormNavigate } from '../../hooks/use-send-form-navigate';

const releaseSbtcSponsorship = true;

interface UseSip10SendFormArgs {
  balance: CryptoAssetBalance;
  info: Sip10Asset;
}
export function useSip10SendForm({ balance, info }: UseSip10SendFormArgs) {
  const generateTx = useGenerateFtTokenTransferUnsignedTx(info);
  const buildSponsoredTransfer = useBuildSbtcSponsoredTransfer({
    assetId: info.assetId,
    decimals: info.decimals,
  });
  const policy = useCurrentPolicy();
  const toast = useToast();
  const stxAddress = useCurrentStacksAccountAddress();
  const stxBalance = useStxAddressBalance(stxAddress);
  const [selectedSbtcFee, setSelectedSbtcFee] = useState<Money | null>(null);

  const sendFormNavigate = useSendFormNavigate();

  const unsignedTx = useFtTokenTransferUnsignedTx(info);
  const { data: stacksFtFees } = useStacksTransactionFees(
    unsignedTx,
    policy?.chain === 'stacks' ? policy.publicKeys.length : undefined
  );

  const isStacksPolicy = policy?.chain === 'stacks';
  const canPayFeeInSbtc =
    releaseSbtcSponsorship && isSbtcContractPrincipal(info.contractId) && !isStacksPolicy;

  const availableTokenBalance = balance.availableBalance;

  const lowestStxFee = stacksFtFees?.options.low.value;
  const canCoverStxFee = useMemo(() => {
    if (stxBalance.state !== 'success' || !lowestStxFee) return undefined;
    return stxBalance.value.stx.availableUnlockedBalance.amount.isGreaterThanOrEqualTo(
      lowestStxFee.amount
    );
  }, [lowestStxFee, stxBalance]);
  const hasSbtcBalance = availableTokenBalance.amount.isGreaterThan(0);
  const offerSbtcFee = canPayFeeInSbtc && canCoverStxFee === false && hasSbtcBalance;

  const spendableTokenBalance = useMemo(() => {
    if (!selectedSbtcFee || selectedSbtcFee.symbol !== availableTokenBalance.symbol)
      return availableTokenBalance;
    return subtractMoney(availableTokenBalance, selectedSbtcFee);
  }, [availableTokenBalance, selectedSbtcFee]);

  const sendMaxBalance = useMemo(() => {
    const max = convertAmountToBaseUnit(spendableTokenBalance);
    return max.isNegative() ? new BigNumber(0) : max;
  }, [spendableTokenBalance]);

  const { initialValues, checkFormValidation, recipient, memo, nonce } = useStacksCommonSendForm({
    symbol: info.symbol,
    availableTokenBalance,
  });

  function createFtAvatar() {
    return {
      avatar: info.contractId,
      imageCanonicalUri: getSafeImageCanonicalUri(info.imageCanonicalUri, info.name),
    };
  }

  async function previewSponsoredTransaction(values: StacksSendFormValues) {
    try {
      const { tx, sponsorship } = await buildSponsoredTransfer({
        formValues: values,
        feeTier: getSbtcSponsorshipFeeTier(values.feeType),
      });
      void sendFormNavigate.toConfirmAndSignStacksSip10Transaction({
        decimals: info.decimals,
        name: info.name,
        tx,
        sponsorship,
      });
    } catch (error) {
      logger.error('Failed to build the sponsored sBTC transaction', error);
      toast.error(getSbtcSponsorshipErrorMessage(error));
    }
  }

  return {
    availableTokenBalance,
    canPayFeeInSbtc,
    offerSbtcFee,
    onSelectedSbtcFeeChange: setSelectedSbtcFee,
    initialValues,
    sendMaxBalance,
    stacksFtFees,
    symbol: info.symbol,
    decimals: info.decimals,
    avatar: createFtAvatar(),
    validationSchema: yup.object({
      amount: stacksFungibleTokenAmountValidator(spendableTokenBalance),
      recipient,
      memo,
      nonce,
    }),

    async previewTransaction(
      values: StacksSendFormValues,
      formikHelpers: FormikHelpers<StacksSendFormValues>
    ) {
      const isFormValid = await checkFormValidation(values, formikHelpers);
      if (!isFormValid) return;

      if (values.feeCurrency !== stxFeeCurrency) return previewSponsoredTransaction(values);

      const tx = await generateTx(values);
      if (!tx) return logger.error('Attempted to generate unsigned tx, but tx is undefined');

      void sendFormNavigate.toConfirmAndSignStacksSip10Transaction({
        decimals: info.decimals,
        name: info.name,
        tx,
      });
    },
  };
}
