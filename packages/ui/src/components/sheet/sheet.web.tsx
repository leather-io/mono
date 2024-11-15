import { JSXElementConstructor, ReactElement, ReactNode, RefObject, cloneElement } from 'react';

import * as RadixDialog from '@radix-ui/react-dialog';
import { css } from 'leather-styles/css';
import { Box } from 'leather-styles/jsx';
import { token } from 'leather-styles/tokens';

import { pxStringToNumber } from '@leather.io/utils';

import { SheetFooter } from './components/sheet-footer.web';

export interface SheetProps {
  onClose?(): void;
  triggerRef?: RefObject<HTMLButtonElement>;
  closeRef?: RefObject<HTMLButtonElement>;
  isDefaultOpen?: boolean;
}
interface RadixDialogProps extends SheetProps {
  children: ReactNode;
  footer?: ReactNode;
  header?: ReactElement<any, string | JSXElementConstructor<any>>;
  onGoBack?(): void;
  wrapChildren?: boolean;
}

function getHeightOffset(header: ReactNode, footer: ReactNode) {
  const headerHeight = header ? pxStringToNumber(token('sizes.headerHeight')) : 0;
  const footerHeight = footer ? pxStringToNumber(token('sizes.footerHeight')) : 0;
  return headerHeight + footerHeight;
}

function getContentMaxHeight(maxHeightOffset: number) {
  const virtualHeight = window.innerWidth <= pxStringToNumber(token('sizes.popupWidth')) ? 100 : 70;

  return `calc(${virtualHeight}vh - ${maxHeightOffset}px)`;
}

export function Sheet({
  children,
  footer,
  header,
  onClose,
  wrapChildren = true,
  triggerRef,
  closeRef,
  isDefaultOpen = false,
}: RadixDialogProps) {
  const maxHeightOffset = getHeightOffset(header, footer);
  const contentMaxHeight = getContentMaxHeight(maxHeightOffset);

  return (
    <RadixDialog.Root defaultOpen={isDefaultOpen}>
      <RadixDialog.Trigger ref={triggerRef} />
      <RadixDialog.Close ref={closeRef} />
      <RadixDialog.Overlay
        className={css({
          display: { base: 'none', md: 'block' },
          bg: 'overlay',
          position: 'fixed',
          inset: 0,
          zIndex: 999,
          '&[data-state=open]': {
            animation: {
              base: '',
              md: 'fadein 50ms',
            },
          },
          '&[data-state=closed]': {
            animation: {
              base: '',
              md: 'fadeout 50ms',
            },
          },
        })}
      />
      <RadixDialog.Content
        onPointerDownOutside={onClose}
        onEscapeKeyDown={onClose}
        className={css({
          bg: 'ink.background-primary',
          // remove borderRadius on small to give impression of full page
          borderRadius: { base: '0', md: 'md' },
          boxShadow:
            'hsl(206 22% 7% / 35%) 0 10px 38px -10px, hsl(206 22% 7% / 20%) 0 10px 20px -15px',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { base: '100vw', md: '90vw' },
          height: { base: '100%', md: 'auto' },
          maxWidth: { base: '100vw', md: 'pageWidth' },
          maxHeight: { base: '100vh', md: '90vh' },
          zIndex: 999,

          '&[data-state=open]': {
            animation: {
              base: 'slideUpSheet 70ms',
              md: 'contentShow 70ms',
            },
          },
          '&[data-state=closed]': {
            animation: {
              base: 'slideDownSheet 70ms',
              md: 'contentHide 70ms',
            },
          },
        })}
      >
        {header && cloneElement(header, { onClose })}

        {wrapChildren ? (
          <Box
            style={{
              height: '100%',
              maxHeight: contentMaxHeight,
              marginBottom: footer ? token('sizes.footerHeight') : token('spacing.space.04'),
              overflowY: 'auto',
            }}
          >
            {children}
          </Box>
        ) : (
          children
        )}
        {footer && <SheetFooter>{footer}</SheetFooter>}
      </RadixDialog.Content>
    </RadixDialog.Root>
  );
}
