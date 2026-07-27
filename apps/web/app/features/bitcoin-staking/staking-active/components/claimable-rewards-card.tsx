import { useState } from 'react';

import { useMutation } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { Box, HStack, Stack, styled } from 'leather-styles/jsx';
import { BitcoinStakingProviderId } from '~/data/bitcoin-staking-data';
import { useLeatherConnect } from '~/store/addresses';
import { leather } from '~/utils/leather-sdk';

import { Button } from '@leather.io/ui';

import { Pox5ClaimableRewards } from '../../queries/pox5-stacking.query';
import { createClaimRewardsMutationOptions } from '../../transactions/pox5-claim-rewards';

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
  const [showHistory, setShowHistory] = useState(false);

  const { mutateAsync: claimRewards, isPending } = useMutation(
    createClaimRewardsMutationOptions({ leather })
  );

  // Claims are per-cycle transactions; claim the oldest unclaimed cycle first.
  const oldestUnclaimed = claimable.byCycle[0];

  async function handleClaimClick() {
    if (!oldestUnclaimed || !stacksAccount) return;
    return claimRewards({
      providerId,
      signerManagerContractId,
      stakerAddress: stacksAccount.address,
      rewardCycle: oldestUnclaimed.cycle,
    });
  }

  return (
    <Stack
      gap="space.03"
      p="space.05"
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius="sm"
      data-testid="claimable-rewards-card"
    >
      <HStack justifyContent="space-between" alignItems="center">
        <Stack gap="space.01">
          <styled.span textStyle="label.03" color="ink.text-subdued">
            Claimable rewards
          </styled.span>
          <styled.span textStyle="heading.05">
            {claimable.isLoading ? '—' : formatSbtc(claimable.totalEarned)}
          </styled.span>
        </Stack>
        <Button
          size="md"
          onClick={handleClaimClick}
          disabled={isPending || claimable.isLoading || !oldestUnclaimed}
          data-testid="claim-rewards-button"
        >
          Claim rewards
        </Button>
      </HStack>

      {claimable.byCycle.length > 0 && (
        <Box>
          <Button variant="ghost" size="sm" type="button" onClick={() => setShowHistory(v => !v)}>
            {showHistory ? 'Hide history' : 'Show history'}
          </Button>
          {showHistory && (
            <Stack gap="space.01" pt="space.02">
              {claimable.byCycle.map(rewards => (
                <HStack key={rewards.cycle} justifyContent="space-between">
                  <styled.span textStyle="caption.01" color="ink.text-subdued">
                    Cycle {rewards.cycle}
                  </styled.span>
                  <styled.span textStyle="caption.01">{formatSbtc(rewards.earned)}</styled.span>
                </HStack>
              ))}
            </Stack>
          )}
        </Box>
      )}
    </Stack>
  );
}
