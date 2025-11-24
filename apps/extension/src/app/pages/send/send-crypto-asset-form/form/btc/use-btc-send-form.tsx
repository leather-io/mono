import { useCallback, useEffect, useRef, useState } from 'react';

import { FormikHelpers, FormikProps } from 'formik';
import BigNumber from 'bignumber.js';
import * as yup from 'yup';

import { bitcoinNetworkModeToCoreNetworkMode } from '@leather.io/bitcoin';
import { createMoney } from '@leather.io/utils';

import {
  btcAddressNetworkValidator,
  btcAddressValidator,
  nonEmptyStringValidator,
} from '@shared/forms/address-validators';
import { BitcoinSendFormValues } from '@shared/models/form.model';

import { formatPrecisionError } from '@app/common/error-formatters';
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
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

import { useCalculateMaxBitcoinSpend } from '../../../../../common/hooks/balance/use-calculate-max-spend';
import { useSendFormNavigate } from '../../hooks/use-send-form-navigate';

const defaultMaxSpend = {
  spendAllFee: 0,
  amount: createMoney(0, 'BTC'),
  spendableBitcoin: new BigNumber(0),
};

export function useBtcSendForm() {
  const [isSendingMax, setIsSendingMax] = useState(false);
  const [currentRecipient, setCurrentRecipient] = useState('');
  const [maxSpend, setMaxSpend] = useState(defaultMaxSpend);
  const formRef = useRef<FormikProps<BitcoinSendFormValues>>(null);
  const currentNetwork = useCurrentNetwork();
  const { btc: balance } = useCurrentNativeSegwitBtcBalanceWithFallback();
  const sendFormNavigate = useSendFormNavigate();
  const calcMaxSpend = useCalculateMaxBitcoinSpend();
  const { onFormStateChange: updatePersistedFormState } = useUpdatePersistedSendFormValues();

  useEffect(() => {
    let canceled = false;
    void calcMaxSpend(currentRecipient)
      .then(result => {
        if (!canceled && result) setMaxSpend(result);
      })
      .catch(() => {
        if (!canceled) setMaxSpend(defaultMaxSpend);
      });
    return () => {
      canceled = true;
    };
  }, [calcMaxSpend, currentRecipient]);

  const onFormStateChange = useCallback(
    (values: BitcoinSendFormValues) => {
      updatePersistedFormState(values);
      if (values.recipient !== currentRecipient) {
        setCurrentRecipient(values.recipient);
      }
    },
    [currentRecipient, updatePersistedFormState]
  );

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
    maxSpend,
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
      void sendFormNavigate.toChooseTransactionFee(isSendingMax, values);
    },
  };
}
