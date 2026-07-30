import { Controller, useFormContext } from 'react-hook-form';

import { Box, HStack, Stack, styled } from 'leather-styles/jsx';
import { ErrorLabel } from '~/components/error-label';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';

import { Input } from '@leather.io/ui';

export function ChoosePayoutPreference() {
  const { control, watch } = useFormContext();
  const payoutEnabled = watch('payoutEnabled');

  return (
    <Stack gap="space.03">
      <Controller
        control={control}
        name="payoutEnabled"
        render={({ field: { onChange, value } }) => (
          <HStack gap="space.02" alignItems="center">
            <styled.input
              type="checkbox"
              id="payoutEnabled"
              data-testid="payout-preference-toggle"
              checked={Boolean(value)}
              onChange={input => onChange(input.target.checked)}
            />
            <styled.label htmlFor="payoutEnabled" textStyle="label.03" cursor="pointer">
              {bitcoinStakingContent.payoutPreference.toggleLabel}
            </styled.label>
          </HStack>
        )}
      />

      {!payoutEnabled && (
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          {bitcoinStakingContent.payoutPreference.collapsedHelper}
        </styled.span>
      )}

      {payoutEnabled && (
        <Stack gap="space.03">
          <Box>
            <Controller
              control={control}
              name="rewardAddress"
              render={({
                field: { onChange, onBlur, value, ref },
                fieldState: { invalid, error },
              }) => (
                <>
                  <Input.Root>
                    <Input.Label>BTC address</Input.Label>
                    <Input.Field
                      autoComplete="off"
                      data-1p-ignore
                      id="rewardAddress"
                      value={value ?? ''}
                      onChange={input => onChange(input.target.value)}
                      onBlur={onBlur}
                      ref={ref}
                    />
                  </Input.Root>
                  {invalid && error && <ErrorLabel>{error.message}</ErrorLabel>}
                </>
              )}
            />
          </Box>
          <Box>
            <Controller
              control={control}
              name="maxFeeSats"
              render={({
                field: { onChange, onBlur, value, ref },
                fieldState: { invalid, error },
              }) => (
                <>
                  <Input.Root>
                    <Input.Label>Max withdrawal fee (sats)</Input.Label>
                    <Input.Field
                      id="maxFeeSats"
                      inputMode="numeric"
                      value={value ?? ''}
                      onChange={input => onChange(input.target.value)}
                      onBlur={onBlur}
                      ref={ref}
                    />
                  </Input.Root>
                  {invalid && error && <ErrorLabel>{error.message}</ErrorLabel>}
                </>
              )}
            />
          </Box>
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {bitcoinStakingContent.payoutPreference.expandedHelper}
          </styled.span>
        </Stack>
      )}
    </Stack>
  );
}
