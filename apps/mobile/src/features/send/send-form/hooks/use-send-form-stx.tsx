import { useGenerateStxTokenTransferUnsignedTransaction } from '@/common/transactions/stacks-transactions.hooks';
import { useToastContext } from '@/components/toast/toast-context';
import { useSettings } from '@/store/settings/settings';
import { analytics } from '@/utils/analytics';
import { t } from '@lingui/macro';
import BigNumber from 'bignumber.js';

import { STX_DECIMALS } from '@leather.io/constants';
import { ChainId } from '@leather.io/models';
import { isAddressCompliant } from '@leather.io/query';
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

  function handleNonCompliantAddress(address: string) {
    void analytics?.track('non_compliant_entity_detected', { address });
    // eslint-disable-next-line lingui/no-unlocalized-strings
    throw new StacksError('NonCompliantAddress');
  }
  return {
    onGoBack() {
      navigation.navigate('send-select-asset', { account });
    },
    async onInitSendTransfer(data: SendFormStxContext, values: SendFormStxSchema) {
      try {
        const parsedValues = parseSendFormValues(values);
        const { amount, recipient } = parsedValues;
        // TODO LEA-1852 - move to form schema validation
        // 1. validate precision
        if (!isValidPrecision(+values.amount, STX_DECIMALS)) {
          // eslint-disable-next-line lingui/no-unlocalized-strings
          throw new StacksError('InvalidPrecision');
        }
        // 2. validate transaction
        isValidStacksTransaction({ amount, payer, recipient, chainId });
        // 3. validate address compliance

        try {
          const isCompliant = await isAddressCompliant({
            address: recipient,
            chain: chainId,
          });

          if (!isCompliant) {
            handleNonCompliantAddress(recipient);
          }
        } catch {
          handleNonCompliantAddress(recipient);
        }
        const tx = await generateTx(parsedValues);

        // eslint-disable-next-line lingui/no-unlocalized-strings
        if (!tx) throw new StacksError('InvalidTransaction');
        const txHex = tx.serialize();
        navigation.navigate('sign-stacks-tx', { txHex, accountId: account.id });
      } catch (e) {
        if (e instanceof StacksError) {
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
