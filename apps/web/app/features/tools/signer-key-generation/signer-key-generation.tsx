import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Pox4SignatureTopic, V2PoxInfoResponse } from '@stacks/stacking';
import { FormPageLayout } from '~/components/forms/form-page.layout';
import { analytics } from '~/utils/analytics/analytics';

import { useOnMount } from '@leather.io/ui';

import { SignerKeyGenerationForm } from './components/signer-key-generation-form';
import { SignerKeyGenerationPreviewCard } from './components/signer-key-generation-preview-card';
import { requestStackingSignature } from './request-signer-key-signature';
import {
  SignerKeySignatureForm,
  signerKeyDefaults,
  signerKeySignatureFormSchema,
} from './signer-key-generation-schema';

interface SignerKeyGenerationProps {
  poxInfo: V2PoxInfoResponse;
}
export function SignerKeyGeneration({ poxInfo }: SignerKeyGenerationProps) {
  const form = useForm({
    mode: 'onChange',
    defaultValues: { ...signerKeyDefaults, rewardCycle: poxInfo.reward_cycle_id },
    resolver: zodResolver(signerKeySignatureFormSchema),
  });

  useOnMount(() => {
    form.setValue('authId', Math.floor(Math.random() * 1000000).toString());
  });

  async function triggerSignerKeyRequest(values: SignerKeySignatureForm) {
    const resp = await requestStackingSignature({
      network: 'mainnet',
      rewardCycle: values.rewardCycle,
      poxAddress: values.bitcoinRewardAddress,
      period: poxInfo.reward_cycle_id + 1,
      topic: values.topic as Pox4SignatureTopic,
      maxAmount: values.maxAmount,
      authId: values.authId,
    });
    analytics.untypedTrack('form_submit_signer_key_generation_success');

    // eslint-disable-next-line no-console
    console.log('Signature Data:', resp);
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(triggerSignerKeyRequest)}>
        <FormPageLayout
          my="space.09"
          form={<SignerKeyGenerationForm poxInfo={poxInfo} />}
          preview={<SignerKeyGenerationPreviewCard />}
        />
      </form>
    </FormProvider>
  );
}
