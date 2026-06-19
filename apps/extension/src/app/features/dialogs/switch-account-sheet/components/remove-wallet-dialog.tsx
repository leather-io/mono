import { SwitchAccountSelectors } from '@tests/selectors/switch-account.selectors';
import { Flex, Stack, styled } from 'leather-styles/jsx';

import { Button, Sheet, SheetHeader } from '@leather.io/ui';

import { useAppDispatch } from '@app/store';
import { removeWalletAndUpdateActive } from '@app/store/active/active.actions';

interface RemoveWalletDialogProps {
  currentName: string;
  fingerprint: string;
  isShowing: boolean;
  onClose(): void;
}

export function RemoveWalletDialog({
  currentName,
  fingerprint,
  isShowing,
  onClose,
}: RemoveWalletDialogProps) {
  const dispatch = useAppDispatch();

  function handleRemove() {
    void dispatch(removeWalletAndUpdateActive(fingerprint));
    onClose();
  }

  if (!isShowing) return null;

  return (
    <Sheet header={<SheetHeader title="Remove wallet" />} isShowing={isShowing} onClose={onClose}>
      <Stack gap="space.05" px="space.05" pb="space.05">
        <styled.p textStyle="label.02" color="ink.text-subdued">
          {currentName} will be removed from this device. Make sure your Secret Key is backed up —
          without it you won't be able to restore this wallet or access its funds.
        </styled.p>
        <Flex gap="space.04" justifyContent="flex-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            data-testid={SwitchAccountSelectors.RemoveWalletConfirmBtn}
            variant="solid"
            intent="danger"
            onClick={handleRemove}
          >
            Remove wallet
          </Button>
        </Flex>
      </Stack>
    </Sheet>
  );
}
