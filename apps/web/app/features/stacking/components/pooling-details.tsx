import { Stack, styled } from 'leather-styles/jsx';
import { CopyAddress, ExternalAddress } from '~/features/stacking/components/address';
import { useStacksNetwork } from '~/store/stacks-network';
import { makeExplorerTxLink } from '~/utils/external-links';

export interface PoolingDetailsProps {
  poolAddress: string | undefined;
  contractAddress: string | undefined;
}

export function PoolingDetails({ poolAddress, contractAddress }: PoolingDetailsProps) {
  const { networkInstance } = useStacksNetwork();
  return (
    <Stack>
      <Stack direction="row" justifyContent="space-between">
        <styled.p textStyle="label.03" color="ink.text-subdued">
          Pool address
        </styled.p>
        {poolAddress ? <CopyAddress address={poolAddress} /> : '—'}
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <styled.p textStyle="label.03" color="ink.text-subdued">
          Contract address
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
