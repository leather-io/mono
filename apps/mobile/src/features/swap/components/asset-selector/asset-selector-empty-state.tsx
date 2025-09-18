import { t } from '@lingui/core/macro';
import { Image } from 'expo-image';

import { Box, Button, Text } from '@leather.io/ui/native';

interface AssetSelectorEmptyStateProps {
  isPerformingSearch: boolean;
  onClearSearch: () => void;
}

export function AssetSelectorEmptyState({
  isPerformingSearch,
  onClearSearch,
}: AssetSelectorEmptyStateProps) {
  return (
    <Box p="5" height="55%" alignItems="center" justifyContent="center" gap="3">
      {isPerformingSearch ? (
        <>
          <Text variant="label01">{t`No assets found`}</Text>
          <Button size="sm" variant="outline" onPress={onClearSearch}>{t`Clear search`}</Button>
        </>
      ) : (
        <>
          <Image
            style={{ height: 180, width: 180 }}
            source={require('@/assets/stickers/wallet.png')}
          />
          <Box alignItems="center" gap="2">
            <Text variant="label01">{t`No assets`}</Text>
            <Text textAlign="center" fontSize={15}>
              {t`Add funds to your wallet to start\nswapping between currencies.`}
            </Text>
          </Box>
        </>
      )}
    </Box>
  );
}
