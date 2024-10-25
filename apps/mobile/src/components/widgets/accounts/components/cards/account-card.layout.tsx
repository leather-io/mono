import { WalletStore } from '@/store/wallets/utils';

import { Box, Text, TouchableOpacity } from '@leather.io/ui/native';

import { LedgerBadge } from '../../ledger-badge';

export interface AccountCardLayoutProps {
  icon: React.ReactNode;
  label: React.ReactNode;
  caption: string;
  onPress(): void;
  type?: WalletStore['type'];
  width?: number;
  testID?: string;
}
export function AccountCardLayout({
  onPress,
  type,
  icon,
  label,
  caption,
  width = 200,
  testID,
}: AccountCardLayoutProps) {
  const isLedger = type === 'ledger';

  return (
    <TouchableOpacity
      onPress={onPress}
      width={width}
      height={180}
      p="5"
      borderRadius="sm"
      borderColor="ink.border-transparent"
      borderWidth={1}
      alignItems="flex-start"
      justifyContent="space-between"
      testID={testID}
    >
      {isLedger && <LedgerBadge />}

      <Box p="2" borderRadius="round" backgroundColor="ink.text-primary">
        {icon}
      </Box>
      <Box gap="1">
        <Text variant="label01">{label}</Text>
        <Text variant="caption01" color="ink.text-subdued">
          {caption}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}
