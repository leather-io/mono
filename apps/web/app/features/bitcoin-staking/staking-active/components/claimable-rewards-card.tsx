import { useState } from 'react';

import { useMutation } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { HStack, Stack, styled } from 'leather-styles/jsx';
import { BitcoinStakingProviderId } from '~/data/bitcoin-staking-data';
import { useLeatherConnect } from '~/store/addresses';
import { leather } from '~/utils/leather-sdk';

import { Button, ChevronDownIcon, ChevronUpIcon } from '@leather.io/ui';

import { Pox5SubmitError } from '../../components/pox5-submit-error';
import { usePox5TxTracker } from '../../hooks/use-pox5-tx-tracker';
import { Pox5ClaimableRewards } from '../../queries/pox5-stacking.query';
import { createClaimRewardsMutationOptions } from '../../transactions/pox5-mutations';
import { getBroadcastTxId } from '../../transactions/pox5-tx-status';

function formatSbtc(units: bigint): string {
  return `${new BigNumber(units.toString()).dividedBy(1e8).toFormat()} sBTC`;
}

interface ClaimableRewardsCardProps {
  providerId: BitcoinStakingProviderId;
  signerManagerContractId: string;
  claimable: Pox5ClaimableRewards;
}

export function ClaimableRewardsCard({
  providerId,
  signerManagerContractId,
  claimable,
}: ClaimableRewardsCardProps) {
  const { stacksAccount } = useLeatherConnect();
  const { track } = usePox5TxTracker();
  const [showHistory, setShowHistory] = useState(false);

  const {
    mutate: submitClaimRewards,
    isPending,
    error: claimError,
  } = useMutation(createClaimRewardsMutationOptions({ leather }));

  // Claims are per-cycle transactions; claim the oldest unclaimed cycle first.
  const oldestUnclaimed = claimable.byCycle[0];
  const hasHistory = claimable.byCycle.length > 0;

  function handleClaimClick() {
    if (!oldestUnclaimed || !stacksAccount) return;
    submitClaimRewards(
      {
        providerId,
        signerManagerContractId,
        stakerAddress: stacksAccount.address,
        rewardCycle: oldestUnclaimed.cycle,
      },
      {
        onSuccess(result) {
          const txId = getBroadcastTxId(result);
          if (!txId) return;
          track({ kind: 'claim-rewards', txId, destination: null, startedAt: Date.now() });
        },
      }
    );
  }

  return (
    <Stack
      gap="space.03"
      p="space.05"
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius="md"
      data-testid="claimable-rewards-card"
    >
      <HStack justifyContent="space-between" alignItems="center" gap="space.03">
        <Stack gap="space.01">
          <styled.span textStyle="label.03" color="ink.text-subdued">
            Claimable rewards
          </styled.span>
          <styled.span textStyle="heading.05">
            {claimable.isLoading ? '—' : formatSbtc(claimable.totalEarned)}
          </styled.span>
        </Stack>
        <HStack gap="space.02" alignItems="center" flexShrink={0}>
          {hasHistory && (
            <Button
              variant="ghost"
              size="md"
              type="button"
              iconEnd={showHistory ? ChevronUpIcon : ChevronDownIcon}
              onClick={() => setShowHistory(v => !v)}
              data-testid="toggle-rewards-history"
            >
              {showHistory ? 'Hide history' : 'Show history'}
            </Button>
          )}
          <Button
            size="md"
            onClick={handleClaimClick}
            disabled={isPending || claimable.isLoading || !oldestUnclaimed}
            data-testid="claim-rewards-button"
          >
            Claim rewards
          </Button>
        </HStack>
      </HStack>

      <Pox5SubmitError error={claimError} />

      {hasHistory && showHistory && (
        <Stack
          gap="0"
          px="space.04"
          bg="ink.background-secondary"
          borderRadius="sm"
          data-testid="rewards-history"
        >
          {claimable.byCycle.map(rewards => (
            <HStack
              key={rewards.cycle}
              justifyContent="space-between"
              py="space.03"
              borderBottomWidth={1}
              borderBottomColor="ink.border-default"
              _last={{ borderBottomWidth: 0 }}
            >
              <styled.span textStyle="caption.01">Cycle {rewards.cycle}</styled.span>
              <styled.span textStyle="caption.01">{formatSbtc(rewards.earned)}</styled.span>
            </HStack>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
