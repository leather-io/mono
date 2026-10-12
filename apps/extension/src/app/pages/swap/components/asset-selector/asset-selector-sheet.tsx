import { ReactNode } from 'react';

import * as Dialog from '@radix-ui/react-dialog';
import { css } from 'leather-styles/css';
import { Box } from 'leather-styles/jsx';

import { SheetHeader } from '@leather.io/ui';

interface AssetSelectorSheetProps {
  type: 'base' | 'target' | null;
  isOpen: boolean;
  onClose(): void;
  onCloseAutoFocus?(e: Event): void;
  children: ReactNode;
}

export function AssetSelectorSheet({
  type,
  isOpen,
  onClose,
  onCloseAutoFocus,
  children,
}: AssetSelectorSheetProps) {
  if (!type) return null;

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={css({
            bg: 'overlay',
            position: 'fixed',
            inset: 0,
            animation: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: '10',
          })}
        />
        <Dialog.Content
          onPointerDownOutside={onClose}
          onEscapeKeyDown={onClose}
          onCloseAutoFocus={onCloseAutoFocus}
          className={css({
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bg: 'ink.background-primary',
            borderRadius: { base: '0', md: 'md' },
            boxShadow:
              'hsl(206 22% 7% / 35%) 0 10px 38px -10px, hsl(206 22% 7% / 20%) 0 10px 20px -15px',
            position: 'fixed',
            top: { base: 0, md: '10vh' },
            left: { base: 0, md: '50%' },
            right: { base: 0, md: 'auto' },
            transform: { base: 'none', md: 'translateX(-50%)' },
            width: { base: 'auto', md: '90vw' },
            maxWidth: { base: 'none', md: 'pageWidth' },
            height: { base: '100vh', md: '80vh' },
            zIndex: '100',
            '&[data-state=open]': {
              animation: 'contentShowTop 150ms cubic-bezier(0.16, 1, 0.3, 1)',
            },
          })}
        >
          <SheetHeader title={getSheetTitle(type)} onClose={onClose} />
          <Box overflowY="auto" flex={1}>
            {children}
          </Box>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function getSheetTitle(type: 'base' | 'target') {
  return {
    base: 'Choose asset to swap',
    target: 'Choose asset to receive',
  }[type];
}
