import { Controller, useFormContext } from 'react-hook-form';

import { Box, Stack, styled } from 'leather-styles/jsx';
import { ErrorLabel } from '~/components/error-label';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';

import { Input } from '@leather.io/ui';
import { isDefined } from '@leather.io/utils';

interface ChooseStakingDurationProps {
  estimatedUnlockDate: Date | null;
}

export function ChooseStakingDuration({ estimatedUnlockDate }: ChooseStakingDurationProps) {
  const { control } = useFormContext();
  const { chooseDuration } = bitcoinStakingContent;

  return (
    <Stack gap="space.03">
      <Box>
        <Controller
          control={control}
          name="cycles"
          render={({ field: { onChange, onBlur, value, ref }, fieldState: { invalid, error } }) => (
            <>
              <Input.Root data-shrink={isDefined(value)}>
                <Input.Label>Cycles before renewal (1–96)</Input.Label>
                <Input.Field
                  id="cycles"
                  inputMode="numeric"
                  value={value ?? ''}
                  onChange={input => onChange(input.target.value)}
                  onBlur={onBlur}
                  ref={ref}
                />
              </Input.Root>
              {invalid && error && <ErrorLabel mt="space.02">{error.message}</ErrorLabel>}
            </>
          )}
        />
      </Box>

      <styled.span textStyle="caption.01" color="ink.text-subdued">
        {chooseDuration.helperLead}{' '}
        <styled.strong fontWeight={500}>{chooseDuration.helperEmphasis}</styled.strong>{' '}
        {chooseDuration.helperTrail}
        {estimatedUnlockDate && <> Renews around {estimatedUnlockDate.toLocaleDateString()}.</>}
      </styled.span>
    </Stack>
  );
}
