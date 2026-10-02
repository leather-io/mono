import { Controller, useFormContext } from 'react-hook-form';

import BigNumber from 'bignumber.js';
import { Box, Stack, styled } from 'leather-styles/jsx';
import { ErrorLabel } from '~/components/error-label';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';

import { Input } from '@leather.io/ui';
import { isDefined } from '@leather.io/utils';

import { AvailableBalanceRow } from '../../components/available-balance-row';
import { StakingConnectAction } from '../../hooks/use-staking-connect-action';
import { PoolMinStake, formatMinStakeStx } from '../utils/staking-form-schema';

interface ChooseStakingAmountProps {
  isLoading: boolean;
  availableAmount: BigNumber | undefined;
  minStake?: PoolMinStake;
  connectAction?: StakingConnectAction;
}

export function ChooseStakingAmount({
  isLoading,
  availableAmount,
  minStake,
  connectAction,
}: ChooseStakingAmountProps) {
  const { setValue, control } = useFormContext();

  return (
    <Stack>
      <Box>
        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, onBlur, value, ref }, fieldState: { invalid, error } }) => (
            <>
              <Input.Root data-shrink={isDefined(value)}>
                <Input.Label>Amount of STX to stake</Input.Label>
                <Input.Field
                  id="amount"
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

      <AvailableBalanceRow
        isLoading={isLoading}
        availableAmount={availableAmount}
        onSelectMax={amount => setValue('amount', amount)}
        connectAction={connectAction}
      />

      {minStake && (
        <styled.span textStyle="caption.01" color="ink.text-subdued" data-testid="pool-min-stake">
          {bitcoinStakingContent.operatorPayout.minStakeNote(
            minStake.poolName,
            formatMinStakeStx(minStake)
          )}
        </styled.span>
      )}
    </Stack>
  );
}
