import { WalletStore } from '@/store/wallets/utils';
import { useTheme } from '@shopify/restyle';

import { Box, IconProps, Text, TouchableOpacity } from '@leather.io/ui/native';

import { LedgerBadge } from '../../ledger-badge';

export interface AccountCardLayoutProps {
  Icon: React.FC<IconProps>;
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
  Icon,
  label,
  caption,
  width = 200,
  testID,
}: AccountCardLayoutProps) {
  const isLedger = type === 'ledger';
  const theme = useTheme();
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
        <Icon color={theme.colors['ink.background-primary']} width={32} height={32} />
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
