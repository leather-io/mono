import BigNumber from 'bignumber.js';
import { Box } from 'leather-styles/jsx';
import { CopyAddress } from '~/components/copy-address';
import { ValueDisplayer } from '~/components/value-displayer/default-value-displayer';
import { EM_DASH } from '~/constants/constants';
import { bitcoinStakingLabels } from '~/content/bitcoin-staking-content';
import {
  BitcoinStakingPool,
  StakingPoolSlug,
  getSignerManagerContracts,
} from '~/data/bitcoin-staking-data';
import { pox5NetworkConfig } from '~/data/pox5-network-config';
import { StackingInfoGridLayout } from '~/features/stacking/components/stacking-info-grid.layout';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';

import { PoolTvlValue } from '../../components/pool-tvl-value';
import { Pox5StakerInfo } from '../../queries/create-get-pox5-staker-info-query-options';
import { ActiveStakingDetails } from '../hooks/use-active-staking-info';
import { StakingActionButtons } from './staking-action-buttons';

interface StakingPositionGridProps {
  poolSlug: StakingPoolSlug;
  pool: BitcoinStakingPool;
  info: Pox5StakerInfo;
  details: ActiveStakingDetails;
}

export function StakingPositionGrid({ poolSlug, pool, info, details }: StakingPositionGridProps) {
  // Unlisted (byosm) pools have no registry contracts, so the TVL falls back
  // to the signer-manager the position is actually staked through.
  const poolSignerManagerContractIds = getSignerManagerContracts(
    pool.providerId,
    pox5NetworkConfig.contractNetworkMode
  );
  const tvlSignerManagerContractIds = poolSignerManagerContractIds.length
    ? poolSignerManagerContractIds
    : [info.signerManagerContractId];

  return (
    <StackingInfoGridLayout
      cells={{
        actionButtons: (
          <StakingActionButtons
            poolSlug={poolSlug}
            providerId={pool.providerId}
            signerManagerContractId={info.signerManagerContractId}
            actionsDisabled={details.isInPreparePhase}
          />
        ),
        name: (
          <ValueDisplayer
            gap="space.04"
            name="Pool"
            value={
              <Box textStyle="label.03" textDecoration="underline">
                {pool.name}
              </Box>
            }
          />
        ),
        status: (
          <ValueDisplayer
            gap="space.04"
            name="Status"
            value={
              <Box textStyle="label.03" color="green.action-primary-default">
                Active
              </Box>
            }
          />
        ),
        historicalApr: (
          <ValueDisplayer
            gap="space.04"
            name="Amount locked"
            value={toHumanReadableMicroStx(new BigNumber(info.amountMicroStx.toString()))}
          />
        ),
        minimumLockupPeriod: (
          <ValueDisplayer
            gap="space.04"
            name="Locked until"
            value={
              <>
                <Box textStyle="label.01">Cycle {details.endCycle}</Box>
                {details.unlockDate && (
                  <Box textStyle="label.03">~{details.unlockDate.toLocaleDateString()}</Box>
                )}
              </>
            }
          />
        ),
        totalValueLocked: (
          <ValueDisplayer
            gap="space.04"
            name="First reward cycle"
            value={`Cycle ${info.firstRewardCycle}`}
          />
        ),
        daysUntilNextCycle: (
          <ValueDisplayer
            gap="space.04"
            name="Days until next cycle"
            value={
              details.daysUntilNextCycle === null ? (
                EM_DASH
              ) : (
                <>
                  <Box textStyle="label.01">{details.daysUntilNextCycle} days</Box>
                  {details.nextCycleNumber !== null && (
                    <Box textStyle="label.03">Cycle {details.nextCycleNumber}</Box>
                  )}
                </>
              )
            }
          />
        ),
        rewardsToken: <ValueDisplayer gap="space.04" name="Rewards token" value="sBTC" />,
        poolAddress: (
          <ValueDisplayer
            gap="space.04"
            name="Signer manager"
            value={<CopyAddress addr={info.signerManagerContractId} emphasis underlined wide />}
          />
        ),
        rewardAddress: (
          <ValueDisplayer
            gap="space.04"
            name="Rewards payout"
            value={
              details.payoutPreference ? (
                <CopyAddress
                  addr={details.payoutPreference.btcRewardAddress}
                  emphasis
                  underlined
                  wide
                />
              ) : (
                'sBTC on Stacks'
              )
            }
          />
        ),
        tvl: (
          <ValueDisplayer
            gap="space.04"
            name={bitcoinStakingLabels.tvl}
            value={
              <PoolTvlValue
                signerManagerContractIds={tvlSignerManagerContractIds}
                testId="active-pool-tvl"
              />
            }
          />
        ),
      }}
    />
  );
}
