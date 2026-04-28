import { useState } from 'react';

import { Flex, Stack } from 'leather-styles/jsx';

import type { AccountId } from '@leather.io/models';
import { Button, Input, Sheet, SheetHeader } from '@leather.io/ui';

import { useAppDispatch } from '@app/store';
import { settingsSlice } from '@app/store/settings/settings.slice';

interface RenameAccountDialogProps {
  accountId: AccountId;
  currentName: string;
  isShowing: boolean;
  onClose(): void;
}

export function RenameAccountDialog({
  accountId,
  currentName,
  isShowing,
  onClose,
}: RenameAccountDialogProps) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(currentName);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    dispatch(
      settingsSlice.actions.setAccountName({
        fingerprint: accountId.fingerprint,
        accountIndex: accountId.accountIndex,
        name: trimmed,
      })
    );
    onClose();
  }

  if (!isShowing) return null;

  return (
    <Sheet header={<SheetHeader title="Rename account" />} isShowing={isShowing} onClose={onClose}>
      <Stack gap="space.05" px="space.05" pb="space.05">
        <Input.Root>
          <Input.Label>Account name</Input.Label>
          <Input.Field
            autoFocus
            value={name}
            onChange={e => setName(e.currentTarget.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSave();
            }}
          />
        </Input.Root>
        <Flex gap="space.04" justifyContent="flex-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save
          </Button>
        </Flex>
      </Stack>
    </Sheet>
  );
}
