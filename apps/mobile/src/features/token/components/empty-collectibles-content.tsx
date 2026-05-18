import { Box } from '@leather.io/ui/native';

import { DiscoverMarketplacesSection } from './discover-marketplaces-section';
import { GetFirstNftSection } from './get-first-nft-section';

export function EmptyCollectiblesContent() {
  return (
    <Box gap="5" py="3">
      <GetFirstNftSection />
      <DiscoverMarketplacesSection />
    </Box>
  );
}
