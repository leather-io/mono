import { useMemo, useState } from 'react';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router';

import { zodResolver } from '@hookform/resolvers/zod';
import { StackingClient } from '@stacks/stacking';
import { useMutation } from '@tanstack/react-query';
import { Flex, Stack, styled } from 'leather-styles/jsx';
import { LiquidStackingConfirmationStepId } from '~/components/confirmations/confirmation-steps';
import { FormPageLayout } from '~/components/forms/form-page.layout';
import { STACKING_CONTRACT_CALL_TX_BYTES } from '~/constants/constants';
import { ChooseStackingAmount } from '~/features/stacking/components/choose-stacking-amount';
import { StackingContractDetails } from '~/features/stacking/components/stacking-contract-details';
import { StackingFormStepsPanel } from '~/features/stacking/components/stacking-form-steps-panel';
import { StartStackingDrawer } from '~/features/stacking/components/start-stacking-drawer';
import { useGetHasPendingStackingTransactionQuery } from '~/features/stacking/direct-stacking-info/use-get-has-pending-tx-query';
import {
  useGetAccountExtendedBalancesQuery,
  useGetPoxInfoQuery,
  useGetStatusQuery,
} from '~/features/stacking/hooks/stacking.query';
import {
  IncreaseLiquidFormSchema,
  createIncreaseLiquidMutationOptions,
  getAvailableAmountUstx,
} from '~/features/stacking/increase-liquid-stacking/utils/utils-increase-liquid-stacking';
import { useStackingClient } from '~/features/stacking/providers/stacking-client-provider';
import { ChooseLiquidStackingConditions } from '~/features/stacking/start-liquid-stacking/components/choose-liquid-stacking-conditions';
import { LiquidStackingConfirmationSteps } from '~/features/stacking/start-liquid-stacking/components/liquid-stacking-confirmation-steps';
import { ProtocolSlug } from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';
import { useLeatherConnect } from '~/store/addresses';
import { useStacksNetwork } from '~/store/stacks-network';
import { leather } from '~/utils/leather-sdk';
import { microStxToStxRounded } from '~/utils/unit-convert';

import { Button, Hr, LoadingSpinner } from '@leather.io/ui';

import { StackingFormItemTitle } from '../components/stacking-form-item-title';
import { useCalculateFee } from '../hooks/use-calculate-fee';
import { getProtocolBySlug } from '../start-liquid-stacking/utils/utils-preset-protocols';
import { createIncreaseLiquidValidationSchema } from './utils/increase-liquid-schema';

interface StartLiquidStackingProps {
  protocolSlug: ProtocolSlug;
}

const initialStackingFormValues: Partial<IncreaseLiquidFormSchema> = {
  signerKey: '',
  signerSignature: '',
  maxAmount: '',
  authId: '',
  // amount: '',
};

export function IncreaseLiquidStacking({ protocolSlug }: StartLiquidStackingProps) {
  const { client } = useStackingClient();
  const { stacksAccount } = useLeatherConnect();

  if (!stacksAccount || !client) return <Navigate to="/stacking" replace />;
  return <IncreaseLiquidStackingLayout client={client} protocolSlug={protocolSlug} />;
}

interface StartLiquidStackingLayoutProps {
  protocolSlug: ProtocolSlug;
  client: StackingClient;
}

