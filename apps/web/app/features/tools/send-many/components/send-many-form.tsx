import { useFieldArray } from 'react-hook-form';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { Select } from '~/components/form-select';
import { FormSection } from '~/components/forms/form-section';
import { analytics } from '~/utils/analytics/analytics';

import { Button, SbtcAvatarIcon, StxAvatarIcon, UsdcxAvatarIcon } from '@leather.io/ui';

import { MAX_RECIPIENTS, type SendManyToken } from '../send-many-constants';
import { useSendManyForm } from '../send-many-schema';
import { SendManyRecipientRow } from './send-many-recipient-row';

function TokenIcon({ token }: { token: SendManyToken }) {
  switch (token) {
    case 'sbtc':
      return <SbtcAvatarIcon size="sm" />;
    case 'usdc':
      return <UsdcxAvatarIcon size="sm" />;
    default:
      return <StxAvatarIcon size="sm" />;
  }
}

export function SendManyForm() {
  const form = useSendManyForm();
  const selectedToken = form.watch('token');
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'recipients',
  });

  function handleTokenChange(token: SendManyToken) {
    analytics.untypedTrack('send_many_token_changed', { token });
  }

  function handleAddRecipient() {
    if (fields.length < MAX_RECIPIENTS) {
      append({ address: '', amount: '', memo: '' });
      analytics.untypedTrack('send_many_recipient_added', { recipientCount: fields.length + 1 });
    }
  }

  function handleRemoveRecipient(index: number) {
    if (fields.length > 1) {
      remove(index);
      analytics.untypedTrack('send_many_recipient_removed', { recipientCount: fields.length - 1 });
    }
  }

  return (
    <Flex flexDir="column" width={[null, null, null, null, '500px']}>
      <styled.p textStyle="label.01">
        Send STX, sBTC, or USDC to multiple recipients in a single transaction using the send-many
        contract. Supports up to 200 recipients per transaction.
      </styled.p>

      <FormSection mt="space.07" title="Token">
        <Box pos="relative">
          <Select
            id="token"
            label="Select token to send"
            {...form.register('token', {
              onChange: e => handleTokenChange(e.target.value as SendManyToken),
            })}
          >
            <option value="stx">STX</option>
            <option value="sbtc">sBTC</option>
            <option value="usdc">USDC</option>
          </Select>
          <Box
            pos="absolute"
            right="space.04"
            top="50%"
            transform="translateY(-50%)"
            pointerEvents="none"
          >
            <TokenIcon token={selectedToken} />
          </Box>
        </Box>
      </FormSection>

      <FormSection title="Recipients">
        {fields.map((field, index) => (
          <SendManyRecipientRow
            key={field.id}
            index={index}
            canRemove={fields.length > 1}
            onRemove={() => handleRemoveRecipient(index)}
          />
        ))}

        <Flex mt="space.03" gap="space.03">
          <Button
            type="button"
            variant="outline"
            onClick={handleAddRecipient}
            disabled={fields.length >= MAX_RECIPIENTS}
          >
            Add recipient
          </Button>
        </Flex>

        <styled.p textStyle="caption.01" color="ink.text-subdued" mt="space.02">
          {fields.length} of {MAX_RECIPIENTS} recipients
        </styled.p>
      </FormSection>
    </Flex>
  );
}
