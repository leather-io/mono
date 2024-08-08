import Chevron from '@/assets/chevron-right.svg';
import { WalletStore } from '@/state/wallets/wallets.slice';
import { useTheme } from '@shopify/restyle';

import { Box, Text, Theme, TouchableOpacity } from '@leather.io/ui/native';

import { TransText } from '../trans-text';

export function AccountCard({
  onPress,
  fingerprint,
  type,
}: {
  onPress(): void;
  fingerprint: string;
  type: WalletStore['type'];
}) {
  const theme = useTheme<Theme>();
  const isLedger = type === 'ledger';
  return (
    <TouchableOpacity
      onPress={onPress}
      width={200}
      height={180}
      p="5"
      borderRadius="sm"
      borderColor="ink.border-transparent"
      borderWidth={1}
      alignItems="flex-start"
      justifyContent="space-between"
    >
      {isLedger && (
        <Box
          position="absolute"
          p="1"
          borderColor="ink.border-transparent"
          borderRadius="xs"
          borderWidth={1}
          right={theme.spacing[5]}
          top={theme.spacing[5]}
        >
          <TransText variant="label03" color="ink.text-subdued">
            Ledger
          </TransText>
        </Box>
      )}
      <Box p="2" borderRadius="round" backgroundColor="ink.background-secondary">
        <Chevron width={32} height={32} />
      </Box>
      <Box gap="1">
        <TransText variant="label02">$0</TransText>
        <Text variant="label02" color="ink.text-subdued">
          {fingerprint}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}
