import Chevron from '@/assets/chevron-right.svg';
import { useTheme } from '@shopify/restyle';

import { Box, Theme, TouchableOpacity } from '@leather.io/ui/native';

import { TransText } from '../trans-text';

export function AccountCard({ onPress }: { onPress(): void }) {
  const theme = useTheme<Theme>();
  return (
    <TouchableOpacity
      onPress={onPress}
      width={200}
      height={180}
      p="5"
      borderRadius="sm"
      borderColor="base.ink.border-transparent"
      borderWidth={1}
      alignItems="flex-start"
      justifyContent="space-between"
    >
      <Box
        position="absolute"
        p="1"
        borderColor="base.ink.border-transparent"
        borderRadius="xs"
        borderWidth={1}
        right={theme.spacing[5]}
        top={theme.spacing[5]}
      >
        <TransText variant="label03" color="base.ink.text-subdued">
          Ledger
        </TransText>
      </Box>
      <Box p="2" borderRadius="round" backgroundColor="base.ink.background-secondary">
        <Chevron width={32} height={32} />
      </Box>
      <Box gap="1">
        <TransText variant="label02">$0</TransText>
        <TransText variant="label02" color="base.ink.text-subdued">
          Account 1
        </TransText>
      </Box>
    </TouchableOpacity>
  );
}
