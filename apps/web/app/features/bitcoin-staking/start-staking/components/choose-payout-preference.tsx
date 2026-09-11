import { ReactNode } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';
import { ErrorLabel } from '~/components/error-label';
import { bitcoinStakingContent, bitcoinStakingLabels } from '~/content/bitcoin-staking-content';
import { learnArticles } from '~/content/learn-content';
import { LearnMoreLink } from '~/layouts/page/page';

import { Badge, BtcAvatarIcon, Callout, Input, SbtcAvatarIcon } from '@leather.io/ui';

import { PoolPayoutMode, canPayoutInBtc, isBtcPayoutRequired } from '../../utils/pool-payout';
import { getSmallestValidMinClaimSats } from '../utils/staking-form-schema';

const payoutOptionGroupName = 'payoutPreference';

interface PayoutOptionProps {
  label: string;
  icon: ReactNode;
  tag?: string;
  isSelected: boolean;
  isDisabled?: boolean;
  onSelect(): void;
}

function PayoutOption({
  label,
  icon,
  tag,
  isSelected,
  isDisabled = false,
  onSelect,
}: PayoutOptionProps) {
  return (
    <styled.label
      position="relative"
      display="flex"
      alignItems="center"
      gap="space.02"
      minHeight="64px"
      p="space.04"
      containerType="inline-size"
      borderWidth="1px"
      borderStyle="solid"
      borderRadius="sm"
      bg="ink.background-primary"
      borderColor={isSelected ? 'ink.action-primary-default' : 'ink.border-default'}
      boxShadow={isSelected ? 'inset 0 0 0 1px {colors.ink.action-primary-default}' : 'none'}
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
      _hover={isDisabled || isSelected ? undefined : { bg: 'ink.component-background-hover' }}
      _focusWithin={{ outline: '2px solid {colors.blue.border}', outlineOffset: '2px' }}
      data-testid={`payout-option-${label.toLowerCase()}`}
    >
      <styled.input
        type="radio"
        name={payoutOptionGroupName}
        checked={isSelected}
        disabled={isDisabled}
        onChange={onSelect}
        position="absolute"
        opacity={0}
        width="1px"
        height="1px"
        pointerEvents="none"
      />
      <Flex
        flexShrink={0}
        opacity={isDisabled ? 0.32 : 1}
        filter={isDisabled ? 'grayscale(1)' : 'none'}
      >
        {icon}
      </Flex>
      <styled.span
        textStyle="label.02"
        color={isDisabled ? 'ink.text-non-interactive' : 'ink.text-primary'}
      >
        {label}
      </styled.span>
      {tag && (
        <Badge
          label={tag}
          position="absolute"
          top="space.02"
          right="space.02"
          color={isDisabled ? 'ink.text-non-interactive' : 'ink.text-subdued'}
          css={{ '@container (max-width: 180px)': { display: 'none' } }}
        />
      )}
    </styled.label>
  );
}

interface RewardAddressFieldProps {
  label: string;
}

function RewardAddressField({ label }: RewardAddressFieldProps) {
  const { control } = useFormContext();

  return (
    <Box>
      <Controller
        control={control}
        name="rewardAddress"
        render={({ field: { onChange, onBlur, value, ref }, fieldState: { invalid, error } }) => (
          <>
            <Input.Root>
              <Input.Label>{label}</Input.Label>
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
            {invalid && error && <ErrorLabel mt="space.02">{error.message}</ErrorLabel>}
          </>
        )}
      />
    </Box>
  );
}

interface OperatorPayoutFacts {
  poolName: string;
  cadence: string;
}

interface BtcOnlyPayoutProps {
  operatorPayout: OperatorPayoutFacts | undefined;
  registeredAddress: string | undefined;
}

