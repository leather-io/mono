import { t } from '@lingui/core/macro';

import { Box, Text } from '@leather.io/ui/native';

export function RecipientSelectorSearchEmptyState() {
  return (
    <Box mt="6" width={240} alignSelf="center" gap="3">
      <Text textAlign="center" variant="label01">
        {t`No results found`}
      </Text>
      <Text textAlign="center" variant="label02" color="ink.text-subdued-secondary">
        {t`The address you entered isn’t valid. Verify and try again`}
      </Text>
    </Box>
  );
}
