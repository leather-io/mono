import { useMemo } from 'react';

import { StacksNetworkName } from '@stacks/network';
import { Cl, fetchCallReadOnlyFunction, serializeCV } from '@stacks/transactions';
import { useQuery } from '@tanstack/react-query';
import { leather } from '~/helpers/leather-sdk';
import { useLeatherConnect } from '~/store/addresses';

interface EnrollContractIdentifier {
  contractAddress: string;
  contractName: string;
  contract: string;
}
const sbtcEnrollContractMap = {
  testnet: {
    contractAddress: 'ST1SY0NMZMBSA28MH31T09KCQWPZ4H5HRMYRX4XW7',
    contractName: 'yield-rewards-testnet',
    contract: 'ST1SY0NMZMBSA28MH31T09KCQWPZ4H5HRMYRX4XW7.yield-rewards-testnet',
  },
  devnet: {
    contractAddress: 'STB44HYPYAT2BB2QE513NSP81HTMYWBJP02HPGK6',
    contractName: 'yield',
    contract: 'STB44HYPYAT2BB2QE513NSP81HTMYWBJP02HPGK6.yield',
  },
  mainnet: {
    contractAddress: 'SP804CDG3KBN9M6E00AD744K8DC697G7HBCG520Q',
    contractName: 'sbtc-yield-rewards-v3',
    contract: 'SP804CDG3KBN9M6E00AD744K8DC697G7HBCG520Q.sbtc-yield-rewards-v3',
  },
  mocknet: {} as EnrollContractIdentifier,
} as const satisfies Record<StacksNetworkName, EnrollContractIdentifier>;

function getEnrollContractCallByNetwork(network: StacksNetworkName) {
  return sbtcEnrollContractMap[network];
}

async function fetchIsAddressEnrolled(
  address: string,
  contract: EnrollContractIdentifier,
  network: StacksNetworkName
) {
  const resp = await fetchCallReadOnlyFunction({
    ...contract,
    functionName: 'is-enrolled-in-next-cycle',
    functionArgs: [Cl.principal(address)],
    senderAddress: contract.contractAddress,
    network,
  });
  return { isEnrolled: resp.type === 'true', ...resp };
}

// To do add network support
const network = { networkName: 'mainnet' } as const;

export function useEnrolledStatus() {
  const { stacksAccount } = useLeatherConnect();

  const query = useQuery({
    queryFn: () =>
      fetchIsAddressEnrolled(
        stacksAccount?.address ?? '',
        getEnrollContractCallByNetwork(network.networkName),
        network.networkName
      ),
    queryKey: ['is-enrolled', stacksAccount?.address, network.networkName],
  });

  return query;
}

export function useSbtcEnroll() {
  const { stacksAccount } = useLeatherConnect();

  return useMemo(
    () => ({
      async createSbtcYieldEnrollContractCall() {
        // if (network.networkName === 'mocknet') throw new Error('Mocknet not supported');

        if (!stacksAccount) throw new Error('No address');

        const contractDetails = getEnrollContractCallByNetwork(network.networkName);

        try {
          const result = await leather.stxCallContract({
            contract: contractDetails.contract,
            functionName: 'enroll',
            functionArgs: [serializeCV(Cl.some(Cl.principal(stacksAccount.address)))],
            network: network.networkName,
          });
          // eslint-disable-next-line no-console
          console.log(result);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log('Error creating sbtc yield enroll contract call', e);
        }
      },
    }),
    [stacksAccount]
  );
}
