import { Flex, Stack } from 'leather-styles/jsx';

import {
  formatSats,
  formatTimestamp,
  getChainDisplayLabel,
  getInscriptionInfo,
  getProtocolDisplayLabel,
} from '@leather.io/features';
import type { BitcoinNetwork, InscriptionAsset } from '@leather.io/models';
import { truncateMiddle } from '@leather.io/utils';

import { Row, SectionCard, StatCard } from './collectible-details.layout';

interface InscriptionDetailsProps {
  asset: InscriptionAsset;
  bitcoinNetwork: BitcoinNetwork;
}

export function InscriptionDetails({ asset, bitcoinNetwork }: InscriptionDetailsProps) {
  const info = getInscriptionInfo(asset, bitcoinNetwork);
  const hasOutputValue = info.outputValue && Number(info.outputValue) > 0;

  return (
    <>
      {hasOutputValue && (
        <Flex gap="space.03">
          <StatCard label="Output value" value={formatSats(info.outputValue!)} />
        </Flex>
      )}

      <SectionCard title="Collectible Info">
        <Stack gap="space.01">
          <Row label="Name" value={info.title} externalLink={info.ordExplorerUrl} />
          <Row label="Layer" value={getChainDisplayLabel(asset.chain)} />
          <Row label="Protocol" value={getProtocolDisplayLabel(asset.protocol)} />
          {info.genesisTimestamp && (
            <Row label="Genesis time" value={formatTimestamp(info.genesisTimestamp)} />
          )}
          {info.genesisBlockHeight && (
            <Row label="Genesis block" value={`#${info.genesisBlockHeight}`} />
          )}
          {asset.txid && (
            <Row
              label="Transaction ID"
              value={truncateMiddle(asset.txid, 8)}
              externalLink={info.txExplorerUrl || undefined}
            />
          )}
          {info.mimeType && <Row label="File type" value={info.mimeType} />}
        </Stack>
      </SectionCard>
    </>
  );
}
