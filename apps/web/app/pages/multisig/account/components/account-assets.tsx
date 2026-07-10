import { Box, Flex, styled } from 'leather-styles/jsx';
import type { VaultAccountAssets } from '~/features/multisig/assets/use-vault-account-assets';

import { VaultAssetList } from '../../components/vault-asset-list';

interface AccountAssetsProps {
  assets: VaultAccountAssets;
}

export function AccountAssets({ assets }: AccountAssetsProps) {
  const { items, isPending } = assets;

  if (isPending) {
    return (
      <Flex direction="column" gap="space.03">
        {[0, 1].map(index => (
          <Box
            key={index}
            height="56px"
            borderRadius="md"
            bg="ink.component-background-default"
            opacity={0.6}
          />
        ))}
      </Flex>
    );
  }

  if (items.length === 0) {
    return (
      <Box
        borderRadius="md"
        borderWidth="1px"
        borderStyle="dashed"
        borderColor="ink.border-default"
        p="space.05"
        textAlign="center"
      >
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          No assets yet.
        </styled.span>
      </Box>
    );
  }

  return <VaultAssetList items={items} />;
}
