import { Navigate } from 'react-router';

import { Flex } from 'leather-styles/jsx';
import { stakingProviderIdToSlug } from '~/data/bitcoin-staking-data';
import { byosmPaths, stakingPaths } from '~/pages/bitcoin-staking/bitcoin-staking.constants';

import { LoadingSpinner } from '@leather.io/ui';

import { usePox5Position } from '../hooks/use-pox5-position';
import { StartStaking } from '../start-staking/start-staking';
import { ByosmContractEntry } from './byosm-contract-entry';
import { useByosmSignerManager } from './use-byosm-signer-manager';

export function ByosmStaking() {
  const state = useByosmSignerManager();
  const { isLoading, position } = usePox5Position();

  if (position.status === 'active') {
    if (position.pool) {
      return (
        <Navigate
          to={stakingPaths.active(stakingProviderIdToSlug(position.pool.providerId))}
          replace
        />
      );
    }
    return <Navigate to={byosmPaths.active(position.info.signerManagerContractId)} replace />;
  }

  if (state.status === 'listed') {
    return (
      <Navigate to={stakingPaths.pool(stakingProviderIdToSlug(state.pool.providerId))} replace />
    );
  }

  if (state.status === 'valid') {
    if (isLoading) {
      return (
        <Flex height="100vh" width="100%">
          <LoadingSpinner />
        </Flex>
      );
    }
    return <StartStaking poolSlug="byosm" signerManagerContractId={state.contractId} />;
  }

  return <ByosmContractEntry state={state} />;
}