function BtcOnlyPayout({ operatorPayout, registeredAddress }: BtcOnlyPayoutProps) {
  const { watch } = useFormContext();
  const watchedAddress = watch('rewardAddress');
  const addressChanged =
    registeredAddress !== undefined &&
    typeof watchedAddress === 'string' &&
    watchedAddress.trim() !== registeredAddress;
  const { payoutPreference } = bitcoinStakingContent;

  return (
    <Stack gap="space.03" data-testid="btc-only-payout">
      <RewardAddressField label={payoutPreference.btcOnlyLabel} />
      {operatorPayout && (
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          {payoutPreference.btcOnlyHelper(operatorPayout.poolName, operatorPayout.cadence)}
        </styled.span>
      )}
      {addressChanged && operatorPayout && (
        <Callout variant="warning" data-testid="payout-address-changed">
          {payoutPreference.registeredAddressChanged(operatorPayout.poolName)}
        </Callout>
      )}
    </Stack>
  );
}

interface ChoosePayoutPreferenceProps {
  payoutMode: PoolPayoutMode;
  supportsMinClaim: boolean;
  operatorPayout?: OperatorPayoutFacts;
  registeredAddress?: string;
}

export function ChoosePayoutPreference({
  payoutMode,
  supportsMinClaim,
  operatorPayout,
  registeredAddress,
}: ChoosePayoutPreferenceProps) {
  const { control, watch } = useFormContext();
  const payoutEnabled = Boolean(watch('payoutEnabled'));
  const watchedMaxFeeSats = watch('maxFeeSats');
  const { payoutPreference } = bitcoinStakingContent;
  const supportsBtcPayout = canPayoutInBtc(payoutMode);
  const isBtcSelected = payoutEnabled && supportsBtcPayout;
  const smallestValidMinClaimSats = getSmallestValidMinClaimSats(
    typeof watchedMaxFeeSats === 'string' ? watchedMaxFeeSats : undefined
  );

  if (isBtcPayoutRequired(payoutMode)) {
    return <BtcOnlyPayout operatorPayout={operatorPayout} registeredAddress={registeredAddress} />;
  }

  function helperText() {
    if (!supportsBtcPayout) return payoutPreference.sbtcOnlyHelper;
    return isBtcSelected ? payoutPreference.btcHelper : payoutPreference.sbtcHelper;
  }

  return (
    <Stack gap="space.03">
      <Controller
        control={control}
        name="payoutEnabled"
        render={({ field: { onChange, value } }) => (
          <Box
            role="radiogroup"
            aria-label={bitcoinStakingLabels.rewardsPayout}
            display="grid"
            gridTemplateColumns="1fr 1fr"
            gap="space.02"
          >
            <PayoutOption
              label={payoutPreference.sbtcLabel}
              icon={<SbtcAvatarIcon size="sm" />}
              tag={payoutPreference.sbtcTag}
              isSelected={!value || !supportsBtcPayout}
              onSelect={() => onChange(false)}
            />
            <PayoutOption
              label={payoutPreference.btcLabel}
              icon={<BtcAvatarIcon size="sm" />}
              isSelected={Boolean(value) && supportsBtcPayout}
              isDisabled={!supportsBtcPayout}
              onSelect={() => onChange(true)}
            />
          </Box>
        )}
      />

      <styled.span textStyle="caption.01" color="ink.text-subdued">
        {helperText()}
        <LearnMoreLink destination={learnArticles.stackingRewardsTokens.slug} />
      </styled.span>

      {isBtcSelected && (
        <Stack gap="space.03">
          <RewardAddressField label="BTC address" />
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
                  {invalid && error && <ErrorLabel mt="space.02">{error.message}</ErrorLabel>}
                </>
              )}
            />
          </Box>
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {payoutPreference.maxFeeNote}
          </styled.span>
          {supportsMinClaim && (
            <>
              <Box mt="space.02">
                <Controller
                  control={control}
                  name="minClaimSats"
                  render={({
                    field: { onChange, onBlur, value, ref },
                    fieldState: { invalid, error },
                  }) => (
                    <>
                      <Input.Root>
                        <Input.Label>Minimum claim (sats)</Input.Label>
                        <Input.Field
                          id="minClaimSats"
                          inputMode="numeric"
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
              <styled.span textStyle="caption.01" color="ink.text-subdued">
                {payoutPreference.minClaimNote(
                  smallestValidMinClaimSats === null
                    ? null
                    : smallestValidMinClaimSats.toLocaleString('en-US')
                )}
              </styled.span>
            </>
          )}
        </Stack>
      )}
    </Stack>
  );
}
