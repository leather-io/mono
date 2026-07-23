import { useMemo } from 'react';

import { FormikHelpers } from 'formik';
import * as yup from 'yup';

import { STX_DECIMALS } from '@leather.io/constants';
import { convertAmountToBaseUnit, createMoney } from '@leather.io/utils';

import { logger } from '@shared/logger';
import { StacksSendFormValues } from '@shared/models/form.model';

import {
  stxAmountValidator,
  stxAvailableBalanceValidator,
} from '@app/common/validation/forms/amount-validators';
import { stxFeeValidator } from '@app/common/validation/forms/fee-validators';
import { useUpdatePersistedSendFormValues } from '@app/features/popup-send-form-restoration/use-update-persisted-send-form-values';
import { useStxAccountBalanceByAddresses } from '@app/query/stacks/balance/stx-balance.hooks';
import { useStacksTransactionFees } from '@app/query/stacks/fees/stacks-transaction-fees.hooks';
import { useStacksValidateFeeByNonce } from '@app/query/stacks/mempool/mempool.hooks';
import { useCurrentAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentStacksAccountAddress } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';
import {
  useGenerateStxTokenTransferUnsignedTx,
  useStxTokenTransferUnsignedTxState,
} from '@app/store/transactions/token-transfer.hooks';

import { useStacksCommonSendForm } from '../../family/stacks/use-stacks-common-send-form';
import { useSendFormNavigate } from '../../hooks/use-send-form-navigate';

export function useStxSendForm() {
  const policy = useCurrentPolicy();
  const isStacksPolicy = policy?.chain === 'stacks';
  const unsignedTx = useStxTokenTransferUnsignedTxState();
  const { data: stxFees } = useStacksTransactionFees(
    unsignedTx,
    policy?.chain === 'stacks' ? policy.publicKeys.length : undefined
  );
  const generateTx = useGenerateStxTokenTransferUnsignedTx();
  const { onFormStateChange } = useUpdatePersistedSendFormValues();
  const sendFormNavigate = useSendFormNavigate();
  const address = useCurrentStacksAccountAddress();
  const { changeFeeByNonce } = useStacksValidateFeeByNonce(address);

  // get stx balance
  const balance = useStxAccountBalanceByAddresses(useCurrentAccountAddresses());
  const availableBalance = balance.value?.stx.availableUnlockedBalance ?? createMoney(0, 'STX');

  const sendMaxBalance = useMemo(() => {
    const standardFee = stxFees?.options.standard.value.amount || 0;
    return convertAmountToBaseUnit(availableBalance.amount.minus(standardFee), STX_DECIMALS);
  }, [availableBalance.amount, stxFees?.options]);

  const { initialValues, checkFormValidation, recipient, memo, nonce } = useStacksCommonSendForm({
    symbol: 'STX',
    availableTokenBalance: availableBalance,
  });

  const validationSchema = useMemo(
    () =>
      yup.object({
        amount: stxAmountValidator(availableBalance).concat(
          stxAvailableBalanceValidator(availableBalance)
        ),
        fee: stxFeeValidator(availableBalance),
        recipient,
        memo,
        nonce,
      }),
    [availableBalance, recipient, memo, nonce]
  );

  return {
    availableBalance,
    initialValues,
    onFormStateChange,
    sendMaxBalance,
    stxFees,
    validationSchema,

    async previewTransaction(
      values: StacksSendFormValues,
      formikHelpers: FormikHelpers<StacksSendFormValues>
    ) {
      const isFormValid = await checkFormValidation(values, formikHelpers);

      if (!isFormValid) return;

      if (isStacksPolicy) {
        const multisigTx = await generateTx(values);
        if (!multisigTx)
          return logger.error('Attempted to generate unsigned tx, but tx is undefined');
        return void sendFormNavigate.toConfirmAndSignStxTransaction(multisigTx, false);
      }

      const initialFee = values.fee;
      values.fee = changeFeeByNonce({
        nonce: Number(values.nonce),
        fee: Number(values.fee),
      });

      // if fee has changed, show info message
      const showFeeChangeWarning = initialFee !== values.fee;

      const tx = await generateTx(values);
      if (!tx) return logger.error('Attempted to generate unsigned tx, but tx is undefined');
      void sendFormNavigate.toConfirmAndSignStxTransaction(tx, showFeeChangeWarning);
    },
  };
}
