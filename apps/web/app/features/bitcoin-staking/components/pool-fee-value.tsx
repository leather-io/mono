import { EM_DASH } from '~/constants/constants';
import { BitcoinStakingPool, getPrimarySignerManagerContract } from '~/data/bitcoin-staking-data';
import { pox5NetworkConfig } from '~/data/pox5-network-config';

import { usePox5PoolFeeQuery } from '../queries/pox5-stacking.query';
import { formatFeeBips } from '../utils/pool-fee';

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
  const { data: fetchedFeeBips } = usePox5PoolFeeQuery(signerManagerContractId);

  const feeBips = pool.fixedFeeBips ?? fetchedFeeBips;
  return <>{typeof feeBips === 'number' ? formatFeeBips(feeBips) : EM_DASH}</>;
}
