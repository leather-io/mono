import Chevron from '@/assets/chevron-right.svg';

import { Box, TouchableOpacity } from '@leather.io/ui/native';

import { TransText } from '../trans-text';

export function Earn() {
  return (
    <Box>
      <TouchableOpacity flexDirection="row" gap="1" alignItems="center" paddingBottom="3">
        <TransText variant="heading05">Earn</TransText>
        <Chevron width={16} height={16} />
      </TouchableOpacity>
      <Box
        justifyContent="space-between"
        p="5"
        borderRadius="xs"
        backgroundColor="ink.background-secondary"
        height={148}
      >
        <Box flexDirection="column">
          <TransText variant="caption01">Total rewards</TransText>
          <TransText variant="heading04">$0</TransText>
        </Box>
        <TransText variant="caption01">Start stacking</TransText>
      </Box>
    </Box>
  );
}
