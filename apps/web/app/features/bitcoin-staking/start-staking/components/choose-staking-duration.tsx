import { Controller, useFormContext } from 'react-hook-form';

import { Box, HStack, Stack, styled } from 'leather-styles/jsx';
import { ErrorLabel } from '~/components/error-label';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';
import { STAKING_CYCLE_PRESETS } from '~/pages/bitcoin-staking/bitcoin-staking.constants';

import { Button, Input } from '@leather.io/ui';
import { isDefined } from '@leather.io/utils';

interface ChooseStakingDurationProps {
  estimatedUnlockDate: Date | null;
}

export function ChooseStakingDuration({ estimatedUnlockDate }: ChooseStakingDurationProps) {
  const { setValue, control } = useFormContext();

  return (
    <Stack gap="space.03">
      <HStack gap="space.02">
        {STAKING_CYCLE_PRESETS.map(preset => (
          <Button
            key={preset}
            variant="outline"
            size="sm"
            type="button"
            data-testid={`duration-preset-${preset}`}
            onClick={() => setValue('cycles', preset, { shouldValidate: true })}
          >
            {preset === 1 ? '1 cycle' : `${preset} cycles`}
          </Button>
        ))}
      </HStack>

      <Box>
        <Controller
          control={control}
          name="cycles"
          render={({ field: { onChange, onBlur, value, ref }, fieldState: { invalid, error } }) => (
            <>
              <Input.Root data-shrink={isDefined(value)}>
                <Input.Label>Number of cycles (1–96)</Input.Label>
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
        {bitcoinStakingContent.chooseDuration.helper}
        {estimatedUnlockDate && <> Unlocks around {estimatedUnlockDate.toLocaleDateString()}.</>}
      </styled.span>
    </Stack>
  );
}
