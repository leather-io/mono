import { useCallback } from 'react';

import { useGenerateBtcUnsignedTransactionNativeSegwit } from '@/common/transactions/bitcoin-transactions.hooks';
import { useToastContext } from '@/components/toast/toast-context';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useSettings } from '@/store/settings/settings';
import { logger } from '@/utils/logger';
import { t } from '@lingui/macro';
import { bytesToHex } from '@noble/hashes/utils';
import BigNumber from 'bignumber.js';

import {
  BitcoinError,
  CoinSelectionRecipient,
  CoinSelectionUtxo,
  getBitcoinFees,
  isValidBitcoinTransaction,
  payerToBip32Derivation,
} from '@leather.io/bitcoin';
import {
  AverageBitcoinFeeRates,
  Money,
  bitcoinNetworkToNetworkMode,
  createBitcoinAddress,
} from '@leather.io/models';
import { createMoneyFromDecimal } from '@leather.io/utils';

import { SendFormBtcContext } from '../providers/send-form-btc-provider';
import { SendFormBtcSchema } from '../schemas/send-form-btc.schema';
import {
  CreateCurrentSendRoute,
  createCoinSelectionUtxos,
  useSendSheetNavigation,
  useSendSheetRoute,
} from '../send-form.utils';
import { formatBitcoinError } from '../validation/btc.validation';

type CurrentRoute = CreateCurrentSendRoute<'send-form-btc'>;

interface ParsedSendFormValues {
  amount: Money;
  recipients: CoinSelectionRecipient[];
}

function parseSendFormValues({
  amount: inputAmount,
  recipient,
}: SendFormBtcSchema): ParsedSendFormValues {
  const amount = createMoneyFromDecimal(new BigNumber(inputAmount), 'BTC');
  return {
    amount,
    recipients: [
      {
        address: createBitcoinAddress(recipient),
        amount,
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
  const {
    params: { account, address, publicKey },
  } = useSendSheetRoute<CurrentRoute>();
  const navigation = useSendSheetNavigation<CurrentRoute>();
  const { displayToast } = useToastContext();
  const {
    networkPreference: {
      chain: {
        bitcoin: { bitcoinNetwork },
      },
    },
  } = useSettings();
  const payer = createBitcoinAddress(address);
  const network = bitcoinNetworkToNetworkMode(bitcoinNetwork);

  const bitcoinKeychain = useBitcoinAccounts().accountIndexByPaymentType(
    account.fingerprint,
    account.accountIndex
  );

  const generateTx = useGenerateBtcUnsignedTransactionNativeSegwit(payer, publicKey);

  const getTxFees = useCallback(
    ({ feeRates, recipients, utxos }: GetTxFeesArgs) =>
      getBitcoinFees({ feeRates, isSendingMax: false, recipients, utxos }),
    []
  );

  return {
    onGoBack() {
      navigation.navigate('send-select-asset', { account });
    },

    onInitSendTransfer({ utxos, feeRates }: SendFormBtcContext, values: SendFormBtcSchema) {
      try {
        const { amount, recipient: recipientAddress, feeRate } = values;
        const recipient = createBitcoinAddress(recipientAddress);
        const parsedSendFormValues = parseSendFormValues(values);

        // Transform Utxo to CoinSelectionUtxo
        const coinSelectionUtxos = createCoinSelectionUtxos(utxos);

        const nativeSegwitPayer = bitcoinKeychain.nativeSegwit.derivePayer({ addressIndex: 0 });

        const tx = generateTx({
          feeRate: Number(feeRate),
          isSendingMax: false,
          values: parsedSendFormValues,
          utxos: coinSelectionUtxos,
          bip32Derivation: [payerToBip32Derivation(nativeSegwitPayer)],
        });

        // TODO - integrate fees with validation
        const fees = getTxFees({
          feeRates,
          recipients: parsedSendFormValues.recipients,
          utxos: coinSelectionUtxos,
        });

        const bitcoinTransaction = {
          amount: +amount,
          payer: payer,
          recipient: recipient,
          network,
          utxos: coinSelectionUtxos,
          feeRate: +feeRate,
          feeRates,
        };

        isValidBitcoinTransaction(bitcoinTransaction);
        // no toast here as caught in catch block with generic error handling
        // matches extension behavior for now
        if (!tx) {
          // logger('tx:', 'Attempted to generate raw tx, but no tx exists');
          throw new Error();
        }
        logger('', fees);

        const psbtHex = bytesToHex(tx.psbt);

        navigation.navigate('sign-psbt', { psbtHex });
      } catch (e) {
        if (e instanceof BitcoinError) {
          displayToast({ title: formatBitcoinError(e.message), type: 'error' });
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
