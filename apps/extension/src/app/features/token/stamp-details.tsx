import { Stack } from 'leather-styles/jsx';

import { getChainDisplayLabel, getProtocolDisplayLabel, getStampInfo } from '@leather.io/features';
import type { BitcoinNetwork, StampAsset } from '@leather.io/models';

import { Row, SectionCard } from './collectible-details.layout';

interface StampDetailsProps {
  asset: StampAsset;
  bitcoinNetwork: BitcoinNetwork;
}

export function StampDetails({ asset, bitcoinNetwork }: StampDetailsProps) {
  const info = getStampInfo(asset, bitcoinNetwork);

  return (
    <SectionCard title="Collectible Info">
      <Stack gap="space.01">
        <Row label="Name" value={info.name} externalLink={info.stampExplorerUrl} />
        <Row label="Layer" value={getChainDisplayLabel(asset.chain)} />
        <Row label="Protocol" value={getProtocolDisplayLabel(asset.protocol)} />
        {info.blockHeight && (
          <Row
            label="Last observed block"
            value={`#${info.blockHeight}`}
            externalLink={info.blockExplorerUrl || undefined}
          />
        )}
      </Stack>
    </SectionCard>
  );
}
