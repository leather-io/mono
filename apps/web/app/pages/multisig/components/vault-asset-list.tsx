import { Box } from 'leather-styles/jsx';
import type { VaultAssetItem } from '~/features/multisig/assets/vault-asset-items';

import { ListContainer } from '@leather.io/ui';

import { VaultAssetRow } from './vault-asset-row';

interface VaultAssetListProps {
  items: VaultAssetItem[];
}

export function VaultAssetList({ items }: VaultAssetListProps) {
  return (
    <ListContainer p="space.00" overflow="hidden">
      <Box
        display="flex"
        flexDirection="column"
        css={{
          '& > * + *': {
            borderTopWidth: '1px',
            borderTopStyle: 'solid',
            borderColor: 'ink.border-default',
          },
        }}
      >
        {items.map(item => (
          <VaultAssetRow key={item.id} item={item} />
        ))}
      </Box>
    </ListContainer>
  );
}
