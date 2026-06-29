import { SwitchAccountSelectors } from '@tests/selectors/switch-account.selectors';

import { makeAccountIdentifer } from '@leather.io/crypto';
import type { AccountId } from '@leather.io/models';

import { useAccountDisplayName } from '@app/common/hooks/account/use-account-names';
import { useStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

import { RenameEntityDialog } from './rename-entity-dialog';

interface RenameAccountDialogProps {
  accountId: AccountId;
  isShowing: boolean;
  onClose(): void;
}

export function RenameAccountDialog({ accountId, isShowing, onClose }: RenameAccountDialogProps) {
  const stacksAccount = useStacksAccount(accountId);
  const { data: resolvedName } = useAccountDisplayName({
    address: stacksAccount?.address,
    index: accountId.accountIndex,
    fingerprint: accountId.fingerprint,
  });

  return (
    <RenameEntityDialog
      id={makeAccountIdentifer(accountId.fingerprint, accountId.accountIndex)}
      currentName={resolvedName ?? ''}
      title="Rename account"
      nameLabel="Account name"
      inputTestId={SwitchAccountSelectors.RenameAccountInput}
      saveTestId={SwitchAccountSelectors.RenameAccountSaveBtn}
      isShowing={isShowing}
      onClose={onClose}
    />
  );
}
