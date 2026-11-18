import { useForm, useWatch } from 'react-hook-form';

import { useToastContext } from '@/components/toast/toast-context';
import { useSendMax } from '@/features/send/hooks/use-send-max';
import { useSendNavigation } from '@/features/send/navigation';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { assertStacksSigner } from '@/store/keychains/stacks/utils';
import { useNetworkPreferenceStacksNetwork } from '@/store/settings/settings';
import { analytics } from '@/utils/analytics';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';

import {
  type AccountId,
  type Money,
  type Sip10Asset,
  type StacksTransactionFees,
} from '@leather.io/models';
import { createTransferSip10TxHex } from '@leather.io/stacks';
import {
  convertAmountToBaseUnit,
  createMoneyFromDecimal,
  unitToFractionalUnit,
} from '@leather.io/utils';

import { type StxFormSchema, useStxSendFormSchema } from './stx-form-schema';

interface UseSip10FormProps {
  account: AccountId;
  asset: Sip10Asset;
  availableBalance: Money;
  nonce: number | undefined;
  fees: StacksTransactionFees;
}

export function useSip10Form({ account, availableBalance, nonce, asset, fees }: UseSip10FormProps) {
  const { displayToast } = useToastContext();
  const { navigate } = useSendNavigation();
  const stacksNetwork = useNetworkPreferenceStacksNetwork();
  const stxSigner = useStacksSigners().fromAccountIndex(
    account.fingerprint,
    account.accountIndex
  )[0];
  assertStacksSigner(stxSigner);
  const standardFee = fees.options.standard.value;

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
      fee: convertAmountToBaseUnit(standardFee).toNumber(),
      isSendingMax: false,
    },
  });
  const isSendingMax = useWatch({ control: form.control, name: 'isSendingMax' });
  const recipient = useWatch({ control: form.control, name: 'recipient' });
  const maxSpend = calculateStxMaxSpend();
  const { onSetMax } = useSendMax(maxSpend, {
    isSendingMax,
    recipient,
    setValue: form.setValue,
  });

  async function reviewTransaction(txHexPromise: Promise<string>) {
    try {
      const txHex = await txHexPromise;
      navigate('approver', {
        hex: txHex,
        fingerprint: account.fingerprint,
        accountIndex: account.accountIndex,
      });
    } catch {
      displayToast({
        title: t`Transaction failed due to an unexpected error`,
        type: 'error',
      });
    }
  }

  const handleSubmit = form.handleSubmit(values => {
    assertStacksSigner(stxSigner);
    analytics.track('send_transaction_review_initiated', {
      asset: asset.symbol,
      amount: Number(values.amount),
    });

    void reviewTransaction(
      createTransferSip10TxHex({
        signer: stxSigner,
        assetId: asset.assetId,
        recipient: values.recipient,
        amount: unitToFractionalUnit(asset.decimals)(values.amount).toNumber(),
        nonce: nonce ?? 1,
        memo: values.memo,
        fee: createMoneyFromDecimal(values.fee, 'STX'),
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
