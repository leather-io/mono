import { Box } from 'leather-styles/jsx';
import { EM_DASH } from '~/constants/constants';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';
import { BitcoinStakingPool, getPrimarySignerManagerContract } from '~/data/bitcoin-staking-data';
import { pox5NetworkConfig } from '~/data/pox5-network-config';

import { usePox5PoolFeeQuery } from '../queries/pox5-stacking.query';
import { formatFeeBips, getExpectedFeeBips, poolFeeFromBips } from '../utils/pool-fee';

interface PoolFeeValueProps {
  pool: BitcoinStakingPool;
  signerManagerContractId?: string;
}

export function PoolFeeValue({
  pool,
  signerManagerContractId: signerManagerContractIdOverride,
}: PoolFeeValueProps) {
  const hasFixedFee = typeof pool.fixedFeeBips === 'number';
  const signerManagerContractId = hasFixedFee
    ? undefined
    : (signerManagerContractIdOverride ??
      getPrimarySignerManagerContract(pool.providerId, pox5NetworkConfig.contractNetworkMode));
  const { data: fetchedFee } = usePox5PoolFeeQuery(signerManagerContractId);

  const fee =
    typeof pool.fixedFeeBips === 'number' ? poolFeeFromBips(pool.fixedFeeBips) : fetchedFee;
  if (!fee) return <>{EM_DASH}</>;

  return (
    <>
      {formatFeeBips(getExpectedFeeBips(fee))}
      {fee.pendingFeeBips !== null && fee.pendingActivationCycle !== null && (
        <Box textStyle="label.03" color="ink.text-subdued">
          {bitcoinStakingContent.poolFeeChange.fromCycle(fee.pendingActivationCycle)}
        </Box>
      )}
    </>
  );
}
