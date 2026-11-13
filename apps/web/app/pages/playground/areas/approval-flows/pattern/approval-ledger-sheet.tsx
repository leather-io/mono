import { type ReactNode, useRef } from 'react';

import { css } from 'leather-styles/css';
import { Box, Stack, styled } from 'leather-styles/jsx';
import { Dialog } from 'radix-ui';

interface ApprovalLedgerSheetProps {
  children: ReactNode;
  title: string;
  description: string;
  isInteractive: boolean;
  onDismiss?(): void;
}

const sheetStyle = css({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '86%',
  maxHeight: 'calc(100% - 64px)',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  bg: 'ink.background-primary',
  color: 'ink.text-primary',
  borderTopRadius: '20px',
  borderWidth: 1,
  borderColor: 'ink.border-default',
  boxShadow: '0 -8px 32px rgb(0 0 0 / 12%)',
  overflow: 'hidden',
  outline: 'none',
  animation: 'approvalLedgerSheetIn 240ms cubic-bezier(0.2, 0, 0, 1) both',
  _motionReduce: { animation: 'approvalLedgerFadeIn 160ms linear both' },
});

const scrimStyle = css({
  position: 'absolute',
  inset: 0,
  bg: 'rgb(0 0 0 / 24%)',
  animation: 'approvalLedgerFadeIn 200ms linear both',
});

const sheetKeyframes = `
@keyframes approvalLedgerSheetIn { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes approvalLedgerFadeIn { from { opacity: 0; } to { opacity: 1; } }
`;

export function ApprovalLedgerSheet({
  children,
  title,
  description,
  isInteractive,
  onDismiss,
}: ApprovalLedgerSheetProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLElement | null>(null);
  const ownsFocus = useRef(false);
  const heading = (
    <Stack gap="space.02" px="space.05" pt="space.05" pb="space.03" flexShrink={0}>
      {isInteractive ? (
        <Dialog.Title
          ref={titleRef}
          tabIndex={-1}
          className={css({ textStyle: 'label.01', outline: 'none' })}
        >
          {title}
        </Dialog.Title>
      ) : (
        <styled.h2 textStyle="label.01">{title}</styled.h2>
      )}
    </Stack>
  );
  return (
    <Box position="absolute" inset={0} zIndex={10} data-approval-zone="ledger-sheet">
      <style>{sheetKeyframes}</style>
      <Box className={scrimStyle} aria-hidden="true" />
      {isInteractive ? (
        <Dialog.Root open modal={false}>
          <Dialog.Content
            ref={contentRef}
            className={sheetStyle}
            onOpenAutoFocus={event => {
              event.preventDefault();
              const frame = titleRef.current?.closest('[data-approval-shell]');
              if (frame instanceof HTMLElement) frameRef.current = frame;
              titleRef.current?.focus({ preventScroll: true });
            }}
            onCloseAutoFocus={event => {
              event.preventDefault();
              if (!ownsFocus.current) return;
              const trigger = frameRef.current?.querySelector<HTMLButtonElement>(
                '[data-approval-zone="footer"] button:last-child:not([disabled])'
              );
              const intent = frameRef.current?.querySelector<HTMLHeadingElement>('h1');
              (trigger ?? intent)?.focus({ preventScroll: true });
            }}
            onFocusCapture={() => {
              ownsFocus.current = true;
            }}
            onBlurCapture={event => {
              if (
                event.relatedTarget instanceof Node &&
                !contentRef.current?.contains(event.relatedTarget)
              ) {
                ownsFocus.current = false;
              }
            }}
            onInteractOutside={event => event.preventDefault()}
            onEscapeKeyDown={event => {
              event.preventDefault();
              event.stopPropagation();
              onDismiss?.();
            }}
          >
            {heading}
            <Dialog.Description className={css({ srOnly: true })}>{description}</Dialog.Description>
            <Box display="flex" flex="1" minHeight={0}>
              {children}
            </Box>
          </Dialog.Content>
        </Dialog.Root>
      ) : (
        <Box className={sheetStyle}>
          {heading}
          <Box display="flex" flex="1" minHeight={0}>
            {children}
          </Box>
        </Box>
      )}
    </Box>
  );
}
