import { useMemo, useState } from 'react';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router';

import { zodResolver } from '@hookform/resolvers/zod';
import { StackingClient } from '@stacks/stacking';
import { useMutation } from '@tanstack/react-query';
import { Flex, Stack } from 'leather-styles/jsx';
import { LiquidStackingConfirmationStepId } from '~/components/confirmations/confirmation-steps';
import { FormPageLayout } from '~/components/forms/form-page.layout';
import { ProtocolOverview } from '~/components/protocol-overview';
import { learnArticles } from '~/content/learn-content';
import { StackingContractDetails } from '~/features/stacking/components/stacking-contract-details';
import { StackingFormStepsPanel } from '~/features/stacking/components/stacking-form-steps-panel';
import { StartStackingDrawer } from '~/features/stacking/components/start-stacking-drawer';
import { useGetSecondsUntilNextCycleQuery } from '~/features/stacking/hooks/stacking.query';
import { useStackingClient } from '~/features/stacking/providers/stacking-client-provider';
import { ChooseLiquidStackingConditions } from '~/features/stacking/start-liquid-stacking/components/choose-liquid-stacking-conditions';
import { LiquidStackingConfirmationSteps } from '~/features/stacking/start-liquid-stacking/components/liquid-stacking-confirmation-steps';
import {
  StackingLiquidFormSchema,
  createValidationSchema,
} from '~/features/stacking/start-liquid-stacking/utils/stacking-liquid-schema';
import { ProtocolSlug } from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';
import { createDepositStxMutationOptions } from '~/features/stacking/start-liquid-stacking/utils/utils-liquid-stacking-stx';
import { Page } from '~/layouts/page/page';
import {
  useStxAvailableUnlockedBalance,
  useStxBalance,
} from '~/queries/balance/account-balance.hooks';
import { useProtocolInfo } from '~/queries/protocols/use-protocol-info';
import { useLeatherConnect } from '~/store/addresses';
import { useStacksNetwork } from '~/store/stacks-network';
import { leather } from '~/utils/leather-sdk';

import { Button, Hr, LoadingSpinner } from '@leather.io/ui';

import { ChooseStackingAmount } from '../components/choose-stacking-amount';
import { StackingFormItemTitle } from '../components/stacking-form-item-title';
import { getProtocolBySlug } from './utils/utils-preset-protocols';

interface StartLiquidStackingProps {
  protocolSlug: ProtocolSlug;
}
const initialStackingFormValues: Partial<StackingLiquidFormSchema> = {
  // amount: '',
};

export function StartLiquidStacking({ protocolSlug }: StartLiquidStackingProps) {
  const { client } = useStackingClient();
  const { stacksAccount } = useLeatherConnect();

  if (!stacksAccount || !client) return <Navigate to="/stacking" replace />;

  return <StartLiquidStackingLayout client={client} protocolSlug={protocolSlug} />;
}

interface StartLiquidStackingLayoutProps {
  protocolSlug: ProtocolSlug;
  client: StackingClient;
}

function StartLiquidStackingLayout({ protocolSlug }: StartLiquidStackingLayoutProps) {
  const { stacksAccount } = useLeatherConnect();
  if (!stacksAccount) throw new Error('No stx address available');

  const [drawerOpen, setDrawerOpen] = useState(false);

  const { networkInstance } = useStacksNetwork();
  const navigate = useNavigate();
  const protocolInfo = useProtocolInfo(protocolSlug);

  const getSecondsUntilNextCycleQuery = useGetSecondsUntilNextCycleQuery();

  const {
    filteredBalanceQuery: { isLoading: totalAvailableBalanceIsLoading },
  } = useStxBalance(stacksAccount.address);
  const totalAvailableBalance = useStxAvailableUnlockedBalance(stacksAccount.address);

  const protocol = getProtocolBySlug(protocolSlug);
  const protocolStxAddress = protocol.protocolAddress?.[networkInstance];

  const schema = useMemo(
    () =>
      createValidationSchema({
        protocolName: protocol.name,
        availableBalance: totalAvailableBalance,
      }),
    [protocol.name, totalAvailableBalance]
  );

  const {
    data: depositStxResult,
    mutateAsync: handleDepositStxSubmit,
    isPending: handleDepositStxPending,
  } = useMutation(
    createDepositStxMutationOptions({
      leather,
      network: networkInstance,
    })
  );

  const [termsConfirmed, setTermsConfirmed] = useState(false);

  const formMethods = useForm({
    mode: 'onTouched',
    defaultValues: {
      ...initialStackingFormValues,
    },
    resolver: zodResolver(schema),
  });

  const handleDeposit = formMethods.handleSubmit(values => {
    return handleDepositStxSubmit({
      ...values,
      stxAddress: stacksAccount.address,
      protocolName: protocol.name,
    }).then(() => {
      return navigate(`/stacking/liquid/${protocolSlug}/active`);
    });
  });

  const stackingAmount = formMethods.watch('amount') as number;

  // Get articles with direct access
  const stackingAmountArticle = learnArticles.stackingAmount;
  const stackingContractDetailsArticle = learnArticles.stackingContractDetails;

  if (getSecondsUntilNextCycleQuery.isLoading || protocolInfo.isLoading) {
    return (
      <Flex height="100vh" width="100%">
        <LoadingSpinner />
      </Flex>
    );
  }

  function onSubmit(confirmation: LiquidStackingConfirmationStepId) {
    if (confirmation === 'terms') {
      setTermsConfirmed(v => !v);
      return;
    }
    if (confirmation === 'depositStx') {
      return handleDeposit();
    }

    throw new Error(`Unknown confirmation type: ${confirmation}`);
  }

  return (
    <Stack gap={['space.06', 'space.06', 'space.06', 'space.09']} mb="space.07">
      <Page.Inset>
        {protocolInfo.info && <ProtocolOverview info={protocolInfo.info} isStackingPage />}
      </Page.Inset>
      <FormProvider {...formMethods}>
        <FormPageLayout
          form={
            <Form>
              <Stack gap={['space.05', 'space.05', 'space.05', 'space.07']}>
                <Stack gap="space.02">
                  <StackingFormItemTitle title="Amount" article={stackingAmountArticle} />
                  <ChooseStackingAmount
                    availableAmount={totalAvailableBalance.amount}
                    isLoading={totalAvailableBalanceIsLoading}
                  />
                </Stack>

                <Hr />

                <Stack gap="space.02">
                  <StackingFormItemTitle title="Details" article={stackingContractDetailsArticle} />
                  {/* TODO: fix contractAddress value */}
                  <StackingContractDetails
                    addressTitle="Protocol address"
                    address={protocolStxAddress}
                    contractAddress={protocolStxAddress}
                  />
                </Stack>

                <Hr />

                <Stack gap="space.02">
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
                  terms: {
                    accepted: termsConfirmed,
                    loading: false,
                    visible: true,
                  },
                  depositStx: {
                    accepted: Boolean(depositStxResult),
                    loading: handleDepositStxPending,
                    visible: true,
                  },
                }}
                stackingAmount={stackingAmount}
              />
            </StackingFormStepsPanel>
          }
        />
      </FormProvider>

      <StartStackingDrawer drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen}>
        <LiquidStackingConfirmationSteps
          onSubmit={onSubmit}
          confirmationState={{
            terms: {
              accepted: termsConfirmed,
              loading: false,
              visible: true,
            },
            depositStx: {
              accepted: Boolean(depositStxResult),
              loading: handleDepositStxPending,
              visible: true,
            },
          }}
          stackingAmount={stackingAmount}
        />
      </StartStackingDrawer>
    </Stack>
  );
}
