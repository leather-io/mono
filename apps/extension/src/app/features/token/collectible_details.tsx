import { useMemo } from 'react';

import { Box, Stack, styled } from 'leather-styles/jsx';

import { filterActivityBySerializedAssetId } from '@leather.io/features';
import { type AccountAddresses, CryptoAssetProtocols } from '@leather.io/models';
import { Callout, Spinner } from '@leather.io/ui';
import { type SerializedCryptoAssetId } from '@leather.io/utils';

import { useActivity } from '@app/query/activity/activity.query';
import { useAccountCollectibles } from '@app/query/collectibles/account-collectibles.query';

import { CollectibleTypeIconOverlay } from '../collectibles/components/collectible-type-icon-overlay.web';
import { InscriptionCard } from '../collectibles/components/inscription-card';
import { Sip9Card } from '../collectibles/components/sip9-card';
import { StampCard } from '../collectibles/components/stamp-card';
import { TokenActivitySection } from './token_activity.layout';

interface CollectibleDetailsProps {
  account: AccountAddresses;
  assetId: SerializedCryptoAssetId;
  protocol: (typeof CryptoAssetProtocols)['sip9' | 'inscription' | 'stamp'];
}

export function CollectibleDetails({ account, assetId, protocol }: CollectibleDetailsProps) {
  const { data: collectibles = [], isLoading, isError } = useAccountCollectibles(account);
  const activityQuery = useActivity(account);
  const allActivity = activityQuery.data ?? [];

  const relatedActivity = useMemo(
    () => filterActivityBySerializedAssetId(allActivity, assetId),
    [allActivity, assetId]
  );

  if (isLoading) {
    return (
      <Box px="space.05" py="space.05" display="flex" justifyContent="center">
        <Spinner />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box px="space.05" py="space.05">
        <Callout variant="warning" title="Unable to load collectible details">
          Try again in a few moments.
        </Callout>
      </Box>
    );
  }

  const view = collectibles.find(item => item.key === assetId);

  if (!view) {
    return (
      <Box px="space.05" py="space.05">
        <Callout variant="info" title="Collectible not found">
          This collectible is not available for this account.
        </Callout>
      </Box>
    );
  }

  const height = 260;

  let media: React.ReactNode = null;

  if (protocol === CryptoAssetProtocols.stamp) {
    media = <StampCard item={view.asset as any} height={height} />;
  } else if (protocol === CryptoAssetProtocols.sip9) {
    media = <Sip9Card item={view.asset as any} height={height} />;
  } else {
    media = <InscriptionCard item={view.asset as any} height={height} />;
  }

  return (
    <Stack px="space.05" py="space.05" gap="space.05">
      <CollectibleTypeIconOverlay protocol={view.protocol}>{media}</CollectibleTypeIconOverlay>
      <Stack border="default" borderRadius="md" p="space.04" gap="space.02">
        <styled.h2 textStyle="label.02" margin="0">
          Collectible details
        </styled.h2>
        <styled.div display="flex" justifyContent="space-between">
          <styled.span textStyle="caption.02" color="ink.text-subdued">
            Name
          </styled.span>
          <styled.span textStyle="caption.02">{view.title}</styled.span>
        </styled.div>
        <styled.div display="flex" justifyContent="space-between">
          <styled.span textStyle="caption.02" color="ink.text-subdued">
            Collection
          </styled.span>
          <styled.span textStyle="caption.02">{view.subtitle}</styled.span>
        </styled.div>
        <styled.div display="flex" justifyContent="space-between">
          <styled.span textStyle="caption.02" color="ink.text-subdued">
            Protocol
          </styled.span>
          <styled.span textStyle="caption.02">{view.protocol}</styled.span>
        </styled.div>
      </Stack>
      <TokenActivitySection heading="Recent activity" activity={relatedActivity} />
    </Stack>
  );
}
