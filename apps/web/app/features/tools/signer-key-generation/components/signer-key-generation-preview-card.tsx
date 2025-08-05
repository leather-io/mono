import { InfoCard } from '~/components/info-card';

import { AddressDisplayer, Button } from '@leather.io/ui';

import { useSignerKeyGenerationForm } from '../signer-key-generation-schema';

export function SignerKeyGenerationPreviewCard() {
  const form = useSignerKeyGenerationForm();
  const watchedValues = form.watch();

  return (
    <InfoCard w="360px" title="Summary">
      <InfoCard.Section>
        <InfoCard.Row>
          <InfoCard.Label>Reward cycle</InfoCard.Label>
          <InfoCard.Value>{String(watchedValues.rewardCycle)}</InfoCard.Value>
        </InfoCard.Row>
        <InfoCard.Row>
          <InfoCard.Label>Topic</InfoCard.Label>
          <InfoCard.Value>{watchedValues.topic}</InfoCard.Value>
        </InfoCard.Row>
        <InfoCard.Row>
          <InfoCard.Label>Auth ID</InfoCard.Label>
          <InfoCard.Value>{watchedValues.authId}</InfoCard.Value>
        </InfoCard.Row>
        <InfoCard.Row>
          <InfoCard.Label>Duration</InfoCard.Label>
          <InfoCard.Value>{String(watchedValues.duration)}</InfoCard.Value>
        </InfoCard.Row>
        <InfoCard.Row flexDir="column">
          <InfoCard.Label>Bitcoin address</InfoCard.Label>
          <InfoCard.Value>
            {watchedValues.bitcoinRewardAddress && !form.formState.errors.bitcoinRewardAddress ? (
              <AddressDisplayer mt="space.02" address={watchedValues.bitcoinRewardAddress} />
            ) : (
              '—'
            )}
          </InfoCard.Value>
        </InfoCard.Row>
      </InfoCard.Section>
      <Button type="submit" mt="space.05">
        Generate signature
      </Button>
    </InfoCard>
  );
}
