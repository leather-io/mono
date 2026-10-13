import { Flex, styled } from 'leather-styles/jsx';

import { Button, CloseIcon, IconButton, Sheet } from '@leather.io/ui';

interface CancelVaultModalProps {
  vaultName: string;
  isShowing: boolean;
  isCancelling: boolean;
  onConfirm(): void;
  onClose(): void;
}

function CancelVaultHeader({ vaultName, onClose }: { vaultName: string; onClose?(): void }) {
  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      gap="space.04"
      px="space.05"
      py="space.04"
      width="100%"
      minHeight="headerHeight"
    >
      <styled.h2 textStyle="heading.05">Cancel “{vaultName}”?</styled.h2>
      {onClose && <IconButton icon={<CloseIcon />} onClick={onClose} />}
    </Flex>
  );
}

export function CancelVaultModal({
  vaultName,
  isShowing,
  isCancelling,
  onConfirm,
  onClose,
}: CancelVaultModalProps) {
  return (
    <Sheet
      isShowing={isShowing}
      onClose={onClose}
      header={<CancelVaultHeader vaultName={vaultName} />}
      footer={
        <Flex gap="space.03" justifyContent="flex-end" width="100%">
          <Button variant="ghost" onClick={onClose}>
            Keep vault
          </Button>
          <styled.button
            type="button"
            onClick={onConfirm}
            disabled={isCancelling}
            aria-busy={isCancelling}
            height="48px"
            px="space.04"
            borderRadius="round"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="red.border"
            bg="transparent"
            color="red.action-primary-default"
            textStyle="label.02"
            cursor="pointer"
            _hover={{ bg: 'red.background-primary' }}
            _disabled={{ cursor: 'not-allowed', opacity: 0.6 }}
          >
            Cancel vault
          </styled.button>
        </Flex>
      }
    >
      <styled.p textStyle="body.02" color="ink.text-subdued" px="space.05" pb="space.05">
        This vault hasn't activated yet, so no funds are at risk. Invited members will see that the
        invite was withdrawn.
      </styled.p>
    </Sheet>
  );
}
