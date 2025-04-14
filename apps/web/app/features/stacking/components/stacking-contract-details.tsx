import { Stack, styled } from 'leather-styles/jsx';
import { CopyAddress, ExternalAddress } from '~/features/stacking/components/address';
import { useStacksNetwork } from '~/store/stacks-network';
import { makeExplorerTxLink } from '~/utils/external-links';

export interface PoolingDetailsProps {
  addressTitle: string;
  address: string | undefined;
  contractAddress: string | undefined;
}

export function StackingContractDetails({
  addressTitle,
  address,
  contractAddress,
}: PoolingDetailsProps) {
  const { networkInstance } = useStacksNetwork();
  return (
    <Stack pt="space.03">
      <Stack direction="row" justifyContent="space-between" gap="space.02">
        <styled.p textStyle="label.03" color="ink.text-subdued" whiteSpace="nowrap">
          {addressTitle}
        </styled.p>
        {address ? <CopyAddress address={address} /> : '—'}
      </Stack>
      <Stack direction="row" justifyContent="space-between" gap="space.02">
        <styled.p textStyle="label.03" color="ink.text-subdued">
          Contract
        </styled.p>
        {contractAddress ? (
          <ExternalAddress
            address={contractAddress}
            href={makeExplorerTxLink(contractAddress, networkInstance)}
          />
        ) : (
          '—'
        )}
      </Stack>
    </Stack>
  );
}
