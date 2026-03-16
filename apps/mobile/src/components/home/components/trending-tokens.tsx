import { useMemo } from 'react';
import { ScrollView } from 'react-native-gesture-handler';

import { useGlobalSheets } from '@/core/global-sheet-provider';
import { useTrendingTokensQuery } from '@/queries/asset-list/trending-tokens.query';
import { t } from '@lingui/core/macro';

import { prepTrendingItems } from '@leather.io/features';
import { Box, InfoCircleIcon, Pressable, Text, useTheme } from '@leather.io/ui/native';

import { TrendingTokenCard } from './trending-token-card';

export function TrendingTokens() {
  const theme = useTheme();
  const { descriptionSheetRef } = useGlobalSheets();
  const { data: trendingTokenData } = useTrendingTokensQuery();

  const rows = useMemo(
    () => (trendingTokenData ? prepTrendingItems(trendingTokenData.items) : []),
    [trendingTokenData]
  );

  if (rows.length === 0) return null;

  return (
    <Box py="3">
      <Pressable
        onPress={() => {
          descriptionSheetRef.current?.present({
            title: t`Trending tokens`,
            data: [
              {
                key: 'paragraph',
                text: t`Tokens trending across the Stacks ecosystem, ranked by recent trading activity.`,
              },
            ],
          });
        }}
        flexDirection="row"
        alignItems="center"
        gap="2"
        px="5"
        pb="3"
      >
        <Text variant="label01">{t`Trending tokens`}</Text>
        <InfoCircleIcon variant="small" color="ink.text-subdued-primary" />
      </Pressable>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing['5'],
          gap: theme.spacing['2'],
        }}
      >
        <Box gap="2">
          {rows.map((row, rowIndex) => (
            <Box key={rowIndex} flexDirection="row" gap="2">
              {row.map(item => (
                <TrendingTokenCard key={item.id} item={item} />
              ))}
            </Box>
          ))}
        </Box>
      </ScrollView>
    </Box>
  );
}
