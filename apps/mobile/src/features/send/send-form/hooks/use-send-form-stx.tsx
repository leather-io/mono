import { useGenerateStxTokenTransferUnsignedTransaction } from '@/common/transactions/stacks-transactions.hooks';
import { useToastContext } from '@/components/toast/toast-context';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import BigNumber from 'bignumber.js';

import { STX_DECIMALS } from '@leather.io/constants';
import { ChainId } from '@leather.io/models';
import { StacksError, isValidStacksTransaction } from '@leather.io/stacks';
import { createMoneyFromDecimal, isValidPrecision } from '@leather.io/utils';

import {
  CreateCurrentSendRoute,
  useSendSheetNavigation,
  useSendSheetRoute,
} from '../../send-form.utils';
import { SendFormStxContext } from '../providers/send-form-stx-provider';
import { SendFormStxSchema } from '../schemas/send-form-stx.schema';
import { formatStacksError } from '../validation/stx.validation';

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
  const navigation = useSendSheetNavigation<CurrentRoute>();
  const { networkPreference } = useSettings();
  const chainId: ChainId = networkPreference.chain.stacks.chainId;

  const { displayToast } = useToastContext();
  const generateTx = useGenerateStxTokenTransferUnsignedTransaction(payer, publicKey);

  return {
    onGoBack() {
      navigation.navigate('send-select-asset', { account });
    },
    // Temporary logs until we can hook up to approver flow
    async onInitSendTransfer(data: SendFormStxContext, values: SendFormStxSchema) {
      try {
        const parsedValues = parseSendFormValues(values);
        if (!isValidPrecision(+values.amount, STX_DECIMALS)) {
          throw new StacksError('InvalidPrecision');
        }
        const { amount, recipient } = parsedValues;
        isValidStacksTransaction({ amount, payer, recipient, chainId });
        const tx = await generateTx(parsedValues);

        if (!tx) {
          // logger('tx:', 'Attempted to generate raw tx, but no tx exists');
          throw new Error(); // should make a new TransactionError? or just generic here?
        }
        const txHex = tx.serialize();
        navigation.navigate('sign-stacks-tx', { txHex, accountId: account.id });
      } catch (e) {
        if (e instanceof StacksError) {
          displayToast({ title: formatStacksError(e.message), type: 'error' });
          return;
        }

        displayToast({
          title: t({ id: 'something-went-wrong', message: 'Something went wrong' }),
          type: 'error',
        });
      }
    },
  };
}
