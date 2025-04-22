import { t } from '@lingui/macro';

import { Box, Text } from '@leather.io/ui/native';

export function RecipientSelectorSearchEmptyState() {
  return (
    <Box mt="6" width={240} alignSelf="center" gap="3">
      <Text textAlign="center" variant="label01">
        {t({
          id: 'send-form.recipient.no-search-results.label',
          message: 'No results found',
        })}
      </Text>
      <Text textAlign="center" variant="label02" color="ink.text-subdued">
        {t({
          id: 'send-form.recipient.no-search-results.description',
          message: 'The address you entered isn’t valid. Verify and try again',
        })}
      </Text>
    </Box>
  );
}
