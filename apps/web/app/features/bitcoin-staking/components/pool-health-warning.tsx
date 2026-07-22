import { HStack, Stack, styled } from 'leather-styles/jsx';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';
import { POX5_SIGNER_SET_MIN_USTX } from '~/pages/bitcoin-staking/bitcoin-staking.constants';

import { ErrorCircleIcon, Flag } from '@leather.io/ui';

interface PoolHealthWarningProps {
  // No signer-manager read-only for pool totals has been confirmed yet, so
  // callers pass null until a data source exists and the banner stays hidden.
  totalStakedMicroStx: bigint | null;
}

export function PoolHealthWarning({ totalStakedMicroStx }: PoolHealthWarningProps) {
  if (totalStakedMicroStx === null) return null;
  if (totalStakedMicroStx >= BigInt(POX5_SIGNER_SET_MIN_USTX)) return null;

  return (
    <HStack
      p="space.04"
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius="sm"
      data-testid="pool-health-warning"
    >
      <Flag img={<ErrorCircleIcon />} align="top">
        <Stack gap="space.01">
          <styled.p textStyle="caption.01" color="ink.text-subdued">
            {bitcoinStakingContent.poolHealthWarning}
          </styled.p>
        </Stack>
      </Flag>
    </HStack>
  );
}
