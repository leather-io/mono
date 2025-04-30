import { useMemo, useState } from 'react';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { zodResolver } from '@hookform/resolvers/zod';
import { StackingClient } from '@stacks/stacking';
import { useMutation } from '@tanstack/react-query';
import { Flex, Stack, styled } from 'leather-styles/jsx';
import { LiquidStackingConfirmationStepId } from '~/components/confirmations/confirmation-steps';
import { STACKING_CONTRACT_CALL_TX_BYTES } from '~/constants/constants';
import { StackingContractDetails } from '~/features/stacking/components/stacking-contract-details';
import { StackingFormStepsPanel } from '~/features/stacking/components/stacking-form-steps-panel';
import { StartStackingLayout } from '~/features/stacking/components/stacking-layout';
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
import { leather } from '~/helpers/leather-sdk';
import { useLeatherConnect } from '~/store/addresses';
import { useStacksNetwork } from '~/store/stacks-network';
import { microStxToStxRounded } from '~/utils/unit-convert';

import { Button, Hr, LoadingSpinner } from '@leather.io/ui';

import { StackingFormItemTitle } from '../components/stacking-form-item-title';
import { useCalculateFee } from '../hooks/use-calculate-fee';
import { getProtocolBySlug } from '../start-liquid-stacking/utils/utils-preset-protocols';
import { ChoosePoolingAmount } from '../start-pooled-stacking/components/choose-pooling-amount';
import { createValidationSchema } from './utils/increase-liquid-schema';

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

  if (!stacksAccount || !client) {
    return 'You should connect STX wallet';
  }

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
      createValidationSchema({
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

  const formMethods = useForm<IncreaseLiquidFormSchema>({
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

  const handleIncreaseLiquid = formMethods.handleSubmit(values => {
    return handleIncreaseLiquidSubmit({
      ...values,
    }).then(() => {
      return navigate(`/liquid-stacking/${protocolSlug}/active`);
    });
  });

  const increaseBy = formMethods.watch('increaseBy');

  function onSubmit(confirmation: LiquidStackingConfirmationStepId) {
    if (confirmation === 'depositStx') {
      return handleIncreaseLiquid();
    }

    throw new Error(`Unknown confirmation type: ${confirmation}`);
  }

  return (
    <>
      <FormProvider {...formMethods}>
        <StartStackingLayout
          stackingForm={
            <Form>
              <Stack
                gap={['space.05', 'space.05', 'space.05', 'space.07']}
                maxWidth={[null, null, '304px', 'none']}
              >
                <Stack gap="space.02">
                  <StackingFormItemTitle title="Adding amount" />
                  <ChoosePoolingAmount
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
                  size="sm"
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
          stackingStepsPanel={
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
    </>
  );
}
