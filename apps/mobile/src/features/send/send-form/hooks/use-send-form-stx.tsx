import { useGenerateStxTokenTransferUnsignedTransaction } from '@/common/transactions/stacks-transactions.hooks';
import { bytesToHex } from '@noble/hashes/utils';
import BigNumber from 'bignumber.js';

import { createMoneyFromDecimal } from '@leather.io/utils';

import {
  CreateCurrentSendRoute,
  useSendSheetNavigation,
  useSendSheetRoute,
} from '../../send-form.utils';
import { SendFormStxContext } from '../providers/send-form-stx-provider';
import { SendFormStxSchema } from '../schemas/send-form-stx.schema';

export type CurrentRoute = CreateCurrentSendRoute<'send-form-stx'>;

function parseSendFormValues(values: SendFormStxSchema) {
  return {
    amount: createMoneyFromDecimal(new BigNumber(values.amount), 'STX'),
    fee: createMoneyFromDecimal(new BigNumber(values.fee), 'STX'),
    memo: values.memo,
    nonce: values.nonce,
    recipient: values.recipient,
  };
}

export function useSendFormStx() {
  const route = useSendSheetRoute<CurrentRoute>();
  const navigation = useSendSheetNavigation<CurrentRoute>();

  const generateTx = useGenerateStxTokenTransferUnsignedTransaction(
    route.params.address,
    route.params.publicKey
  );

  return {
    onGoBack() {
      navigation.navigate('send-select-asset', { account: route.params.account });
    },
    // Temporary logs until we can hook up to approver flow
    async onInitSendTransfer(data: SendFormStxContext, values: SendFormStxSchema) {
      // eslint-disable-next-line no-console, lingui/no-unlocalized-strings
      console.log('Send form data:', values);
      const tx = await generateTx(parseSendFormValues(values));
      // eslint-disable-next-line no-console, lingui/no-unlocalized-strings
      console.log('Unsigned tx:', tx);
      // Show an error toast here?
      if (!tx) throw new Error('Attempted to generate unsigned tx, but tx is undefined');
      const txHex = bytesToHex(tx.serialize());
      // eslint-disable-next-line no-console, lingui/no-unlocalized-strings
      console.log('tx hex:', txHex);
      // eslint-disable-next-line no-console, lingui/no-unlocalized-strings
      console.log('fees:', data.fees);
    },
  };
}
