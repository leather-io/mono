import { useForm } from 'react-hook-form';

import { useToastContext } from '@/components/toast/toast-context';
import { StxFormSchema, useStxSendFormSchema } from '@/features/send/forms/stx/stx-form-schema';
import { useCalculateStxMaxSpend } from '@/features/send/hooks/use-calculate-stx-max-spend';
import { useSendMax } from '@/features/send/hooks/use-send-max';
import { useSendNavigation } from '@/features/send/navigation';
import {
  calculateDefaultStacksFee,
  stxFormValuesToSerializedTransaction,
} from '@/features/send/utils';
import { Account } from '@/store/accounts/accounts';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { useNetworkPreferenceStacksNetwork } from '@/store/settings/settings.read';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/macro';

import { Money } from '@leather.io/models';

interface UseStxFormProps {
  account: Account;
  availableBalance: Money;
  nonce: number | undefined;
}

const defaultFee = calculateDefaultStacksFee();

export function useStxForm({ account, availableBalance, nonce }: UseStxFormProps) {
  const { displayToast } = useToastContext();
  const { navigate } = useSendNavigation();
  const stacksNetwork = useNetworkPreferenceStacksNetwork();
  const stxSigner = useStacksSigners().fromAccountIndex(
    account.fingerprint,
    account.accountIndex
  )[0];
  const calculateStxMaxSpend = useCalculateStxMaxSpend(availableBalance);
  const schema = useStxSendFormSchema({
    calculateStxMaxSpend,
    payerAddress: stxSigner?.address ?? '',
    chainId: stacksNetwork.chainId,
  });
  const form = useForm<StxFormSchema>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      amount: '0',
      recipient: '',
      memo: '',
      nonce,
      fee: defaultFee.toNumber(),
      isSendingMax: false,
    },
  });
  const maxSpend = calculateStxMaxSpend();
  const { onSetMax } = useSendMax(maxSpend, form);

  const handleSubmit = form.handleSubmit(values => {
    stxFormValuesToSerializedTransaction(values, stxSigner?.publicKey ?? '', stacksNetwork)
      .then(txHex => navigate('approval', { hex: txHex }))
      .catch(() =>
        displayToast({
          title: t({
            id: 'send-form.unexpected-error',
            message: 'Transaction failed due to an unexpected error. Our team has been notified.',
          }),
          type: 'error',
        })
      );
  });

  return {
    form,
    maxSpend,
    onSetMax,
    onSubmit: handleSubmit,
  };
}
