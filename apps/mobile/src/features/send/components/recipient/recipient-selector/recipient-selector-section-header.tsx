import { RecipientSectionId } from '@/features/send/components/recipient/recipient.types';
import { t } from '@lingui/core/macro';

import { Box, Text } from '@leather.io/ui/native';

interface RecipientSectionHeaderProps {
  id: RecipientSectionId;
}

export function RecipientSelectorSectionHeader({ id }: RecipientSectionHeaderProps) {
  return (
    <Box px="5" mt="4" mb="1">
      <Text variant="label02" ml="0.5">
        {getSectionTitle(id)}
      </Text>
    </Box>
  );
}

function getSectionTitle(id: RecipientSectionId) {
  return {
    recents: t`Recents`,
    accounts: t`Your accounts`,
    matching: t`Matching`,
  }[id];
}
