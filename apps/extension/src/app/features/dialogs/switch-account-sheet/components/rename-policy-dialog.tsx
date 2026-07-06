import { SwitchAccountSelectors } from '@tests/selectors/switch-account.selectors';

import { type PolicyStore } from '@app/store/policy/policy-store.utils';
import { usePolicyDisplayName } from '@app/store/policy/policy.selectors';

import { RenameEntityDialog } from './rename-entity-dialog';

interface RenamePolicyDialogProps {
  policy: PolicyStore;
  isShowing: boolean;
  onClose(): void;
}

export function RenamePolicyDialog({ policy, isShowing, onClose }: RenamePolicyDialogProps) {
  const currentName = usePolicyDisplayName(policy) ?? '';

  return (
    <RenameEntityDialog
      id={policy.id}
      currentName={currentName}
      title="Rename multisig"
      nameLabel="Multisig name"
      inputTestId={SwitchAccountSelectors.RenamePolicyInput}
      saveTestId={SwitchAccountSelectors.RenamePolicySaveBtn}
      isShowing={isShowing}
      onClose={onClose}
    />
  );
}
