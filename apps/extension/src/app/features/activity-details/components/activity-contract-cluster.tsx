import { Stack, styled } from 'leather-styles/jsx';

import { CopyAddress } from '@app/components/value-actions';

interface ActivityContractClusterProps {
  contractId: string;
}

export function ActivityContractCluster({ contractId }: ActivityContractClusterProps) {
  const [address, contractName] = contractId.split('.');
  return (
    <Stack gap="space.03" bg="ink.background-primary" px="space.05" py="space.04">
      <styled.span textStyle="label.02">Contract</styled.span>
      <Stack gap="space.01" alignItems="start">
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          Address
        </styled.span>
        <CopyAddress address={address} />
      </Stack>
      {contractName ? (
        <Stack gap="space.01" alignItems="start">
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            Contract name
          </styled.span>
          <styled.span textStyle="label.02">{contractName}</styled.span>
        </Stack>
      ) : null}
    </Stack>
  );
}
