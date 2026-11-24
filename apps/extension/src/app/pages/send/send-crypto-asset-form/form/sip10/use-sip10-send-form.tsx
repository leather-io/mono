import { useMemo, useState } from 'react';

import BigNumber from 'bignumber.js';
import { type FormikHelpers } from 'formik';
import { z } from 'zod';

import type { CryptoAssetBalance, Money, Sip10Asset } from '@leather.io/models';
import { getSbtcSponsorshipNetwork } from '@leather.io/services';
import {
  convertAmountToBaseUnit,
  isDefined,
  subtractMoney,
  unitToFractionalUnit,
} from '@leather.io/utils';

import { logger } from '@shared/logger';
import { type StacksSendFormValues } from '@shared/models/form.model';

import { getSafeImageCanonicalUri } from '@app/common/stacks-utils';
import {
  getSbtcSponsorshipErrorMessage,
  getSbtcSponsorshipFeeTier,
  isSbtcContractPrincipal,
} from '@app/common/transactions/stacks/sbtc-sponsorship.utils';
import { useBuildSbtcSponsoredTransfer } from '@app/common/transactions/stacks/use-build-sbtc-sponsored-transfer';
import { createFormikValidationSchema } from '@app/common/validation/formik-validation-schema';
import { stacksFungibleTokenAmountValidator } from '@app/common/validation/forms/amount-validators';
import { stxFeeCurrency } from '@app/components/fees-row/fees-row';
import { useToast } from '@app/features/toasts/use-toast';
import { useStxAddressBalance } from '@app/query/stacks/balance/stx-balance.hooks';
import { useStacksTransactionFees } from '@app/query/stacks/fees/stacks-transaction-fees.hooks';
import { useCurrentStacksAccountAddress } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';
import {
  useFtTokenTransferUnsignedTx,
  useGenerateFtTokenTransferUnsignedTx,
} from '@app/store/transactions/token-transfer.hooks';

import { useStacksCommonSendForm } from '../../family/stacks/use-stacks-common-send-form';
import { useSendFormNavigate } from '../../hooks/use-send-form-navigate';

const stxFeeEstimateUnavailableMessage = 'The STX fee estimate is not available yet. Try again.';

interface UseSip10SendFormArgs {
  balance: CryptoAssetBalance;
  info: Sip10Asset;
}
export function useSip10SendForm({ balance, info }: UseSip10SendFormArgs) {
  const generateTx = useGenerateFtTokenTransferUnsignedTx(info);
  const buildSponsoredTransfer = useBuildSbtcSponsoredTransfer(info.contractId);
  const policy = useCurrentPolicy();
  const currentNetwork = useCurrentNetwork();
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
  const hasSponsorshipService = isDefined(
    getSbtcSponsorshipNetwork(currentNetwork.chain.stacks.chainId)
  );
  const canPayFeeInSbtc =
    hasSponsorshipService && isSbtcContractPrincipal(info.contractId) && !isStacksPolicy;

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
    const stxFee = stacksFtFees?.options[getSbtcSponsorshipFeeTier(values.feeType)].value;
    if (!stxFee) {
      toast.error(stxFeeEstimateUnavailableMessage);
      return;
    }
    try {
      const hasExplicitNonce = isDefined(values.nonce) && values.nonce !== '';
      const { tx, sponsorship } = await buildSponsoredTransfer({
        recipient: values.recipient,
        amount: BigInt(unitToFractionalUnit(info.decimals)(values.amount).toString(10)),
        memo: values.memo !== '' ? values.memo : undefined,
        nonce: hasExplicitNonce ? Number(values.nonce) : undefined,
        stxFeeMicro: stxFee.amount.toNumber(),
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
    validationSchema: createFormikValidationSchema(
      z.object({
        amount: stacksFungibleTokenAmountValidator(spendableTokenBalance),
        recipient,
        memo,
        nonce,
      })
    ),

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
