import { NetworkMode } from '~/features/stacking/utils/stacking-network-types';

import {
  bitcoinStakingPoolList,
  getPoolBySignerManager,
  getPrimarySignerManagerContract,
  getSignerManagerContracts,
  getStackingDaoWrapperContract,
  getStakingPoolFromSlug,
  isPoolAvailableOnNetwork,
  isStackingDaoSignerManager,
  isStackingDaoWrapperContract,
  stakingProviderIdToSlug,
} from './bitcoin-staking-data';

const stackingDaoSignerManagerContractId =
  'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.native-pool-signer-manager';
const stackingDaoWrapperContractId = 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.native-pool-v1';

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

describe('byosm pool entry', () => {
  test('round-trips between slug and providerId', () => {
    expect(getStakingPoolFromSlug('byosm').providerId).toEqual('byosm');
    expect(stakingProviderIdToSlug('byosm')).toEqual('byosm');
  });

  test('declares no signer-manager contracts on any network', () => {
    expect(isPoolAvailableOnNetwork(getStakingPoolFromSlug('byosm'), 'mainnet')).toBe(false);
    expect(isPoolAvailableOnNetwork(getStakingPoolFromSlug('byosm'), 'testnet')).toBe(false);
    expect(isPoolAvailableOnNetwork(getStakingPoolFromSlug('byosm'), 'devnet')).toBe(false);
  });
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

describe(getStackingDaoWrapperContract.name, () => {
  test('maps the Stacking DAO signer-manager to their native-pool wrapper', () => {
    expect(getStackingDaoWrapperContract(stackingDaoSignerManagerContractId)).toEqual(
      stackingDaoWrapperContractId
    );
  });

  test('is undefined for any other signer-manager', () => {
    expect(
      getStackingDaoWrapperContract(
        'SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP.fastpool-1-signer-manager'
      )
    ).toBeUndefined();
  });
});

describe(isStackingDaoSignerManager.name, () => {
  test('recognises only the Stacking DAO signer-manager', () => {
    expect(isStackingDaoSignerManager(stackingDaoSignerManagerContractId)).toBe(true);
    expect(isStackingDaoSignerManager(stackingDaoWrapperContractId)).toBe(false);
  });
});

describe(isStackingDaoWrapperContract.name, () => {
  test('recognises only the Stacking DAO wrapper contract', () => {
    expect(isStackingDaoWrapperContract(stackingDaoWrapperContractId)).toBe(true);
    expect(isStackingDaoWrapperContract(stackingDaoSignerManagerContractId)).toBe(false);
  });
});
