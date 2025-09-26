import { ActionButtons } from '@/components/action-buttons';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { useWallets } from '@/store/wallets/wallets.read';

import { Box } from '@leather.io/ui/native';

export function AccountActions() {
  const { hasWallets } = useWallets();
  const { sendSheetRef, receiveSheetRef, swapSheetRef } = useGlobalSheets();

  if (!hasWallets) return null;

  return (
    <Box px="5" pb="5" flexDirection="row" gap="2">
      <ActionButtons
        fullWidth
        onSend={() => sendSheetRef.current?.present()}
        onReceive={() => receiveSheetRef.current?.present('all')}
        onSwap={() => swapSheetRef.current?.present()}
        size="lg"
      />
    </Box>
  );
}
