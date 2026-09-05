import { useState } from 'react';
import { Controller, useFormContext, useFormState } from 'react-hook-form';

import { css } from 'leather-styles/css';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';
import { ErrorLabel } from '~/components/error-label';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';
import { ExitAnyTimeIcon } from '~/features/bitcoin-staking/start-staking/components/exit-any-time-icon';

import { Input } from '@leather.io/ui';
import { isDefined } from '@leather.io/utils';

interface ChooseStakingDurationProps {
  estimatedUnlockDate: Date | null;
}

function formatRenewalDate(date: Date | null) {
  if (!date) return null;
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function ChooseStakingDuration({ estimatedUnlockDate }: ChooseStakingDurationProps) {
  const { control } = useFormContext();
  const { errors } = useFormState({ control, name: 'cycles' });
  const [exitIconPlayCount, setExitIconPlayCount] = useState(0);
  const { chooseDuration } = bitcoinStakingContent;
  const renewalDate = formatRenewalDate(estimatedUnlockDate);
  const hasError = Boolean(errors.cycles);

  return (
    <Stack gap="0">
      <Box>
        <Controller
          control={control}
          name="cycles"
          render={({ field: { onChange, onBlur, value, ref }, fieldState: { invalid, error } }) => (
            <>
              <Input.Root
                data-shrink={isDefined(value)}
                className={css({
                  position: 'relative',
                  zIndex: 4,
                  bg: 'ink.background-primary',
                  borderRadius: 'sm',
                  _before: { inset: '0' },
                })}
              >
                <Input.Label>{chooseDuration.inputLabel}</Input.Label>
                <Input.Field
                  id="cycles"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  value={value ?? ''}
                  onChange={input => onChange(input.target.value.replace(/\D/g, ''))}
                  onFocus={() => setExitIconPlayCount(count => count + 1)}
                  onBlur={onBlur}
                  ref={ref}
                />
                {renewalDate && (
                  <styled.span
                    pos="absolute"
                    top="38%"
                    right="space.04"
                    transform="translateY(-12px)"
                    zIndex={9}
                    pointerEvents="none"
                    textStyle="label.03"
                    color="ink.text-subdued"
                  >
                    {chooseDuration.renewalPrefix}
                    {renewalDate}
                  </styled.span>
                )}
              </Input.Root>
              {invalid && error && <ErrorLabel mt="space.02">{error.message}</ErrorLabel>}
            </>
          )}
        />
      </Box>

      <Flex
        gap="space.03"
        pt={hasError ? 'space.03' : 'space.04'}
        pb="space.03"
        px="space.04"
        mt={hasError ? 'space.02' : '-space.01'}
        borderTopRadius={hasError ? 'sm' : '0'}
        borderBottomRadius="sm"
        bg="ink.component-background-default"
        alignItems="flex-start"
      >
        <Box flexShrink={0}>
          <ExitAnyTimeIcon playCount={exitIconPlayCount} />
        </Box>
        <Stack gap="0">
          <styled.span textStyle="caption.01" fontWeight={500}>
            {chooseDuration.exitTitle}
          </styled.span>
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {chooseDuration.exitDescription}
          </styled.span>
        </Stack>
      </Flex>
    </Stack>
  );
}
