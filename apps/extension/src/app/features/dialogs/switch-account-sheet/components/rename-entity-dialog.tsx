import { useState } from 'react';

import { SwitchAccountSelectors } from '@tests/selectors/switch-account.selectors';
import { Stack } from 'leather-styles/jsx';

import { ACCOUNT_MAX_NAME_LENGTH } from '@leather.io/constants';
import { Button, Input, Sheet, SheetHeader } from '@leather.io/ui';

import { ButtonRow } from '@app/components/layout/card/components/button-row';
import { useAppDispatch } from '@app/store';
import { userClearsAccountName, userRenamesAccount } from '@app/store/accounts/accounts.slice';

interface RenameEntityDialogProps {
  id: string;
  currentName: string;
  title: string;
  nameLabel: string;
  inputTestId: SwitchAccountSelectors;
  saveTestId: SwitchAccountSelectors;
  isShowing: boolean;
  onClose(): void;
}

export function RenameEntityDialog({
  id,
  currentName,
  title,
  nameLabel,
  inputTestId,
  saveTestId,
  isShowing,
  onClose,
}: RenameEntityDialogProps) {
  const dispatch = useAppDispatch();
  const [draftName, setDraftName] = useState<string>();
  const name = draftName ?? currentName;

  function handleSave() {
    if (name !== currentName) {
      const trimmed = name.trim().substring(0, ACCOUNT_MAX_NAME_LENGTH);
      if (trimmed) {
        dispatch(userRenamesAccount({ accountId: id, name: trimmed }));
      } else {
        dispatch(userClearsAccountName({ accountId: id }));
      }
    }
    onClose();
  }

  if (!isShowing) return null;

  return (
    <Sheet
      header={<SheetHeader title={title} />}
      isShowing={isShowing}
      onClose={onClose}
      footer={
        <ButtonRow flexDirection="row">
          <Button variant="outline" flexGrow={1} onClick={onClose}>
            Cancel
          </Button>
          <Button data-testid={saveTestId} flexGrow={1} onClick={handleSave}>
            Save
          </Button>
        </ButtonRow>
      }
    >
      <Stack gap="space.05" px="space.05" pt="space.05" pb="space.05">
        <Input.Root>
          <Input.Label>{nameLabel}</Input.Label>
          <Input.Field
            autoFocus
            data-testid={inputTestId}
            value={name}
            maxLength={ACCOUNT_MAX_NAME_LENGTH}
            onChange={e => setDraftName(e.currentTarget.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSave();
            }}
          />
        </Input.Root>
      </Stack>
    </Sheet>
  );
}
