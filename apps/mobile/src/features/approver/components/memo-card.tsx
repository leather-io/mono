import { t } from '@lingui/core/macro';

import { Avatar, Box, Cell, ChevronRightIcon, NoteTextIcon } from '@leather.io/ui/native';

interface MemoCardProps {
  memo: string;
  onPress(): void;
  disabled?: boolean;
}

export function MemoCard({ memo, onPress, disabled }: MemoCardProps) {
  return (
    <Box mx="-5">
      <Cell.Root pressable={!disabled} onPress={onPress} disabled={disabled}>
        <Cell.Icon>
          <Avatar icon={<NoteTextIcon />} />
        </Cell.Icon>
        <Cell.Content style={{ flexGrow: 1, flexShrink: 0 }}>
          <Cell.Label variant="primary">{t`Memo`}</Cell.Label>
        </Cell.Content>
        <Cell.Aside style={{ flexShrink: 1 }}>
          <Box flexDirection="row" alignItems="center" gap="2">
            <Cell.Label variant="primary" numberOfLines={1} style={{ flexShrink: 1 }}>
              {memo}
            </Cell.Label>
            {!disabled && (
              <Cell.Icon>
                <ChevronRightIcon variant="small" />
              </Cell.Icon>
            )}
          </Box>
        </Cell.Aside>
      </Cell.Root>
    </Box>
  );
}
