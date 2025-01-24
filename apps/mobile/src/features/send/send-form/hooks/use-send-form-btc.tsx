import { useCallback } from 'react';

import { useGenerateBtcUnsignedTransactionNativeSegwit } from '@/common/transactions/bitcoin-transactions.hooks';
import { useToastContext } from '@/components/toast/toast-context';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { t } from '@lingui/macro';
import { bytesToHex } from '@noble/hashes/utils';
import BigNumber from 'bignumber.js';

import {
  BitcoinError,
  CoinSelectionRecipient,
  CoinSelectionUtxo,
  getBitcoinFees,
  payerToBip32Derivation,
} from '@leather.io/bitcoin';
import { AverageBitcoinFeeRates } from '@leather.io/models';
import { createMoneyFromDecimal } from '@leather.io/utils';

import { SendFormBtcContext } from '../providers/send-form-btc-provider';
import { SendFormBtcSchema } from '../schemas/send-form-btc.schema';
import {
  CreateCurrentSendRoute,
  createCoinSelectionUtxos,
  formatBitcoinError,
  useSendSheetNavigation,
  useSendSheetRoute,
} from '../send-form.utils';

type CurrentRoute = CreateCurrentSendRoute<'send-form-btc'>;

function parseSendFormValues(values: SendFormBtcSchema) {
  return {
    amount: createMoneyFromDecimal(new BigNumber(values.amount), 'BTC'),
    recipients: [
      {
        address: values.recipient,
        amount: createMoneyFromDecimal(new BigNumber(values.amount), 'BTC'),
      },
    ],
  };
}

interface GetTxFeesArgs {
  feeRates: AverageBitcoinFeeRates;
  recipients: CoinSelectionRecipient[];
  utxos: CoinSelectionUtxo[];
}

export function useSendFormBtc() {
  const route = useSendSheetRoute<CurrentRoute>();
  const navigation = useSendSheetNavigation<CurrentRoute>();
  const { account } = route.params;
  const { displayToast } = useToastContext();

  const bitcoinKeychain = useBitcoinAccounts().accountIndexByPaymentType(
    account.fingerprint,
    account.accountIndex
  );

  const generateTx = useGenerateBtcUnsignedTransactionNativeSegwit(
    route.params.address,
    route.params.publicKey
  );

  const getTxFees = useCallback(
    ({ feeRates, recipients, utxos }: GetTxFeesArgs) =>
      getBitcoinFees({ feeRates, isSendingMax: false, recipients, utxos }),
    []
  );

  return {
    onGoBack() {
      navigation.navigate('send-select-asset', { account: route.params.account });
    },
    // Temporary logs until we can hook up to approver flow

    onInitSendTransfer(data: SendFormBtcContext, values: SendFormBtcSchema) {
      try {
        const parsedSendFormValues = parseSendFormValues(values);
        const coinSelectionUtxos = createCoinSelectionUtxos(data.utxos);

        const nativeSegwitPayer = bitcoinKeychain.nativeSegwit.derivePayer({ addressIndex: 0 });

        const tx = generateTx({
          feeRate: Number(values.feeRate),
          isSendingMax: false,
          values: parsedSendFormValues,
          utxos: coinSelectionUtxos,
          bip32Derivation: [payerToBip32Derivation(nativeSegwitPayer)],
        });

        const fees = getTxFees({
          feeRates: data.feeRates,
          recipients: parsedSendFormValues.recipients,
          utxos: coinSelectionUtxos,
        });

        // Show an error toast here?
        if (!tx) throw new Error('Attempted to generate raw tx, but no tx exists');
        // eslint-disable-next-line no-console
        console.log('fees:', fees);

        const psbtHex = bytesToHex(tx.psbt);

        navigation.navigate('sign-psbt', { psbtHex });
      } catch (e) {
        const message =
          e instanceof BitcoinError
            ? formatBitcoinError(e.message)
            : t({ id: 'something-went-wrong', message: 'Something went wrong' });

        displayToast({ title: message, type: 'error' });
      }
    },
  };
}
