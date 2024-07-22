import Chevron from '@/assets/chevron-right.svg';

import { Box, Text, TouchableOpacity } from '@leather.io/ui/native';

export function Earn() {
  return (
    <Box>
      <TouchableOpacity flexDirection="row" gap="1" alignItems="center" paddingBottom="3">
        <Text variant="heading05">Earn</Text>
        <Chevron width={16} height={16} />
      </TouchableOpacity>
      <Box
        justifyContent="space-between"
        p="5"
        borderRadius="xs"
        backgroundColor="base.ink.background-secondary"
        height={148}
      >
        <Box flexDirection="column">
          <Text variant="caption01">Total rewards</Text>
          <Text variant="heading04">$0</Text>
        </Box>
        <Text variant="caption01">Start stacking</Text>
      </Box>
    </Box>
  );
}