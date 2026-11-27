import { Flex, styled } from 'leather-styles/jsx';

import { Button, Sheet, SheetHeader } from '@leather.io/ui';

interface CancelVaultModalProps {
  vaultName: string;
  isShowing: boolean;
  isCancelling: boolean;
  onConfirm(): void;
  onClose(): void;
}

export function CancelVaultModal({
  vaultName,
  isShowing,
  isCancelling,
  onConfirm,
  onClose,
}: CancelVaultModalProps) {
  const title = `Cancel “${vaultName}”?`;

  return (
    <Sheet
      isShowing={isShowing}
      onClose={onClose}
      title={title}
      header={<SheetHeader variant="task" title={title} showCloseButton={false} />}
      footer={
        <Flex gap="space.03" justifyContent="flex-end" width="100%">
          <Button variant="ghost" onClick={onClose}>
            Keep vault
          </Button>
          <Button
            type="button"
            variant="outline"
            intent="danger"
            onClick={onConfirm}
            disabled={isCancelling}
            aria-busy={isCancelling}
          >
            Cancel vault
          </Button>
        </Flex>
      }
    >
      <styled.p textStyle="body.02" color="ink.text-secondary" px="space.05" pb="space.05">
        This vault hasn't activated yet, so no funds are at risk. Invited members will see that the
        invite was withdrawn.
      </styled.p>
    </Sheet>
  );
}
