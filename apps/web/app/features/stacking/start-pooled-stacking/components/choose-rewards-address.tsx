import { Controller, useFormContext } from 'react-hook-form';

import { Box } from 'leather-styles/jsx';
import { ErrorLabel } from '~/components/error-label';
import { StackingPoolFormSchema } from '~/features/stacking/start-pooled-stacking/utils/stacking-pool-form-schema';

import { Input } from '@leather.io/ui';

export function ChooseRewardsAddress() {
  const { control } = useFormContext<StackingPoolFormSchema>();

  return (
    <Box>
      <Controller
        control={control}
        name="rewardAddress"
        render={({ field: { onChange, onBlur, value, ref }, fieldState: { invalid, error } }) => (
          <>
            <Input.Root>
              <Input.Label>Address</Input.Label>
              <Input.Field
                autoComplete="off"
                data-1p-ignore
                id="rewardAddress"
                value={value ?? ''}
                onChange={input => {
                  onChange(input.target.value);
                }}
                onBlur={onBlur}
                ref={ref}
              />
            </Input.Root>
            {invalid && error && <ErrorLabel>{error.message}</ErrorLabel>}
          </>
        )}
      />
    </Box>
  );
}
