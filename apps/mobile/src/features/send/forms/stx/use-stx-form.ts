import { useForm } from 'react-hook-form';

import { useToastContext } from '@/components/toast/toast-context';
import { StxFormSchema, useStxSendFormSchema } from '@/features/send/forms/stx/stx-form-schema';
import { useCalculateStxMaxSpend } from '@/features/send/hooks/use-calculate-stx-max-spend';
import { useSendMax } from '@/features/send/hooks/use-send-max';
import { useSendNavigation } from '@/features/send/navigation';
import { stxFormValuesToSerializedTransaction } from '@/features/send/utils';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { assertStacksSigner } from '@/store/keychains/stacks/utils';
import { useNetworkPreferenceStacksNetwork } from '@/store/settings/settings';
import { analytics } from '@/utils/analytics';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';

import { AccountId, Money, type StacksTransactionFees } from '@leather.io/models';
import { convertAmountToBaseUnit } from '@leather.io/utils';

interface UseStxFormProps {
  account: AccountId;
  availableBalance: Money;
  nonce: number | undefined;
  fees: StacksTransactionFees;
}

export function useStxForm({ account, availableBalance, nonce, fees }: UseStxFormProps) {
  const { displayToast } = useToastContext();
  const { navigate } = useSendNavigation();
  const stacksNetwork = useNetworkPreferenceStacksNetwork();
  const stxSigner = useStacksSigners().fromAccountIndex(
    account.fingerprint,
    account.accountIndex
  )[0];
  assertStacksSigner(stxSigner);
  const standardFee = fees.options.standard.value;
  const calculateStxMaxSpend = useCalculateStxMaxSpend(availableBalance, standardFee);
  const schema = useStxSendFormSchema({
    calculateStxMaxSpend,
    payerAddress: stxSigner.address,
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
      fee: convertAmountToBaseUnit(standardFee).toNumber(),
      isSendingMax: false,
    },
  });
  const maxSpend = calculateStxMaxSpend();
  const { onSetMax } = useSendMax(maxSpend, form);

  const handleSubmit = form.handleSubmit(values => {
    assertStacksSigner(stxSigner);
    analytics.track('send_transaction_review_initiated', {
      asset: 'STX',
      amount: Number(values.amount),
    });

    stxFormValuesToSerializedTransaction(values, stxSigner.publicKey, stacksNetwork)
      .then(txHex =>
        navigate('approver', {
          hex: txHex,
          fingerprint: account.fingerprint,
          accountIndex: account.accountIndex,
        })
      )
      .catch(() =>
        displayToast({
          title: t`Transaction failed due to an unexpected error`,
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
