import { t } from '@lingui/macro';

import { Avatar, Box, Cell, ChevronRightIcon, NumberedListIcon, Text } from '@leather.io/ui/native';

interface NonceCardProps {
  nonce: string;
  onPress(): void;
}

export function NonceCard({ nonce, onPress }: NonceCardProps) {
  return (
    <Box mx="-5">
      <Cell.Root pressable onPress={onPress}>
        <Cell.Icon>
          <Avatar bg="ink.background-secondary">
            <NumberedListIcon />
          </Avatar>
        </Cell.Icon>
        <Cell.Content style={{ flexGrow: 1, flexShrink: 0 }}>
          <Cell.Label variant="primary">
            {t({
              id: 'approver.nonce.title',
              message: 'Nonce',
            })}
          </Cell.Label>
        </Cell.Content>
        <Cell.Aside style={{ flexShrink: 1 }}>
          <Box flexDirection="row" alignItems="center" gap="2">
            <Text variant="label02" numberOfLines={1} style={{ flexShrink: 1 }}>
              {nonce}
            </Text>
            <Cell.Icon>
              <ChevronRightIcon variant="small" />
            </Cell.Icon>
          </Box>
        </Cell.Aside>
      </Cell.Root>
    </Box>
  );
}
