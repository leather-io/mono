import { useMemo, useState } from 'react';

import { type FormikHelpers } from 'formik';
import { z } from 'zod';

import { STX_DECIMALS } from '@leather.io/constants';
import {
  convertAmountToBaseUnit,
  createMoney,
  microStxToStx,
  stxToMicroStx,
} from '@leather.io/utils';

import { logger } from '@shared/logger';
import { type StacksSendFormValues } from '@shared/models/form.model';

import { getNonceFromStacksTransaction } from '@app/common/transactions/stacks/transaction.utils';
import { createFormikValidationSchema } from '@app/common/validation/formik-validation-schema';
import {
  stxAmountValidator,
  stxAvailableBalanceValidator,
} from '@app/common/validation/forms/amount-validators';
import { stxFeeValidator } from '@app/common/validation/forms/fee-validators';
import { useFlags } from '@app/features/feature-flags';
import { useUpdatePersistedSendFormValues } from '@app/features/popup-send-form-restoration/use-update-persisted-send-form-values';
import { useToast } from '@app/features/toasts/use-toast';
import { useStxAccountBalanceByAddresses } from '@app/query/stacks/balance/stx-balance.hooks';
import { useStacksTransactionFees } from '@app/query/stacks/fees/stacks-transaction-fees.hooks';
import { useStacksValidateFeeByNonce } from '@app/query/stacks/mempool/mempool.hooks';
import { useNextNonce } from '@app/query/stacks/nonce/account-nonces.hooks';
import { useCurrentAccountAddresses } from '@app/services/accounts/use-account-addresses';
import {
  useCurrentStacksAccountAddress,
  useRotationStacksAccountAddress,
} from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';
import {
  useGenerateStxTokenTransferUnsignedTx,
  useStxTokenTransferUnsignedTxState,
} from '@app/store/transactions/token-transfer.hooks';

import { useStacksCommonSendForm } from '../../family/stacks/use-stacks-common-send-form';
import { useSendFormNavigate } from '../../hooks/use-send-form-navigate';
import { calculateRotationAmount } from './send-and-rotate.utils';

export function useStxSendForm() {
  const policy = useCurrentPolicy();
  const isStacksPolicy = policy?.chain === 'stacks';
  const { stxSendAndRotate } = useFlags();
  const nextAccountAddress = useRotationStacksAccountAddress();
  const { data: nextAccountNonce } = useNextNonce(nextAccountAddress);
  const hasNextAccountNeverSent = nextAccountNonce?.nonce === 0;
  const isRotateAvailable =
    Boolean(stxSendAndRotate) &&
    !isStacksPolicy &&
    Boolean(nextAccountAddress) &&
    hasNextAccountNeverSent;
  const [isRotateSelected, setIsRotateSelected] = useState(false);
  const isRotating = isRotateAvailable && isRotateSelected;

  const unsignedTx = useStxTokenTransferUnsignedTxState();
  const { data: stxFees } = useStacksTransactionFees(
    unsignedTx,
    policy?.chain === 'stacks' ? policy.publicKeys.length : undefined
  );
  const generateTx = useGenerateStxTokenTransferUnsignedTx();
  const toast = useToast();
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
      createFormikValidationSchema(values =>
        z.object({
          amount: stxAmountValidator(availableBalance).check(
            stxAvailableBalanceValidator(availableBalance, values)
          ),
          fee: stxFeeValidator(availableBalance),
          recipient,
          memo,
          nonce,
        })
      ),
    [availableBalance, recipient, memo, nonce]
  );

  return {
    availableBalance,
    initialValues,
    isRotateAvailable,
    isRotateSelected,
    setIsRotateSelected,
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

      // Two native transfers, not a contract call: supports exchange memos and Ledger, no contract dependency
      if (isRotating) {
        if (showFeeChangeWarning)
          return toast.error('Cannot move remaining STX while replacing a pending transaction');

        const rotationAmount = calculateRotationAmount({
          availableBalance: availableBalance.amount,
          amount: stxToMicroStx(values.amount),
          feePerTransfer: stxToMicroStx(values.fee),
        });
        if (!rotationAmount.isGreaterThan(0))
          return formikHelpers.setFieldError('amount', 'No STX left to move to a fresh address');

        const sendTx = await generateTx(values);
        if (!sendTx) return logger.error('Attempted to generate unsigned tx, but tx is undefined');

        const rotationTx = await generateTx({
          ...values,
          recipient: nextAccountAddress,
          recipientBnsName: '',
          amount: microStxToStx(rotationAmount).toFixed(),
          memo: '',
          nonce: getNonceFromStacksTransaction(sendTx) + 1,
        });
        if (!rotationTx)
          return logger.error('Attempted to generate rotation tx, but tx is undefined');

        return void sendFormNavigate.toConfirmAndSignStxSendAndRotate(sendTx, rotationTx);
      }

      const tx = await generateTx(values);
      if (!tx) return logger.error('Attempted to generate unsigned tx, but tx is undefined');
      void sendFormNavigate.toConfirmAndSignStxTransaction(tx, showFeeChangeWarning);
    },
  };
}
