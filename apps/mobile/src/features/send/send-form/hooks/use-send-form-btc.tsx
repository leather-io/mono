import { useGenerateBtcUnsignedTransactionNativeSegwit } from '@/common/transactions/bitcoin-transactions.hooks';
import { useToastContext } from '@/components/toast/toast-context';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useSettings } from '@/store/settings/settings';
import { analytics } from '@/utils/analytics';
import { t } from '@lingui/macro';
import { bytesToHex } from '@noble/hashes/utils';
import BigNumber from 'bignumber.js';

import {
  BitcoinError,
  CoinSelectionRecipient,
  createBitcoinAddress,
  isValidBitcoinTransaction,
  payerToBip32Derivation,
} from '@leather.io/bitcoin';
import { BTC_DECIMALS } from '@leather.io/constants';
import { BitcoinAddress, Money, bitcoinNetworkToNetworkMode } from '@leather.io/models';
import { isAddressCompliant } from '@leather.io/query';
import { createMoneyFromDecimal, isValidPrecision } from '@leather.io/utils';

import {
  CreateCurrentSendRoute,
  createCoinSelectionUtxos,
  useSendSheetNavigation,
  useSendSheetRoute,
} from '../../send-form.utils';
import { SendFormBtcContext } from '../providers/send-form-btc-provider';
import { SendFormBtcSchema } from '../schemas/send-form-btc.schema';
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

  function handleNonCompliantAddress(address: BitcoinAddress) {
    void analytics?.track('non_compliant_entity_detected', { address });
    throw new BitcoinError('NonCompliantAddress');
  }

  return {
    onGoBack() {
      navigation.navigate('send-select-asset', { account });
    },

    async onInitSendTransfer({ utxos, feeRates }: SendFormBtcContext, values: SendFormBtcSchema) {
      try {
        const { amount: inputAmount, recipient: recipientAddress, feeRate } = values;
        const recipient = createBitcoinAddress(recipientAddress);
        // TODO LEA-1852 - move to form schema validation
        // 1. validate precision
        if (!isValidPrecision(+inputAmount, BTC_DECIMALS)) {
          throw new BitcoinError('InvalidPrecision');
        }
        const parsedSendFormValues = parseSendFormValues(values);
        const coinSelectionUtxos = createCoinSelectionUtxos(utxos);

        // 2. validate transaction
        isValidBitcoinTransaction({
          amount: parsedSendFormValues.amount,
          payer: payer,
          recipient: recipient,
          network,
          utxos: coinSelectionUtxos,
          feeRate: +feeRate,
          feeRates,
        });
        // 3. validate address compliance
        try {
          const isCompliant = await isAddressCompliant({
            address: recipient,
            chain: network,
          });

          if (!isCompliant) {
            handleNonCompliantAddress(recipient);
          }
        } catch {
          handleNonCompliantAddress(recipient);
        }
        // 4. generate tx
        const nativeSegwitPayer = bitcoinKeychain.nativeSegwit.derivePayer({ addressIndex: 0 });
        const tx = generateTx({
          feeRate: Number(feeRate),
          isSendingMax: false,
          values: parsedSendFormValues,
          utxos: coinSelectionUtxos,
          bip32Derivation: [payerToBip32Derivation(nativeSegwitPayer)],
        });

        if (!tx) throw new BitcoinError('InvalidTransaction');

        const psbtHex = bytesToHex(tx.psbt);

        navigation.navigate('sign-psbt', { psbtHex });
      } catch (e) {
        if (e instanceof BitcoinError) {
          displayToast({ title: formatBitcoinError(e.message), type: 'error' });
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
