import { JSXElementConstructor, ReactElement, ReactNode, cloneElement } from 'react';

import { type CssFunction, css } from 'leather-styles/css';
import { Box } from 'leather-styles/jsx';
import { token } from 'leather-styles/tokens';
import { Dialog as RadixDialog, VisuallyHidden } from 'radix-ui';

import { pxStringToNumber } from '@leather.io/utils';

import { SheetFooter } from './sheet-footer.web';

type SheetVariant = 'dialog' | 'drawer';

export interface SheetProps {
  isShowing: boolean;
  onClose?(): void;
}
interface RadixDialogProps extends SheetProps {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  header?: ReactElement<any, string | JSXElementConstructor<any>>;
  onGoBack?(): void;
  wrapChildren?: boolean;
  variant?: SheetVariant;
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
  isShowing,
  wrapChildren = true,
  title,
  description,
  variant = 'dialog',
}: RadixDialogProps) {
  const maxHeightOffset = getHeightOffset(header, footer);
  const contentMaxHeight = getContentMaxHeight(maxHeightOffset);
  const variantMap: Record<SheetVariant, Parameters<CssFunction>[0]> = {
    dialog: css.raw({
      top: '50%',
      transform: 'translate(-50%, -50%)',
      height: { base: '100%', md: 'auto' },
    }),
    drawer: css.raw({
      bottom: { base: 0, md: 'unset' },
      top: { md: '50%' },
      borderTopRadius: 'lg',

      transform: { base: 'translateX(-50%)', md: 'translate(-50%, -50%)' },
      height: { base: 'fit-content', md: 'auto' },
    }),
  };

  return (
    <RadixDialog.Root open={isShowing}>
      <RadixDialog.Portal>
        <VisuallyHidden.Root>
          <RadixDialog.Title>{title ?? 'Dialog'}</RadixDialog.Title>
          <RadixDialog.Description>{description ?? 'Dialog description'}</RadixDialog.Description>
        </VisuallyHidden.Root>
        <RadixDialog.Overlay
          className={css({
            bg: 'overlay',
            position: 'fixed',
            inset: 0,
            animation: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 999,
          })}
        >
          <RadixDialog.Content
            onPointerDownOutside={onClose}
            onEscapeKeyDown={onClose}
            className={css({
              display: 'flex',
              flexDirection: 'column',
              bg: 'ink.background-primary',
              // remove borderRadius on small to give impression of full page
              borderRadius: { base: '0', md: 'md' },
              boxShadow:
                'hsl(206 22% 7% / 35%) 0 10px 38px -10px, hsl(206 22% 7% / 20%) 0 10px 20px -15px',
              position: 'fixed',
              left: '50%',
              width: { base: '100vw', md: '90vw' },
              maxWidth: { base: '100vw', md: 'pageWidth' },
              maxHeight: { base: '100vh', md: '90vh' },
              '&[data-state=open]': {
                animation: { base: '', md: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)' },
              },
              ...variantMap[variant],
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
        </RadixDialog.Overlay>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
