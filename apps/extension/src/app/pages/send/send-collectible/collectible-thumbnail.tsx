import { Box } from 'leather-styles/jsx';

import type { CollectibleView } from '@leather.io/features';

import { Sip9Card } from '@app/features/collectibles/components/sip9-card';

interface CollectibleThumbnailProps {
  view: CollectibleView;
  size: string;
}
export function CollectibleThumbnail({ view, size }: CollectibleThumbnailProps) {
  return (
    <Box width={size} height={size} borderRadius="xs" overflow="hidden" flexShrink={0}>
      <Sip9Card item={view.asset} kind={view.kind} />
    </Box>
  );
}
