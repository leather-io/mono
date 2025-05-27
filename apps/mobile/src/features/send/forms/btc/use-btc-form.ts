import { useForm } from 'react-hook-form';

import { useToastContext } from '@/components/toast/toast-context';
import {
  type BtcFormSchema,
  useBtcSendFormSchema,
} from '@/features/send/forms/btc/btc-form-schema';
import { useCalculateBtcMaxSpend } from '@/features/send/hooks/use-calculate-btc-max-spend';
import { useSendMax } from '@/features/send/hooks/use-send-max';
import { useSendNavigation } from '@/features/send/navigation';
import { btcFormValuesToPsbtHex } from '@/features/send/utils';
import { Account } from '@/store/accounts/accounts';
import {
  useBitcoinAccounts,
  useBitcoinPayerFromKeyOrigin,
} from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useSettings } from '@/store/settings/settings';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/macro';

import { AverageBitcoinFeeRates, OwnedUtxo } from '@leather.io/models';

interface UseBtcFormProps {
  account: Account;
  feeRates: AverageBitcoinFeeRates;
  utxos: OwnedUtxo[];
}
export function useBtcForm({ account, feeRates, utxos }: UseBtcFormProps) {
  const { accountIndex, fingerprint } = account;
  const { navigate } = useSendNavigation();
  const { displayToast } = useToastContext();
  const { networkPreference } = useSettings();
  const payerFromKeyOrigin = useBitcoinPayerFromKeyOrigin();
  const { nativeSegwit } = useBitcoinAccounts().accountIndexByPaymentType(
    fingerprint,
    accountIndex
  );
  const calculateMaxBtcSpend = useCalculateBtcMaxSpend(feeRates, utxos);
  const schema = useBtcSendFormSchema({
    networkMode: networkPreference.chain.bitcoin.mode,
    calculateBtcMaxSpend: calculateMaxBtcSpend,
  });
  const form = useForm<BtcFormSchema>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      amount: '0',
      recipient: '',
      isSendingMax: false,
      feeRate: feeRates.halfHourFee.toNumber(),
    },
  });

  const maxSpend = calculateMaxBtcSpend({
    recipient: form.watch('recipient'),
    feeRate: form.watch('feeRate'),
  });

  const { onSetMax } = useSendMax(maxSpend.spendableBitcoin, form);
  const handleSubmit = form.handleSubmit(values => {
    if (!nativeSegwit) return;

    btcFormValuesToPsbtHex({
      values,
      utxos,
      networkMode: networkPreference.chain.bitcoin.mode,
      payerLookup: payerFromKeyOrigin,
      changeAddress: nativeSegwit.derivePayer({ change: 0, addressIndex: 0 }).address,
    })
      .then((psbtHex: string) => navigate('approval', { hex: psbtHex, accountIndex, fingerprint }))
      .catch(() =>
        displayToast({
          title: t({
            id: 'send-form.unexpected-error',
            message: 'Transaction failed due to an unexpected error',
          }),
          type: 'error',
        })
      );
  });

  return {
    form,
    schema,
    maxSpend,
    onSetMax,
    onSubmit: handleSubmit,
  };
}
