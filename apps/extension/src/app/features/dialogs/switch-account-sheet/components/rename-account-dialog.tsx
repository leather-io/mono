import { useState } from 'react';

import { SwitchAccountSelectors } from '@tests/selectors/switch-account.selectors';
import { Stack } from 'leather-styles/jsx';

import { ACCOUNT_MAX_NAME_LENGTH } from '@leather.io/constants';
import { makeAccountIdentifer } from '@leather.io/crypto';
import type { AccountId } from '@leather.io/models';
import { Button, Input, Sheet, SheetHeader } from '@leather.io/ui';

import { useAccountDisplayName } from '@app/common/hooks/account/use-account-names';
import { ButtonRow } from '@app/components/layout/card/components/button-row';
import { useAppDispatch } from '@app/store';
import { clearAccountName, renameAccount } from '@app/store/accounts/accounts.actions';
import { useStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

interface RenameAccountDialogProps {
  accountId: AccountId;
  isShowing: boolean;
  onClose(): void;
}

export function RenameAccountDialog({ accountId, isShowing, onClose }: RenameAccountDialogProps) {
  const dispatch = useAppDispatch();
  const stacksAccount = useStacksAccount(accountId);
  const { data: resolvedName } = useAccountDisplayName({
    address: stacksAccount?.address,
    index: accountId.accountIndex,
    fingerprint: accountId.fingerprint,
  });
  const [draftName, setDraftName] = useState<string>();
  const name = draftName ?? resolvedName;

  function handleSave() {
    const accountIdentifier = makeAccountIdentifer(accountId.fingerprint, accountId.accountIndex);
    if (name !== resolvedName) {
      const trimmed = name.trim().substring(0, ACCOUNT_MAX_NAME_LENGTH);
      if (trimmed) {
        void dispatch(renameAccount(accountIdentifier, trimmed));
      } else {
        void dispatch(clearAccountName(accountIdentifier));
      }
    }
    onClose();
  }

  if (!isShowing) return null;

  return (
    <Sheet
      header={<SheetHeader title="Rename account" />}
      isShowing={isShowing}
      onClose={onClose}
      footer={
        <ButtonRow flexDirection="row">
          <Button variant="outline" flexGrow={1} onClick={onClose}>
            Cancel
          </Button>
          <Button
            data-testid={SwitchAccountSelectors.RenameAccountSaveBtn}
            flexGrow={1}
            onClick={handleSave}
          >
            Save
          </Button>
        </ButtonRow>
      }
    >
      <Stack gap="space.05" px="space.05" pt="space.05" pb="space.05">
        <Input.Root>
          <Input.Label>Account name</Input.Label>
          <Input.Field
            autoFocus
            data-testid={SwitchAccountSelectors.RenameAccountInput}
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
