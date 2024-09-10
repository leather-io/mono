import { t } from '@lingui/macro';

import { Box, ChevronRightIcon, Text, TouchableOpacity } from '@leather.io/ui/native';

import { Widget } from '../widgets/widget';

export function Earn() {
  return (
    <Widget>
      <Box>
        <TouchableOpacity flexDirection="row" gap="1" alignItems="center" paddingBottom="3">
          <Text variant="heading05">{t`Earn`}</Text>
          <ChevronRightIcon variant="small" />
        </TouchableOpacity>
        <Box
          justifyContent="space-between"
          p="5"
          borderRadius="xs"
          backgroundColor="ink.background-secondary"
          height={148}
        >
          <Box flexDirection="column">
            <Text variant="caption01">{t`Total rewards`}</Text>
            <Text variant="heading04">$0</Text>
          </Box>
          <Text variant="caption01">{t`Start stacking`}</Text>
        </Box>
      </Box>
    </Widget>
  );
}
