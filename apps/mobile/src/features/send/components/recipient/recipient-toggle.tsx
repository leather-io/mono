import { t } from '@lingui/macro';

import {
  AddressDisplayer,
  Avatar,
  Box,
  Flag,
  Pressable,
  Text,
  UserIcon,
} from '@leather.io/ui/native';

interface RecipientToggleProps {
  onPress(): void;
  value: string;
  invalid: boolean;
}

export function RecipientToggle({ onPress, value, invalid }: RecipientToggleProps) {
  return (
    <Pressable
      onPress={onPress}
      pressEffects={{
        backgroundColor: {
          from: 'ink.background-primary',
          to: 'ink.background-secondary',
        },
      }}
    >
      <Box
        borderColor={invalid ? 'red.border' : 'ink.border-default'}
        borderRadius="sm"
        borderWidth={1}
        height={64}
        overflow="hidden"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        py="4"
        pl="4"
        pr="2"
      >
        {value ? (
          <Flag img={<Avatar icon={<UserIcon />} />}>
            <AddressDisplayer address={value} />
          </Flag>
        ) : (
          <Text variant="label02" color="ink.text-subdued">
            {t({
              id: 'send_form.recipient.toggle.label',
              message: 'Enter recipient',
            })}
          </Text>
        )}
      </Box>
    </Pressable>
  );
}
