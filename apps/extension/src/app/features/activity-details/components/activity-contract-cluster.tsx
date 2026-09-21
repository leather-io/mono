import { Stack, styled } from 'leather-styles/jsx';

interface ActivityContractClusterProps {
  contractId: string;
}

export function ActivityContractCluster({ contractId }: ActivityContractClusterProps) {
  const [address, contractName] = contractId.split('.');
  return (
    <Stack gap="space.03" bg="ink.background-primary" px="space.05" py="space.04">
      <styled.span textStyle="label.02">Contract</styled.span>
      <Stack gap="space.01">
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          Address
        </styled.span>
        <styled.span textStyle="address" wordBreak="break-all">
          {address}
        </styled.span>
      </Stack>
      {contractName ? (
        <Stack gap="space.01">
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            Contract name
          </styled.span>
          <styled.span textStyle="label.02">{contractName}</styled.span>
        </Stack>
      ) : null}
    </Stack>
  );
}
