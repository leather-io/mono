import { useToastContext } from '@/components/toast/toast-context';
import { useNetworkPreferenceStacksNetwork } from '@/store/settings/settings.read';
import { t } from '@lingui/macro';
import BigNumber from 'bignumber.js';

import { STX_DECIMALS } from '@leather.io/constants';
import { isAddressCompliant } from '@leather.io/query';
import {
  StacksError,
  TransactionTypes,
  generateStacksUnsignedTransaction,
  isValidStacksTransaction,
} from '@leather.io/stacks';
import { createMoneyFromDecimal, isValidPrecision } from '@leather.io/utils';

import {
  CreateCurrentSendRoute,
  useSendSheetNavigation,
  useSendSheetRoute,
} from '../../send-form.utils';
import { SendFormStxContext } from '../providers/send-form-stx-provider';
import { SendFormStxSchema } from '../schemas/send-form-stx.schema';
import { formatStacksError, trackAnalyticsForError } from '../validation/stx.validation';

export type CurrentRoute = CreateCurrentSendRoute<'send-form-stx'>;

function parseSendFormValues({ amount, fee, memo, nonce, recipient }: SendFormStxSchema) {
  return {
    amount: createMoneyFromDecimal(new BigNumber(amount), 'STX'),
    fee: createMoneyFromDecimal(new BigNumber(fee), 'STX'),
    memo,
    nonce,
    recipient,
  };
}

export function useSendFormStx() {
  const {
    params: { account, address: payer, publicKey },
  } = useSendSheetRoute<CurrentRoute>();
  const { displayToast } = useToastContext();
  const navigation = useSendSheetNavigation<CurrentRoute>();
  const stacksNetwork = useNetworkPreferenceStacksNetwork();
  const { chainId } = stacksNetwork;

  function handleNonCompliantAddress() {
    throw new StacksError('NonCompliantAddress');
  }

  return {
    onGoBack() {
      navigation.navigate('send-select-asset', { account });
    },
    async onInitSendTransfer({ availableBalance }: SendFormStxContext, values: SendFormStxSchema) {
      const parsedValues = parseSendFormValues(values);
      const { amount, fee, recipient } = parsedValues;
      try {
        // TODO LEA-1852 - move to form schema validation
        // 1. validate precision
        if (!isValidPrecision(+values.amount, STX_DECIMALS)) {
          throw new StacksError('InvalidPrecision');
        }
        // 2. validate transaction
        isValidStacksTransaction({
          amount,
          fee,
          payer,
          recipient,
          chainId,
          availableBalance: availableBalance,
        });
        // 3. validate address compliance

        try {
          const isCompliant = await isAddressCompliant({
            address: recipient,
            chain: chainId,
          });

          if (!isCompliant) {
            handleNonCompliantAddress();
          }
        } catch {
          handleNonCompliantAddress();
        }
        const tx = await generateStacksUnsignedTransaction({
          ...parsedValues,
          txType: TransactionTypes.StxTokenTransfer,
          network: stacksNetwork,
          publicKey,
        });

        if (!tx) throw new StacksError('InvalidTransaction');
        const txHex = tx.serialize();
        navigation.navigate('sign-stacks-tx', { txHex, accountId: account.id });
      } catch (e) {
        if (e instanceof StacksError) {
          trackAnalyticsForError({ errorMessage: e.message, address: recipient });
          displayToast({ title: formatStacksError(e.message), type: 'error' });
        } else {
          displayToast({
            title: t({ id: 'something-went-wrong', message: 'Something went wrong' }),
            type: 'error',
          });
        }
      }
    },
  };
}
