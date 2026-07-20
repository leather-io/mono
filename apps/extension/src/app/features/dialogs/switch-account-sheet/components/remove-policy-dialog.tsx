import { SwitchAccountSelectors } from '@tests/selectors/switch-account.selectors';
import { Flex, Stack, styled } from 'leather-styles/jsx';

import { Button, Sheet, SheetHeader } from '@leather.io/ui';

import { useAppDispatch } from '@app/store';
import { type PolicyStore } from '@app/store/policy/policy-store.utils';
import { usePolicyDisplayName } from '@app/store/policy/policy.selectors';
import { userRemovesPolicy } from '@app/store/policy/policy.slice';

interface RemovePolicyDialogProps {
  policy: PolicyStore;
  isShowing: boolean;
  onClose(): void;
}

export function RemovePolicyDialog({ policy, isShowing, onClose }: RemovePolicyDialogProps) {
  const dispatch = useAppDispatch();
  const name = usePolicyDisplayName(policy);

  function handleRemove() {
    dispatch(userRemovesPolicy({ policyId: policy.id }));
    onClose();
  }

  if (!isShowing) return null;

  return (
    <Sheet header={<SheetHeader title="Remove multisig" />} isShowing={isShowing} onClose={onClose}>
      <Stack gap="space.05" px="space.05" pb="space.05">
        <styled.p textStyle="label.02" color="ink.text-subdued">
          {name} will be removed from this device. You can re-add it from the app that registered
          it.
        </styled.p>
        <Flex gap="space.04" justifyContent="flex-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            data-testid={SwitchAccountSelectors.RemovePolicyConfirmBtn}
            variant="solid"
            intent="danger"
            onClick={handleRemove}
          >
            Remove multisig
          </Button>
        </Flex>
      </Stack>
    </Sheet>
  );
}
