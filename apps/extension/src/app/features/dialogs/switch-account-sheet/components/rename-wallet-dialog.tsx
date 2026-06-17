import { useState } from 'react';

import { SwitchAccountSelectors } from '@tests/selectors/switch-account.selectors';
import { Stack } from 'leather-styles/jsx';

import { Button, Input, Sheet, SheetHeader } from '@leather.io/ui';

import { ButtonRow } from '@app/components/layout/card/components/button-row';
import { useAppDispatch } from '@app/store';
import { renameWallet } from '@app/store/active/active.actions';

const WALLET_MAX_NAME_LENGTH = 40;

interface RenameWalletDialogProps {
  currentName: string;
  fingerprint: string;
  isShowing: boolean;
  onClose(): void;
}

export function RenameWalletDialog({
  currentName,
  fingerprint,
  isShowing,
  onClose,
}: RenameWalletDialogProps) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(currentName);

  function handleSave() {
    const trimmed = name.trim().substring(0, WALLET_MAX_NAME_LENGTH);
    if (!trimmed) return;
    void dispatch(renameWallet(fingerprint, trimmed));
    onClose();
  }

  if (!isShowing) return null;

  return (
    <Sheet
      header={<SheetHeader title="Rename wallet" />}
      isShowing={isShowing}
      onClose={onClose}
      footer={
        <ButtonRow flexDirection="row">
          <Button variant="outline" flexGrow={1} onClick={onClose}>
            Cancel
          </Button>
          <Button
            data-testid={SwitchAccountSelectors.RenameWalletSaveBtn}
            flexGrow={1}
            onClick={handleSave}
            disabled={!name.trim()}
          >
            Save
          </Button>
        </ButtonRow>
      }
    >
      <Stack gap="space.05" px="space.05" pt="space.05" pb="space.05">
        <Input.Root>
          <Input.Label>Wallet name</Input.Label>
          <Input.Field
            autoFocus
            data-testid={SwitchAccountSelectors.RenameWalletInput}
            value={name}
            maxLength={WALLET_MAX_NAME_LENGTH}
            onChange={e => setName(e.currentTarget.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSave();
            }}
          />
        </Input.Root>
      </Stack>
    </Sheet>
  );
}
