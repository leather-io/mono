import { ScrollView } from 'react-native-gesture-handler';

import { ActionButtons } from '@/components/action-buttons';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { useWallets } from '@/store/wallets/wallets.read';

import { Box, useTheme } from '@leather.io/ui/native';

export function AccountActions() {
  const { hasWallets } = useWallets();
  const { sendSheetRef, receiveSheetRef, swapSheetRef, rampSheetRef } = useGlobalSheets();
  const theme = useTheme();

  if (!hasWallets) return null;

  return (
    <Box>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingBottom: theme.spacing['5'] }}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing['3'],
          gap: theme.spacing['2'],
        }}
      >
        <ActionButtons
          fullWidth
          onSend={() => sendSheetRef.current?.present()}
          onReceive={() => receiveSheetRef.current?.present('all')}
          onSwap={() => swapSheetRef.current?.present()}
          onBuy={() => rampSheetRef.current?.present('buy')}
          onSell={() => rampSheetRef.current?.present('sell')}
          size="lg"
        />
      </ScrollView>
    </Box>
  );
}
