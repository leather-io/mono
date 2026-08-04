import type { ReactNode } from 'react';
import { Form, FormProvider, useForm, useFormContext } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import BigNumber from 'bignumber.js';
import { Box, Stack, styled } from 'leather-styles/jsx';
import { learnArticles } from '~/content/learn-content';
import { getStakingPoolFromSlug } from '~/data/bitcoin-staking-data';
import { pox5NetworkConfig } from '~/data/pox5-network-config';
import { PreparePhaseCallout } from '~/features/bitcoin-staking/components/prepare-phase-callout';
import {
  type StakingCycleStatus,
  StakingPoolOverview,
} from '~/features/bitcoin-staking/components/staking-pool-overview';
import type { Pox5StakerInfo } from '~/features/bitcoin-staking/queries/create-get-pox5-staker-info-query-options';
import type { Pox5ClaimableRewards } from '~/features/bitcoin-staking/queries/pox5-stacking.query';
import { ClaimableRewardsCard } from '~/features/bitcoin-staking/staking-active/components/claimable-rewards-card';
import type { ActiveStakingDetails } from '~/features/bitcoin-staking/staking-active/hooks/use-active-staking-info';
import { ChooseStakingAmount } from '~/features/bitcoin-staking/start-staking/components/choose-staking-amount';
import { ChooseStakingConditions } from '~/features/bitcoin-staking/start-staking/components/choose-staking-conditions';
import { ChooseStakingDuration } from '~/features/bitcoin-staking/start-staking/components/choose-staking-duration';
import { createStakingFormSchema } from '~/features/bitcoin-staking/start-staking/utils/staking-form-schema';
import { StackingFormItemTitle } from '~/features/stacking/components/stacking-form-item-title';
import { DEFAULT_STAKING_CYCLES } from '~/pages/bitcoin-staking/bitcoin-staking.constants';

import { Hr } from '@leather.io/ui';
import { createMoney } from '@leather.io/utils';

const pool = getStakingPoolFromSlug('fast-pool');
const availableAmount = new BigNumber(12_500_000_000);
const millisecondsPerCycle = 14 * 24 * 60 * 60 * 1000;

const stakingFormSchema = createStakingFormSchema({
  networkMode: pox5NetworkConfig.bitcoinNetworkMode,
  availableBalance: createMoney(availableAmount, 'STX'),
  supportsBtcPayout: pool.supportsBtcPayout,
});

const cycleStages: { label: string; note: string; cycleStatus: StakingCycleStatus | null }[] = [
  {
    label: 'Mid-cycle — plenty of room',
    note: 'The common case. Staking and changes are open, and the countdown sits quietly as background information.',
    cycleStatus: { kind: 'open', secondsUntilChangesClose: 11 * 24 * 3600 },
  },
  {
    label: 'Closing soon — inside the last day',
    note: 'Switches to hours, because a rounded day count reads as “0 days” exactly when the number starts to matter.',
    cycleStatus: { kind: 'open', secondsUntilChangesClose: 9 * 3600 },
  },
  {
    label: 'Closing — inside the final hour',
    note: 'Drops the number altogether. “1h left” is both imprecise and alarming this late, so the copy states the window instead of counting it down.',
    cycleStatus: { kind: 'open', secondsUntilChangesClose: 40 * 60 },
  },
  {
    label: 'Paused — prepare phase',
    note: 'The contract rejects stakes and changes here. Until now the only signal was a callout on the active page, so someone on the form found out by being blocked.',
    cycleStatus: { kind: 'paused', secondsUntilStakingReopens: 14 * 3600 },
  },
  {
    label: 'Cycle clock not loaded yet',
    note: 'Falls back to the previous behaviour rather than guessing, so a slow node never claims staking is open or closed without evidence.',
    cycleStatus: null,
  },
];

const mockStakerInfo: Pox5StakerInfo = {
  amountMicroStx: 5_000_000_000n,
  firstRewardCycle: 141,
  numCycles: DEFAULT_STAKING_CYCLES,
  signerManagerContractId: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQVX8X0G.signer-manager',
};

const mockClaimable: Pox5ClaimableRewards = {
  isLoading: false,
  totalEarned: 9941n,
  byCycle: [{ cycle: 141, earned: 9941n, fees: 500n }],
};

function makeActiveDetails(overrides: Partial<ActiveStakingDetails> = {}): ActiveStakingDetails {
  return {
    endCycle: 141 + DEFAULT_STAKING_CYCLES,
    unlockDate: new Date(Date.now() + DEFAULT_STAKING_CYCLES * millisecondsPerCycle),
    isInPreparePhase: false,
    secondsUntilStakingReopens: 0,
    nextCycleNumber: 142,
    daysUntilNextCycle: 9,
    claimable: mockClaimable,
    payoutPreference: null,
    ...overrides,
  };
}

const activeStates: { label: string; note: string; details: ActiveStakingDetails }[] = [
  {
    label: 'Staking — actions available',
    note: 'Rewards claimable, unstake and update enabled.',
    details: makeActiveDetails(),
  },
  {
    label: 'Staking — prepare phase',
    note: 'The callout appears and the action buttons are disabled, because the contract would reject them.',
    details: makeActiveDetails({ isInPreparePhase: true, secondsUntilStakingReopens: 14 * 3600 }),
  },
];

