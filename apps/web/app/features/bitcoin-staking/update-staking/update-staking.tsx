import { Controller, FormProvider, useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';
import { z } from 'zod';
import { ErrorLabel } from '~/components/error-label';
import { validationMessages } from '~/content/messages';
import { StakingPoolSlug, getStakingPoolFromSlug } from '~/data/bitcoin-staking-data';
import { useStackingClientRequired } from '~/features/stacking/providers/stacking-client-provider';
import {
  POX5_MAX_NUM_CYCLES,
  stakingPaths,
} from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import { useStxAvailableUnlockedBalance } from '~/queries/balance/account-balance.hooks';
import { useLeatherConnect } from '~/store/addresses';
import { useStacksNetwork } from '~/store/stacks-network';
import { leather } from '~/utils/leather-sdk';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';
import { validateAvailableBalance } from '~/utils/validators/stx-amount-validator';

import { Button, Input, LoadingSpinner } from '@leather.io/ui';
import { isDefined, stxToMicroStx } from '@leather.io/utils';

import { PreparePhaseCallout } from '../components/prepare-phase-callout';
import { usePox5CycleClock } from '../hooks/use-pox5-cycle-clock';
import { usePox5Position } from '../hooks/use-pox5-position';
import { createStakeUpdateMutationOptions } from '../transactions/pox5-stake-update';

const updateStakingMessages = {
  chooseExtendCycles: `Choose between 0 and ${POX5_MAX_NUM_CYCLES} cycles`,
  nothingToUpdate: 'Extend your lock, increase your amount, or both',
};

function toInputValue(value: unknown): string | number {
  if (typeof value === 'number' || typeof value === 'string') return value;
  return '';
}

function createUpdateStakingSchema(availableBalance: ReturnType<typeof stxToMicroStx>) {
  return z
    .object({
      cyclesToExtend: z.coerce
        .number({ error: () => updateStakingMessages.chooseExtendCycles })
        .int(updateStakingMessages.chooseExtendCycles)
        .min(0, updateStakingMessages.chooseExtendCycles)
        .max(POX5_MAX_NUM_CYCLES, updateStakingMessages.chooseExtendCycles),
      amountIncrease: z
        .string()
        .optional()
        .refine(value => !value || /^\d+(\.\d+)?$/.test(value), validationMessages.invalidAmount)
        .refine(
          value => !value || validateAvailableBalance(Number(value), availableBalance),
          validationMessages.cannotStackMoreThanBalance
        ),
    })
    .superRefine((data, ctx) => {
      const increase = data.amountIncrease ? Number(data.amountIncrease) : 0;
      if (data.cyclesToExtend === 0 && increase === 0) {
        ctx.addIssue({
          code: 'custom',
          message: updateStakingMessages.nothingToUpdate,
          path: ['cyclesToExtend'],
        });
      }
    });
}

interface UpdateStakingProps {
  poolSlug: StakingPoolSlug;
}

export function UpdateStaking({ poolSlug }: UpdateStakingProps) {
  const { stacksAccount } = useLeatherConnect();

  if (!stacksAccount) return 'You need to connect Leather';

  return <UpdateStakingLayout poolSlug={poolSlug} address={stacksAccount.address} />;
}

interface UpdateStakingLayoutProps {
  poolSlug: StakingPoolSlug;
  address: string;
}

function UpdateStakingLayout({ poolSlug, address }: UpdateStakingLayoutProps) {
  const navigate = useNavigate();
  const { client } = useStackingClientRequired();
  const { networkInstance } = useStacksNetwork();
  const pool = getStakingPoolFromSlug(poolSlug);

  const { isLoading, position } = usePox5Position();
  const { cycleClock } = usePox5CycleClock();
  const availableBalance = useStxAvailableUnlockedBalance(address);

  const formMethods = useForm({
    mode: 'onTouched',
    defaultValues: { cyclesToExtend: 0, amountIncrease: '' },
    resolver: zodResolver(createUpdateStakingSchema(availableBalance.amount)),
  });

  const { mutateAsync: handleStakeUpdateSubmit, isPending } = useMutation(
    createStakeUpdateMutationOptions({
      leather,
      client,
      network: networkInstance,
    })
  );

  if (isLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" h="100%">
        <LoadingSpinner fill="ink.text-subdued" />
      </Flex>
    );
  }

  if (position.status !== 'active') {
    return <Navigate to={stakingPaths.pool(poolSlug)} replace />;
  }

  const isInPreparePhase = cycleClock?.clock.isInPreparePhase ?? false;

  const handleUpdate = formMethods.handleSubmit(values => {
    const increaseMicroStx = values.amountIncrease
      ? BigInt(stxToMicroStx(Number(values.amountIncrease)).toString())
      : 0n;

    return handleStakeUpdateSubmit({
      providerId: pool.providerId,
      newSignerManagerContractId: position.info.signerManagerContractId,
      currentSignerManagerContractId: position.info.signerManagerContractId,
      cyclesToExtend: values.cyclesToExtend,
      amountIncreaseMicroStx: increaseMicroStx,
    }).then(() => navigate(stakingPaths.active(poolSlug)));
  });

  return (
    <FormProvider {...formMethods}>
      <Stack gap="space.05" mb="space.07" maxWidth="500px">
        <styled.h1 textStyle="heading.04">Update stake</styled.h1>
        <styled.p textStyle="caption.01" color="ink.text-subdued">
          You currently have{' '}
          {toHumanReadableMicroStx(new BigNumber(position.info.amountMicroStx.toString()))} locked
          with {pool.name}. Extend the lock, add more STX, or both — changes take effect from the
          next cycle.
        </styled.p>

        {isInPreparePhase && cycleClock && (
          <PreparePhaseCallout
            secondsUntilStakingReopens={cycleClock.clock.secondsUntilStakingReopens}
          />
        )}

        <Box>
          <Controller
            control={formMethods.control}
            name="cyclesToExtend"
            render={({
              field: { onChange, onBlur, value, ref },
              fieldState: { invalid, error },
            }) => (
              <>
                <Input.Root data-shrink={isDefined(value)}>
                  <Input.Label>Cycles to extend</Input.Label>
                  <Input.Field
                    id="cyclesToExtend"
                    inputMode="numeric"
                    value={toInputValue(value)}
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

        <Box>
          <Controller
            control={formMethods.control}
            name="amountIncrease"
            render={({
              field: { onChange, onBlur, value, ref },
              fieldState: { invalid, error },
            }) => (
              <>
                <Input.Root data-shrink={isDefined(value)}>
                  <Input.Label>Additional STX to lock (optional)</Input.Label>
                  <Input.Field
                    id="amountIncrease"
                    value={toInputValue(value)}
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

        <Button
          size="md"
          onClick={handleUpdate}
          disabled={isPending || isInPreparePhase}
          data-testid="confirm-update-stake-button"
        >
          Confirm update
        </Button>
      </Stack>
    </FormProvider>
  );
}
