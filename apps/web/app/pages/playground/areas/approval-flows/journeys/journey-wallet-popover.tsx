import { type ReactNode, useEffect, useRef } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';

import { CloseIcon } from '@leather.io/ui';

interface JourneyWalletPopoverProps {
  children: ReactNode;
  onClose(): void;
}

export function JourneyWalletPopover({ children, onClose }: JourneyWalletPopoverProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement;
    if (!dialog) return;
    dialog.showModal();
    return () => {
      dialog.close();
      const target =
        trigger instanceof HTMLElement && trigger !== document.body && trigger.isConnected
          ? trigger
          : document.querySelector('[data-journey-request]');
      if (target instanceof HTMLElement) target.focus({ preventScroll: true });
    };
  }, []);

  return (
    <styled.dialog
      ref={dialogRef}
      aria-label="Leather approval popover"
      onCancel={event => {
        event.preventDefault();
        onClose();
      }}
      position="fixed"
      top={{ base: '12px', md: '64px' }}
      right={{ base: '8px', md: '24px' }}
      left="auto"
      bottom="auto"
      margin="0"
      p="0"
      width="390px"
      maxWidth="calc(100vw - 16px)"
      height={{ base: 'calc(100dvh - 24px)', md: 'min(756px, calc(100dvh - 80px))' }}
      maxHeight="calc(100dvh - 24px)"
      display="flex"
      flexDirection="column"
      overflow="hidden"
      bg="ink.background-primary"
      color="ink.text-primary"
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius="lg"
      boxShadow="0 16px 64px rgb(0 0 0 / 24%)"
      css={{ '&::backdrop': { background: 'rgb(0 0 0 / 8%)' } }}
    >
      <Flex
        alignItems="center"
        justifyContent="space-between"
        gap="space.03"
        px="space.04"
        py="space.02"
        flexShrink={0}
        bg="ink.background-secondary"
        borderBottomWidth={1}
        borderColor="ink.border-default"
      >
        <styled.span textStyle="caption.02" color="ink.text-subdued">
          Leather · Demo extension
        </styled.span>
        <styled.button
          type="button"
          aria-label="Close Leather popover"
          onClick={onClose}
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="28px"
          height="28px"
          borderRadius="round"
          cursor="pointer"
          _hover={{ bg: 'ink.background-primary' }}
        >
          <CloseIcon variant="small" />
        </styled.button>
      </Flex>
      <Box flex="1" minHeight="0" position="relative">
        {children}
      </Box>
    </styled.dialog>
  );
}
