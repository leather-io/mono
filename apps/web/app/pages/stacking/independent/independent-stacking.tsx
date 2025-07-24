import { Form, FormProvider, useForm } from 'react-hook-form';

import BigNumber from 'bignumber.js';
import { Stack } from 'leather-styles/jsx';
import { Hr } from 'node_modules/@leather.io/ui/dist-web/components/hr.web';
import { WhenClient } from '~/components/client-only';
import { STACKING_CONTRACT_CALL_TX_BYTES } from '~/constants/constants';
import { ChooseStackingAmount } from '~/features/stacking/components/choose-stacking-amount';
import { StackingFormItemTitle } from '~/features/stacking/components/stacking-form-item-title';
import { StackingFormStepsPanel } from '~/features/stacking/components/stacking-form-steps-panel';
import { StartStackingLayout } from '~/features/stacking/components/stacking-layout';
import {
  useGetAccountExtendedBalancesQuery,
  useGetPoxInfoQuery,
  useGetSecondsUntilNextCycleQuery,
} from '~/features/stacking/hooks/stacking.query';
import { useCalculateFee } from '~/features/stacking/hooks/use-calculate-fee';
import { Page } from '~/layouts/page/page';
import {
  useStxAvailableUnlockedBalance,
  useStxBalance,
} from '~/queries/balance/account-balance.hooks';
import { useLeatherConnect } from '~/store/addresses';

const initialStackingFormValues: Partial<any> = {};

interface IndependentStackingProps {}
export function IndependentStacking(props: IndependentStackingProps) {
  const { stacksAccount, btcAddressP2wpkh } = useLeatherConnect();
  if (!stacksAccount) throw new Error('No STX address available');

  const getSecondsUntilNextCycleQuery = useGetSecondsUntilNextCycleQuery();
  const getPoxInfoQuery = useGetPoxInfoQuery();
  const getAccountExtendedBalancesQuery = useGetAccountExtendedBalancesQuery();
  const calcFee = useCalculateFee();
  const transactionFeeUStx = calcFee(STACKING_CONTRACT_CALL_TX_BYTES);

  const {
    filteredBalanceQuery: { isLoading: totalAvailableBalanceIsLoading },
  } = useStxBalance(stacksAccount.address);
  const totalAvailableBalance = useStxAvailableUnlockedBalance(stacksAccount.address);

  const formMethods = useForm<any>({
    mode: 'onTouched',
    defaultValues: {
      ...initialStackingFormValues,
      rewardAddress: btcAddressP2wpkh?.address,
    },
  });

  return (
    <Page>
      <Page.Header title="Stack independently" />
      <WhenClient>
        <FormProvider {...formMethods}>
          <StartStackingLayout
            stackingForm={
              <Form>
                <Stack gap={['space.05', 'space.05', 'space.05', 'space.07']}>
                  <Stack gap="space.02">
                    <StackingFormItemTitle title="Amount" />
                    <ChooseStackingAmount
                      availableAmount={totalAvailableBalance.amount}
                      isLoading={totalAvailableBalanceIsLoading}
                      stackedAmount={new BigNumber(0)}
                    />

                    <Hr />

                    <Stack gap="space.02">
                      <StackingFormItemTitle title="Duration" />
                      {/* <ChoosePoolingDuration /> */}
                    </Stack>
                  </Stack>
                </Stack>
              </Form>
            }
            stackingStepsPanel={<StackingFormStepsPanel>panel</StackingFormStepsPanel>}
          />
        </FormProvider>
      </WhenClient>
    </Page>
  );
}
