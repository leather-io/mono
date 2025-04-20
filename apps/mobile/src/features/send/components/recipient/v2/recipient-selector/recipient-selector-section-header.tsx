import { RecipientSectionId } from '@/features/send/components/recipient/v2/types';
import { t } from '@lingui/macro';

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
    recents: t({
      id: 'send-form.recipient.recents',
      message: 'Recents',
    }),
    accounts: t({
      id: 'send-form.recipient.accounts',
      message: 'Your accounts',
    }),
    matching: t({
      id: 'send-form.recipient.matching',
      message: 'Matching',
    }),
  }[id];
}
