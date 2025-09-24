import { useForm } from 'react-hook-form';

import { useToastContext } from '@/components/toast/toast-context';
import { getTransferSip10TxHex } from '@/features/approver/utils';
import { useSendMax } from '@/features/send/hooks/use-send-max';
import { useSendNavigation } from '@/features/send/navigation';
import { calculateDefaultStacksFee } from '@/features/send/utils';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { assertStacksSigner } from '@/store/keychains/stacks/utils';
import { useNetworkPreferenceStacksNetwork } from '@/store/settings/settings.read';
import { analytics } from '@/utils/analytics';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';

import { AccountId, Money, Sip10Asset } from '@leather.io/models';
import { convertAmountToBaseUnit, unitToFractionalUnit } from '@leather.io/utils';

import { StxFormSchema, useStxSendFormSchema } from './stx-form-schema';

interface UseSip10FormProps {
  account: AccountId;
  asset: Sip10Asset;
  availableBalance: Money;
  nonce: number | undefined;
}

const defaultFee = calculateDefaultStacksFee();

export function useSip10Form({ account, availableBalance, nonce, asset }: UseSip10FormProps) {
  const { displayToast } = useToastContext();
  const { navigate } = useSendNavigation();
  const stacksNetwork = useNetworkPreferenceStacksNetwork();
  const stxSigner = useStacksSigners().fromAccountIndex(
    account.fingerprint,
    account.accountIndex
  )[0];
  assertStacksSigner(stxSigner);

  function calculateStxMaxSpend() {
    return convertAmountToBaseUnit(availableBalance.amount, asset.decimals);
  }
  const schema = useStxSendFormSchema({
    calculateStxMaxSpend,
    payerAddress: stxSigner.address,
    chainId: stacksNetwork.chainId,
    assetDecimals: asset.decimals,
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
    assertStacksSigner(stxSigner);
    analytics.track('send_transaction_review_initiated', {
      asset: asset.symbol,
      amount: Number(values.amount),
    });

    getTransferSip10TxHex({
      signer: stxSigner,
      assetId: asset.assetId,
      recipient: values.recipient,
      amount: unitToFractionalUnit(asset.decimals)(values.amount).toNumber(),
      nonce: nonce ?? 1,
      memo: values.memo,
      network: stacksNetwork,
    })
      .then(txHex => {
        navigate('approval', {
          hex: txHex,
          fingerprint: account.fingerprint,
          accountIndex: account.accountIndex,
        });
      })
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
