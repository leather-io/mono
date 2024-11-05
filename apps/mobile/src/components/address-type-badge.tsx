import { useLingui } from '@lingui/react';

import { Box, Text } from '@leather.io/ui/native';

interface AddressTypeBadgeProps {
  type: string;
}
export function AddressTypeBadge({ type }: AddressTypeBadgeProps) {
  const { i18n } = useLingui();

  return (
    <Box
      bg="ink.background-secondary"
      borderColor="ink.border-transparent"
      borderRadius="xs"
      borderWidth={1}
      px="1"
    >
      <Text color="ink.text-subdued" fontSize={11} fontWeight={500} lineHeight={12}>
        {i18n._({
          id: 'address_type_badge.label',
          message: '{type}',
          values: { type },
        })}
      </Text>
    </Box>
  );
}