function IncreaseLiquidStackingLayout({ protocolSlug, client }: StartLiquidStackingLayoutProps) {
  const { stacksAccount } = useLeatherConnect();
  if (!stacksAccount) throw new Error('No stx address available');

  const [drawerOpen, setDrawerOpen] = useState(false);

  const { networkInstance, networkName } = useStacksNetwork();
  const navigate = useNavigate();

  const calcFee = useCalculateFee();
  const transactionFeeUStx = calcFee(STACKING_CONTRACT_CALL_TX_BYTES);

  const getStatusQuery = useGetStatusQuery();
  const getAccountExtendedBalancesQuery = useGetAccountExtendedBalancesQuery();
  const { getHasPendingStackIncreaseQuery } = useGetHasPendingStackingTransactionQuery();
  const getPoxInfoQuery = useGetPoxInfoQuery();

  const protocol = getProtocolBySlug(protocolSlug);
  const protocolStxAddress = protocol.protocolAddress?.[networkInstance];

  const extendedStxBalances = getAccountExtendedBalancesQuery.data?.stx;
  const availableBalanceUStx = extendedStxBalances
    ? getAvailableAmountUstx(extendedStxBalances, getHasPendingStackIncreaseQuery.data)
    : undefined;

  const schema = useMemo(
    () =>
      createIncreaseLiquidValidationSchema({
        availableBalanceUStx,
        transactionFeeUStx,
        stackerInfo: getStatusQuery.data,
        network: networkName,
        rewardCycleId: getPoxInfoQuery.data?.reward_cycle_id,
      }),
    [
      availableBalanceUStx,
      getPoxInfoQuery.data?.reward_cycle_id,
      getStatusQuery.data,
      networkName,
      transactionFeeUStx,
    ]
  );

  const {
    data: increaseLiquidResult,
    mutateAsync: handleIncreaseLiquidSubmit,
    isPending: handleIncreaseLiquidPending,
  } = useMutation(
    createIncreaseLiquidMutationOptions({
      leather,
      network: networkInstance,
      client,
    })
  );

  const formMethods = useForm({
    mode: 'onTouched',
    defaultValues: {
      ...initialStackingFormValues,
      increaseBy: availableBalanceUStx
        ? microStxToStxRounded(availableBalanceUStx).toNumber()
        : undefined,
    },
    resolver: zodResolver(schema),
  });

  if (
    getStatusQuery.isLoading ||
    getAccountExtendedBalancesQuery.isLoading ||
    getHasPendingStackIncreaseQuery.isLoading ||
    getPoxInfoQuery.isLoading
  ) {
    return (
      <Flex height="100vh" width="100%">
        <LoadingSpinner />
      </Flex>
    );
  }

  if (
    getStatusQuery.isError ||
    !getStatusQuery.data ||
    getPoxInfoQuery.isError ||
    !getPoxInfoQuery.data ||
    getAccountExtendedBalancesQuery.isError ||
    !getAccountExtendedBalancesQuery.data ||
    getHasPendingStackIncreaseQuery.isError ||
    getHasPendingStackIncreaseQuery.data === undefined ||
    !client
  ) {
    const msg = 'Error while loading data, try reloading the page.';
    // eslint-disable-next-line no-console
    console.error(msg);
    return (
      <Flex height="100vh" width="100%">
        <styled.p>{msg}</styled.p>
      </Flex>
    );
  }

  const handleIncreaseLiquid = formMethods.handleSubmit((values: any) => {
    return handleIncreaseLiquidSubmit({ ...values }).then(() =>
      navigate(`/stacking/liquid/${protocolSlug}/active`)
    );
  });

  const increaseBy = formMethods.watch('increaseBy') as number;

  function onSubmit(confirmation: LiquidStackingConfirmationStepId) {
    if (confirmation === 'depositStx') {
      return handleIncreaseLiquid();
    }

    throw new Error(`Unknown confirmation type: ${confirmation}`);
  }

  return (
    <Stack mt="space.09" gap={[null, null, 'space.06', 'space.09']} mb="space.07">
      <FormProvider {...formMethods}>
        <FormPageLayout
          form={
            <Form>
              <Stack gap={['space.05', 'space.05', 'space.05', 'space.07']}>
                <Stack gap="space.02">
                  <StackingFormItemTitle title="Adding amount" />
                  <ChooseStackingAmount
                    controlName="increaseBy"
                    availableAmount={availableBalanceUStx}
                    isLoading={getAccountExtendedBalancesQuery.isLoading}
                  />
                </Stack>

                <Hr />

                <Stack gap="space.02">
                  <StackingFormItemTitle title="Details" />
                  {/* TODO: fix contractAddress value */}
                  <StackingContractDetails
                    addressTitle="Protocol address"
                    address={protocolStxAddress}
                    contractAddress={protocolStxAddress}
                  />
                </Stack>

                <Hr />

                <Stack gap="space.02">
                  <StackingFormItemTitle title="Liquid Stacking conditions" />
                  <ChooseLiquidStackingConditions />
                </Stack>

                <Button
                  px="space.06"
                  size="md"
                  width="100%"
                  display={['block', null, 'none']}
                  onClick={() => {
                    setDrawerOpen(true);
                  }}
                >
                  Review
                </Button>
              </Stack>
            </Form>
          }
          preview={
            <StackingFormStepsPanel>
              <LiquidStackingConfirmationSteps
                onSubmit={onSubmit}
                confirmationState={{
                  depositStx: {
                    accepted: Boolean(increaseLiquidResult),
                    loading: handleIncreaseLiquidPending,
                    visible: true,
                  },
                }}
                stackingAmount={increaseBy}
              />
            </StackingFormStepsPanel>
          }
        />
      </FormProvider>

      <StartStackingDrawer drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen}>
        <LiquidStackingConfirmationSteps
          onSubmit={onSubmit}
          confirmationState={{
            depositStx: {
              accepted: Boolean(increaseLiquidResult),
              loading: handleIncreaseLiquidPending,
              visible: true,
            },
          }}
          stackingAmount={increaseBy}
        />
      </StartStackingDrawer>
    </Stack>
  );
}