interface SectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

function Section({ title, description, children }: SectionProps) {
  return (
    <Stack gap="space.05">
      <Stack gap="space.02" maxWidth="70ch">
        <styled.h2 textStyle="heading.04">{title}</styled.h2>
        <styled.p textStyle="body.02" color="ink.text-subdued">
          {description}
        </styled.p>
      </Stack>
      {children}
    </Stack>
  );
}

interface StateProps {
  label: string;
  note: string;
  children: ReactNode;
}

function State({ label, note, children }: StateProps) {
  return (
    <Stack gap="space.03">
      <Stack gap="space.01" maxWidth="70ch">
        <styled.h3 textStyle="label.02">{label}</styled.h3>
        <styled.p
          textStyle="caption.01"
          color="ink.text-subdued"
          borderLeft="default"
          pl="space.03"
        >
          {note}
        </styled.p>
      </Stack>
      {children}
    </Stack>
  );
}

function StartStakingFormBody() {
  const { watch } = useFormContext();
  const cycles = Number(watch('cycles'));
  const estimatedUnlockDate =
    Number.isFinite(cycles) && cycles >= 1
      ? new Date(Date.now() + cycles * millisecondsPerCycle)
      : null;

  return (
    <Form>
      <Stack gap={['space.05', 'space.05', 'space.05', 'space.07']}>
        <Stack gap="space.02">
          <StackingFormItemTitle title="Amount" article={learnArticles.stackingAmount} />
          <ChooseStakingAmount availableAmount={availableAmount} isLoading={false} />
        </Stack>

        <Hr />

        <Stack gap="space.02">
          <StackingFormItemTitle title="Duration" article={learnArticles.stackingDuration} />
          <ChooseStakingDuration estimatedUnlockDate={estimatedUnlockDate} />
        </Stack>

        <Hr />

        <ChooseStakingConditions />
      </Stack>
    </Form>
  );
}

function StartStakingForm() {
  const formMethods = useForm({
    mode: 'onTouched',
    defaultValues: {
      amount: '5000',
      cycles: DEFAULT_STAKING_CYCLES,
      payoutEnabled: false,
      rewardAddress: '',
      maxFeeSats: '',
    },
    resolver: zodResolver(stakingFormSchema),
  });

  return (
    <FormProvider {...formMethods}>
      <StartStakingFormBody />
    </FormProvider>
  );
}

export function StakingStatesPage() {
  return (
    <Stack gap="space.11" pb="space.11">
      <Stack gap="space.03" maxWidth="70ch">
        <styled.h1 textStyle="heading.03">Staking states</styled.h1>
        <styled.p textStyle="body.02" color="ink.text-subdued">
          The pox-5 staking surfaces with mock data, so every state can be reviewed without
          connecting a wallet or waiting for a cycle to turn. Every component here is the one that
          ships.
        </styled.p>
      </Stack>

      <Section
        title="Cycle stages"
        description="Only the pool overview changes across these, so they are listed as grids rather than four copies of the whole page. The last line of the Next cycle cell is the new part."
      >
        <Stack gap="space.07">
          {cycleStages.map(stage => (
            <State key={stage.label} label={stage.label} note={stage.note}>
              <StakingPoolOverview
                pool={pool}
                totalStakedMicroStx={75_000_000_000n}
                nextCycleNumber={142}
                daysUntilNextCycle={9}
                cycleStatus={stage.cycleStatus}
              />
            </State>
          ))}
        </Stack>
      </Section>

      <Section
        title="Starting to stake"
        description="The form as it appears on a pool page, with live validation. Type an out-of-range or non-numeric value into Duration to see the inline error."
      >
        <Stack gap="space.05">
          <StakingPoolOverview
            pool={pool}
            totalStakedMicroStx={75_000_000_000n}
            nextCycleNumber={142}
            daysUntilNextCycle={9}
            cycleStatus={{ kind: 'open', secondsUntilChangesClose: 11 * 24 * 3600 }}
          />
          <Box maxWidth="500px">
            <StartStakingForm />
          </Box>
        </Stack>
      </Section>

      <Section
        title="While staking"
        description="The cycle-dependent part of the pool page once a position exists. The position details grid is missing here on purpose: its action buttons resolve a live StackingClient during render, so it cannot mount without a connected wallet. Those are covered by the staking e2e specs instead."
      >
        <Stack gap="space.07">
          {activeStates.map(state => (
            <State key={state.label} label={state.label} note={state.note}>
              <Stack gap="space.04">
                {state.details.isInPreparePhase && (
                  <PreparePhaseCallout
                    secondsUntilStakingReopens={state.details.secondsUntilStakingReopens}
                  />
                )}
                <ClaimableRewardsCard
                  providerId={pool.providerId}
                  signerManagerContractId={mockStakerInfo.signerManagerContractId}
                  claimable={state.details.claimable}
                />
              </Stack>
            </State>
          ))}
        </Stack>
      </Section>
    </Stack>
  );
}
