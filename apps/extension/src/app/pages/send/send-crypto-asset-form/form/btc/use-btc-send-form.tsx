import { useRef, useState } from 'react';

import { FormikHelpers, FormikProps } from 'formik';
import * as yup from 'yup';

import { bitcoinNetworkModeToCoreNetworkMode } from '@leather.io/bitcoin';

import {
  btcAddressNetworkValidator,
  btcAddressValidator,
  nonEmptyStringValidator,
} from '@shared/forms/address-validators';
import { BitcoinSendFormValues } from '@shared/models/form.model';

import { formatPrecisionError } from '@app/common/error-formatters';
import { useOnMount } from '@app/common/hooks/use-on-mount';
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
import { useCurrentNativeSegwitBtcBalanceWithFallback } from '@app/query/bitcoin/balance/btc-balance.hooks';
import { useCurrentNativeSegwitUtxos } from '@app/query/bitcoin/utxos/utxos.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

import { useCalculateMaxBitcoinSpend } from '@app/common/hooks/balance/use-calculate-max-spend';
import { useSendFormNavigate } from '../../hooks/use-send-form-navigate';

export function useBtcSendForm() {
  const [isSendingMax, setIsSendingMax] = useState(false);
  const formRef = useRef<FormikProps<BitcoinSendFormValues>>(null);
  const currentNetwork = useCurrentNetwork();
  const { utxos, refetchUtxos } = useCurrentNativeSegwitUtxos();
  const { btc: balance } = useCurrentNativeSegwitBtcBalanceWithFallback();
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
    validationSchema: yup.object({
      amount: yup
        .number()
        .concat(btcMinimumSpendValidator())
        .concat(btcAmountPrecisionValidator(formatPrecisionError(balance.availableBalance)))
        .concat(currencyAmountValidator())
        .concat(
          btcInsufficientBalanceValidator({
            calcMaxSpend,
            // TODO: investigate yup features for cross-field validation
            // to prevent need to access form via ref
            recipient: formRef.current?.values.recipient ?? '',
            utxos: utxos.available,
          })
        ),
      recipient: nonEmptyStringValidator()
        .concat(btcAddressValidator())
        .concat(btcAddressNetworkValidator(currentNetwork.chain.bitcoin.mode))
        .concat(
          complianceValidator(
            btcAddressValidator(),
            bitcoinNetworkModeToCoreNetworkMode(currentNetwork.chain.bitcoin.mode)
          )
        ),
    }),

    async chooseTransactionFee(
      values: BitcoinSendFormValues,
      formikHelpers: FormikHelpers<BitcoinSendFormValues>
    ) {
      // Validate and check high fee warning first
      await formikHelpers.validateForm();
      void sendFormNavigate.toChooseTransactionFee(isSendingMax, utxos.available, values);
    },
  };
}
