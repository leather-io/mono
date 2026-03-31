import {
  getChainDisplayLabel,
  getInscriptionInfo,
  getProtocolDisplayLabel,
} from '@leather.io/features';
import type { BitcoinNetwork, InscriptionAsset } from '@leather.io/models';

import { Row, SectionCard } from './collectible-details.layout';

interface InscriptionDetailsProps {
  asset: InscriptionAsset;
  bitcoinNetwork: BitcoinNetwork;
}

export function InscriptionDetails({ asset, bitcoinNetwork }: InscriptionDetailsProps) {
  const info = getInscriptionInfo(asset, bitcoinNetwork);
  const hasOutputValue = info.outputValue && Number(info.outputValue) > 0;

  return (
    <SectionCard title="Details">
      <Row label="Layer" value={getChainDisplayLabel(asset.chain)} />
      <Row label="Protocol" value={getProtocolDisplayLabel(asset.protocol)} />
      {hasOutputValue && (
        <Row label="Sats in UTXO" value={Number(info.outputValue).toLocaleString()} />
      )}
    </SectionCard>
  );
}
