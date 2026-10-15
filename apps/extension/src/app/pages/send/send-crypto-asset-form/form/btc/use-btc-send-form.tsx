import { useRef, useState } from 'react';

import { type FormikHelpers, type FormikProps } from 'formik';
import { z } from 'zod';

import { FormErrorMessages } from '@shared/error-messages';
import {
  btcAddressNetworkValidator,
  btcAddressValidator,
  nonEmptyStringValidator,
} from '@shared/forms/address-validators';
import { numberField, stringField } from '@shared/forms/field-schemas';
import { type BitcoinSendFormValues } from '@shared/models/form.model';

import { formatPrecisionError } from '@app/common/error-formatters';
import { useOnMount } from '@app/common/hooks/use-on-mount';
import { createFormikValidationSchema } from '@app/common/validation/formik-validation-schema';
import {
  btcInsufficientBalanceValidator,
  btcMinimumSpendValidator,
} from '@app/common/validation/forms/amount-validators';
import { complianceValidator } from '@app/common/validation/forms/compliance-validators';
import {
  btcAmountPrecisionValidator,
  currencyAmountValidator,
} from '@app/common/validation/forms/currency-validators';
import { useUpdatePersistedSendFormValues } from '@app/features/popup-send-form-restoration/use-update-persisted-send-form-values';
import { useCurrentBtcBalanceWithFallback } from '@app/query/bitcoin/balance/btc-balance.hooks';
import { useCurrentUtxos } from '@app/query/bitcoin/utxos/utxos.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

import { useCalculateMaxBitcoinSpend } from '../../../../../common/hooks/balance/use-calculate-max-spend';
import { useSendFormNavigate } from '../../hooks/use-send-form-navigate';

type BtcSendFormValues = Pick<
  BitcoinSendFormValues,
  'amount' | 'recipient' | 'recipientBnsName' | 'symbol'
>;

export function useBtcSendForm() {
  const [isSendingMax, setIsSendingMax] = useState(false);
  const formRef = useRef<FormikProps<BtcSendFormValues>>(null);
  const currentNetwork = useCurrentNetwork();
  const { utxos, refetchUtxos } = useCurrentUtxos();
  const { btc: balance } = useCurrentBtcBalanceWithFallback();
  const sendFormNavigate = useSendFormNavigate();
  const calcMaxSpend = useCalculateMaxBitcoinSpend();
  const { onFormStateChange } = useUpdatePersistedSendFormValues();

  // Forcing a refetch to ensure UTXOs are fresh
  useOnMount(() => {
    void refetchUtxos();
  });

  return {
    balance,
    calcMaxSpend,
    currentNetwork,
    formRef,
    isSendingMax,
    onFormStateChange,
    onSetIsSendingMax(value: boolean) {
      setIsSendingMax(value);
    },
    utxos,
    validationSchema: createFormikValidationSchema(
      z.object({
        amount: numberField(FormErrorMessages.MustBeNumber).check(
          btcMinimumSpendValidator(),
          btcAmountPrecisionValidator(formatPrecisionError(balance.availableBalance)),
          currencyAmountValidator(),
          btcInsufficientBalanceValidator({
            calcMaxSpend,
            // TODO: investigate yup features for cross-field validation
            // to prevent need to access form via ref
            recipient: formRef.current?.values.recipient ?? '',
            utxos: utxos.available,
          })
        ),
        recipient: stringField().check(
          nonEmptyStringValidator(),
          btcAddressValidator(),
          btcAddressNetworkValidator(currentNetwork.chain.bitcoin.mode),
          complianceValidator(btcAddressValidator(), 'send_form_btc')
        ),
      })
    ),

    async chooseTransactionFee(
      values: BtcSendFormValues,
      formikHelpers: FormikHelpers<BtcSendFormValues>
    ) {
      // Validate and check high fee warning first
      await formikHelpers.validateForm();
      void sendFormNavigate.toChooseTransactionFee(isSendingMax, utxos.available, values);
    },
  };
}
