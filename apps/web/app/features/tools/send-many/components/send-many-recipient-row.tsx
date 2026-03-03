import { css } from 'leather-styles/css';
import { Flex, styled } from 'leather-styles/jsx';

import { Button, Input } from '@leather.io/ui';

import { useSendManyForm } from '../send-many-schema';

interface SendManyRecipientRowProps {
  index: number;
  canRemove: boolean;
  onRemove(): void;
}

export function SendManyRecipientRow({ index, canRemove, onRemove }: SendManyRecipientRowProps) {
  const form = useSendManyForm();
  const errors = form.formState.errors.recipients?.[index];

  return (
    <Flex flexDir="column" mb="space.04" p="space.03" border="default" borderRadius="xs">
      <Flex justifyContent="space-between" alignItems="center" mb="space.02">
        <styled.span textStyle="label.03" color="ink.text-subdued">
          Recipient #{index + 1}
        </styled.span>
        {canRemove && (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            Remove
          </Button>
        )}
      </Flex>

      <Input.Root data-shrink={true}>
        <Input.Label>Stacks address</Input.Label>
        <Input.Field
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
          className={css({ textStyle: 'code', letterSpacing: '-0.04em' })}
          placeholder="SP... or SM..."
          data-testid={`recipient-address-${index}`}
          {...form.register(`recipients.${index}.address`)}
        />
      </Input.Root>
      {errors?.address && (
        <styled.p textStyle="caption.01" color="ink.text-error" mt="space.01">
          {errors.address.message}
        </styled.p>
      )}

      <Input.Root mt="space.02" data-shrink={true}>
        <Input.Label>Amount</Input.Label>
        <Input.Field
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          data-testid={`recipient-amount-${index}`}
          {...form.register(`recipients.${index}.amount`)}
        />
      </Input.Root>
      {errors?.amount && (
        <styled.p textStyle="caption.01" color="ink.text-error" mt="space.01">
          {errors.amount.message}
        </styled.p>
      )}

      <Input.Root mt="space.02" data-shrink={true}>
        <Input.Label>Memo (optional)</Input.Label>
        <Input.Field
          type="text"
          maxLength={34}
          placeholder="Optional memo"
          data-testid={`recipient-memo-${index}`}
          {...form.register(`recipients.${index}.memo`)}
        />
      </Input.Root>
      {errors?.memo && (
        <styled.p textStyle="caption.01" color="ink.text-error" mt="space.01">
          {errors.memo.message}
        </styled.p>
      )}
    </Flex>
  );
}
