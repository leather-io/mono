import { Pox4SignatureTopic, V2PoxInfoResponse } from '@stacks/stacking';
import { css } from 'leather-styles/css';
import { Flex, styled } from 'leather-styles/jsx';
import { Select } from '~/components/form-select';
import { FormSection } from '~/components/forms/form-section';

import { Input } from '@leather.io/ui';
import { createNullArrayOfLength } from '@leather.io/utils';

import { useSignerKeyGenerationForm } from '../signer-key-generation-schema';

interface SignerKeyGenerationFormProps {
  poxInfo: V2PoxInfoResponse;
}
export function SignerKeyGenerationForm({ poxInfo }: SignerKeyGenerationFormProps) {
  const form = useSignerKeyGenerationForm();
  return (
    <Flex flexDir="column" width={[null, null, null, '500px']}>
      <styled.p textStyle="label.01">
        When making certain Stacking transactions, it's required that you provide a signature and
        other information to ensure that the signer you're using is authorizing the transaction.
      </styled.p>

      <FormSection mt="space.07" title="Choose reward cycle">
        <Input.Root>
          <Input.Label>Cycle</Input.Label>
          <Input.Field type="number" {...form.register('rewardCycle')} />
        </Input.Root>
        <styled.p textStyle="caption.01" color="ink.text-subdued" mt="space.02">
          Next cycle is {poxInfo.reward_cycle_id + 1}
        </styled.p>
      </FormSection>

      <FormSection title="Bitcoin address">
        <Input.Root>
          <Input.Label>Bitcoin address – Legacy, Native Segwit or Taproot</Input.Label>
          <Input.Field
            autoComplete="off"
            className={css({ textStyle: 'code', letterSpacing: '-0.04em' })}
            {...form.register('bitcoinRewardAddress')}
          />
        </Input.Root>
        {form.formState.errors.bitcoinRewardAddress && (
          <styled.p
            textStyle="caption.01"
            color="ink.text-error"
            mt="space.02"
            data-testid="error-poxAddress"
          >
            {form.formState.errors.bitcoinRewardAddress &&
              form.formState.errors.bitcoinRewardAddress.message}
          </styled.p>
        )}
      </FormSection>

      <FormSection title="Topic">
        {/* https://github.com/radix-ui/primitives/issues/2817 */}
        <Select
          id="topic"
          label="Select the topic (stacking method) for this signature"
          {...form.register('topic')}
        >
          {Object.values(Pox4SignatureTopic).map(key => (
            <option value={key} key={key}>
              {key}
            </option>
          ))}
        </Select>
      </FormSection>

      <FormSection
        title="Max amount"
        description="Enter the maximum amount of STX that can be locked while using this signature"
      >
        <Input.Root>
          <Input.Label>Max amount</Input.Label>
          <Input.Field id="maxAmount" type="number" {...form.register('maxAmount')} />
        </Input.Root>
      </FormSection>

      <FormSection
        title="Auth ID"
        description="This number has been randomly generated to prevent re-use of signature"
      >
        <Input.Root>
          <Input.Label>Authorisation ID</Input.Label>
          <Input.Field id="authId" type="number" {...form.register('authId')} />
        </Input.Root>
      </FormSection>

      <FormSection title="Duration" description="Number of cycle to lock STX for this stacker">
        <Select
          id="duration"
          label="Select the duration (number of cycles) for this signature"
          {...form.register('duration')}
        >
          {createNullArrayOfLength(12)
            .map((_, i) => i + 1)
            .map(num => (
              <option value={num} key={num}>
                {num}
              </option>
            ))}
        </Select>
      </FormSection>
    </Flex>
  );
}
