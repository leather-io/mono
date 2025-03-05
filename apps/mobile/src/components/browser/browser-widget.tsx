import { useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';

import { useTotalBalance } from '@/queries/balance/total-balance.query';
import { AppRoutes } from '@/routes';
import { useWallets } from '@/store/wallets/wallets.read';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { useRouter } from 'expo-router';

import { Box, SheetRef, Theme } from '@leather.io/ui/native';

import { Widget } from '../widgets/components/widget';
import { BrowserCard } from './browser-card';

export function BrowserWidget() {
  const accountSelectorSheetRef = useRef<SheetRef>(null);
  const wallets = useWallets();
  const theme = useTheme<Theme>();

  const router = useRouter();
  const { totalBalance } = useTotalBalance();
  // TODO LEA-1726: handle balance loading & error states
  if (totalBalance.state !== 'success') return;

  return (
    <Widget>
      <Box>
        <Widget.Header
          onPress={
            wallets.hasWallets ? () => accountSelectorSheetRef.current?.present() : undefined
          }
        >
          <Widget.Title title={t({ id: 'widget.browser.header_title', message: 'Apps we love' })} />
        </Widget.Header>
      </Box>
      <Widget.Body>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: theme.spacing['2'],
            paddingHorizontal: theme.spacing['5'],
          }}
          style={{
            // prevent card shadows being cut off
            overflow: 'visible',
          }}
        >
          <BrowserCard
            onPress={() => {
              router.navigate(AppRoutes.Browser);
            }}
            title={t({
              id: 'browser.widget.zest.title',
              message: `borrow and more`,
            })}
            dAppName={t({
              id: 'browser.widget.zest.dapp-name',
              message: `zest protocol`,
            })}
          />
        </ScrollView>
      </Widget.Body>
    </Widget>
  );
}
