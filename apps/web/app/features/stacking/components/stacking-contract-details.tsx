import { styled } from 'leather-styles/jsx';
import { CopyAddress, ExternalAddress } from '~/components/copy-address';
import { useStacksNetwork } from '~/store/stacks-network';
import { makeExplorerTxLink } from '~/utils/external-links';

interface PoolingDetailsProps {
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
    <styled.div
      display="grid"
      gridTemplateColumns="auto minmax(0, 1fr)"
      columnGap="space.04"
      rowGap="space.02"
      alignItems="center"
      justifyItems="start"
      pt="space.03"
    >
      <styled.p textStyle="label.03" color="ink.text-subdued" whiteSpace="nowrap">
        {addressTitle}
      </styled.p>
      {address ? (
        <CopyAddress addr={address} emphasis wide compact underlined />
      ) : (
        <styled.span>—</styled.span>
      )}

      <styled.p textStyle="label.03" color="ink.text-subdued" whiteSpace="nowrap">
        Contract
      </styled.p>
      {contractAddress ? (
        <ExternalAddress
          addr={contractAddress}
          href={makeExplorerTxLink(contractAddress, networkInstance)}
          emphasis
          wide
          compact
          underlined
        />
      ) : (
        <styled.span>—</styled.span>
      )}
    </styled.div>
  );
}
