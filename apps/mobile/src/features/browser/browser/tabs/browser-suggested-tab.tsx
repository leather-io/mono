import { t } from '@lingui/macro';
import { Image } from 'expo-image';

import { Box, Text } from '@leather.io/ui/native';

import { DappCard } from '../dapp-card';
import { BrowserTabSheetLayout } from './browser-tab-sheet.layout';

interface SuggestedProps {
  goToUrl(url: string): void;
}

export function BrowserSuggestedTab({ goToUrl }: SuggestedProps) {
  return (
    <BrowserTabSheetLayout>
      <Text variant="heading04" py="3">
        {t({
          id: 'browser-sheet.suggested.title',
          message: 'Earn Bitcoin yield',
        })}
      </Text>
      <Text variant="label01" py="3">
        {t({
          id: 'browser-sheet.suggested.caption',
          message: 'With Leather',
        })}
      </Text>
      <Box gap="3">
        <DappCard
          onPress={() => goToUrl('https://leather.io')}
          title={t({
            id: 'browser-sheet.sbtc.title',
            message: 'sBTC rewards',
          })}
          caption={t({
            id: 'browser-sheet.sbtc.caption',
            message: 'Deposit Bitcoin, convert to sBTC and earn rewards simply by holding it.',
          })}
          image={
            <Image
              style={{ height: 32, aspectRatio: 2.375 }}
              contentFit="contain"
              source={require('@/assets/sbtc-rewards.png')}
            />
          }
        />
        <DappCard
          onPress={() => goToUrl('leather.io')}
          title={t({
            id: 'browser-sheet.pooled-stacking.title',
            message: 'Pooled Stacking',
          })}
          caption={t({
            id: 'browser-sheet.pooled-stacking.caption',
            message: 'Lock STX and earn rewards every 15 days.',
          })}
          image={
            <Image
              style={{ height: 32, aspectRatio: 1.5625 }}
              contentFit="contain"
              source={require('@/assets/pooled-stacking.png')}
            />
          }
        />
        <DappCard
          onPress={() => goToUrl('leather.io')}
          title={t({
            id: 'browser-sheet.liquid-stacking.title',
            message: 'Liquid Stacking',
          })}
          caption={t({
            id: 'browser-sheet.liquid-stacking.caption',
            message: 'Wrap STX, earn rewards, and stay liquid in the Stacks ecosystem.',
          })}
          image={
            <Image
              style={{ height: 32, aspectRatio: 4.25 }}
              contentFit="contain"
              source={require('@/assets/liquid-stacking.png')}
            />
          }
        />
      </Box>
    </BrowserTabSheetLayout>
  );
}
