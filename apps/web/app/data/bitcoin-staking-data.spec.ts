import { NetworkMode } from '~/features/stacking/utils/stacking-network-types';

import {
  bitcoinStakingPoolList,
  getPoolBySignerManager,
  getPrimarySignerManagerContract,
  getSignerManagerContracts,
  isPoolAvailableOnNetwork,
} from './bitcoin-staking-data';

const declaredContracts = bitcoinStakingPoolList.flatMap(pool =>
  Object.entries(pool.signerManagerContracts).flatMap(([networkMode, contractIds]) =>
    (contractIds ?? []).map((contractId, index) => ({
      providerId: pool.providerId,
      networkMode: networkMode as NetworkMode,
      contractId,
      isPrimary: index === 0,
    }))
  )
);

describe('bitcoin staking pool registry', () => {
  test('every pool declares a unique set of signer-manager contracts', () => {
    const allContractIds = bitcoinStakingPoolList.flatMap(pool =>
      Object.values(pool.signerManagerContracts).flat()
    );
    expect(allContractIds).toEqual([...new Set(allContractIds)]);
  });

  test.each(declaredContracts)(
    'resolves $contractId to the $providerId pool',
    ({ providerId, contractId }) => {
      expect(getPoolBySignerManager(contractId)?.providerId).toEqual(providerId);
    }
  );

  test.each(declaredContracts.filter(entry => entry.isPrimary))(
    'uses $contractId as the primary contract for $providerId on $networkMode',
    ({ providerId, networkMode, contractId }) => {
      expect(getPrimarySignerManagerContract(providerId, networkMode)).toEqual(contractId);
    }
  );
});

describe(getSignerManagerContracts.name, () => {
  test('returns an empty list for a pool with no contract on the network', () => {
    expect(getSignerManagerContracts('planbetter', 'mainnet')).toEqual([]);
  });
});

describe(getPrimarySignerManagerContract.name, () => {
  test('is undefined for a pool with no contract on the network', () => {
    expect(getPrimarySignerManagerContract('planbetter', 'mainnet')).toBeUndefined();
  });
});

describe(getPoolBySignerManager.name, () => {
  test('is undefined for an unlisted contract', () => {
    expect(
      getPoolBySignerManager('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.unlisted-signer-manager')
    ).toBeUndefined();
  });
});

describe(isPoolAvailableOnNetwork.name, () => {
  test('is false when no contract is declared for the network', () => {
    expect(
      isPoolAvailableOnNetwork(
        { ...bitcoinStakingPoolList[0], signerManagerContracts: {} },
        'mainnet'
      )
    ).toBe(false);
  });

  test('is false when the network entry is an empty list', () => {
    expect(
      isPoolAvailableOnNetwork(
        { ...bitcoinStakingPoolList[0], signerManagerContracts: { mainnet: [] } },
        'mainnet'
      )
    ).toBe(false);
  });

  test('is true when the network entry has at least one contract', () => {
    expect(
      isPoolAvailableOnNetwork(
        {
          ...bitcoinStakingPoolList[0],
          signerManagerContracts: {
            mainnet: ['SP000000000000000000002Q6VF78.pool-signer-manager'],
          },
        },
        'mainnet'
      )
    ).toBe(true);
  });
});
