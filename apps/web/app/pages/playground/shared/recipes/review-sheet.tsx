import type { ReactNode } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { Caption, DashedHr, SheetHeader } from '@leather.io/ui';

import type { FrameId } from '../exploration/frame';
import { AmountDisplay, type AmountDisplayProps } from './amount-display';
import { InfoLabel } from './inline-info';
import { PageActions, type PageActionsProps } from './page-actions';
import { PageFooter } from './page-header';
import { PageNotice, type PageNoticeProps } from './page-notice';
import { defineRecipeMeta } from './recipe-meta';

export const reviewSheetMeta = defineRecipeMeta({
  name: 'Review sheet (ReviewSheet, ReviewSection, ReviewRow, ReviewDivider)',
  mirrors:
    'apps/extension/src/app/pages/send/send-crypto-asset-form/form/send-form-confirmation.layout.tsx, components/info-card/info-card.tsx',
  useWhen: [
    'Confirming a task: the amount (AmountDisplay via `amount`), grouped facts, one solid action',
    'The recipient: ReviewRow with an AddressDisplayer or the existing product identity component in the first ReviewSection',
    'ReviewSection per question the reader asks (recipient; amounts and fee); ReviewDivider between them',
    'ReviewRow nested for a breakdown under a value (fee parts, locked vs available)',
    'callout: a risk about this send, edge to edge under the headline',
  ],
  dontUseWhen: [
    { situation: 'A pickable list', use: 'list-row presets' },
    { situation: 'A sentence explaining a row', use: 'ReviewRow info (tooltip)' },
    { situation: 'A Callout between rows', use: 'the callout slot, or a row caption' },
  ],
});

interface ReviewRowProps {
  label: string;
  value: ReactNode;
  caption?: string;
  info?: string;
  nested?: boolean;
}

export function ReviewRow({ label, value, caption, info, nested = false }: ReviewRowProps) {
  if (nested)
    return (
      <Flex
        justifyContent="space-between"
        alignItems="flex-start"
        gap="space.04"
        pl="space.03"
        minWidth={0}
      >
        <styled.span
          textStyle="caption.01"
          color="ink.text-subdued"
          minWidth={0}
          overflowWrap="anywhere"
        >
          {label}
        </styled.span>
        <styled.span
          textStyle="label.03"
          color="ink.text-secondary"
          textAlign="right"
          minWidth={0}
          overflowWrap="anywhere"
        >
          {value}
        </styled.span>
      </Flex>
    );
  return (
    <Flex
      justifyContent="space-between"
      alignItems="flex-start"
      gap="space.04"
      minWidth={0}
      css={{ '& > *': { minWidth: 0, overflowWrap: 'anywhere' } }}
    >
      <InfoLabel label={label} info={info} />
      <Stack gap="0" alignItems="flex-end" textAlign="right" minWidth={0}>
        <styled.span
          textStyle="label.02"
          color="ink.text-primary"
          maxWidth="100%"
          whiteSpace="normal"
          overflowWrap="anywhere"
        >
          {value}
        </styled.span>
        {caption ? (
          <Caption maxWidth="100%" whiteSpace="normal" overflowWrap="anywhere">
            {caption}
          </Caption>
        ) : null}
      </Stack>
    </Flex>
  );
}

export function ReviewSection({ children }: { children: ReactNode }) {
  return <Stack gap="space.03">{children}</Stack>;
}

export function ReviewDivider() {
  return <DashedHr my="space.01" />;
}

interface ReviewSheetProps {
  frame: FrameId;
  title: string;
  actions: PageActionsProps;
  children: ReactNode;
  amount?: Omit<AmountDisplayProps, 'size'>;
  headline?: ReactNode;
  callout?: PageNoticeProps;
  onClose?(): void;
}

// Popup: a bottom sheet. Tab: a centred dialog, the way Sheet renders at md+.
// `position: fixed` stays inside the frame (the frame is its containing block).
export function ReviewSheet({
  frame,
  title,
  actions,
  children,
  amount,
  headline,
  callout,
  onClose,
}: ReviewSheetProps) {
  const isPopup = frame === 'popup';
  return (
    <Flex
      position="fixed"
      inset="0"
      zIndex={10}
      direction="column"
      alignItems="center"
      justifyContent={isPopup ? 'flex-end' : 'center'}
      p={isPopup ? 'space.00' : 'space.05'}
      bg="ink.background-overlay"
    >
      <Stack
        role="dialog"
        aria-label={title}
        gap="0"
        width="100%"
        maxWidth="pageWidth"
        maxHeight="100%"
        minHeight={0}
        bg="ink.background-primary"
        borderWidth={1}
        borderStyle="solid"
        borderColor="ink.border-default"
        borderTopRadius="lg"
        borderBottomRadius={isPopup ? 'none' : 'lg'}
        overflow="hidden"
      >
        <Box flexShrink={0}>
          <SheetHeader title={title} onClose={onClose} />
        </Box>
        <Stack
          gap="space.04"
          px="space.05"
          minHeight={0}
          overflowY="auto"
          data-review-body=""
          css={{ '& > *': { flexShrink: 0 } }}
        >
          {amount || headline ? (
            <Box>{amount ? <AmountDisplay {...amount} /> : headline}</Box>
          ) : null}
          {callout ? <PageNotice {...callout} /> : null}
          <Stack gap="space.04" data-gutter="">
            {children}
          </Stack>
        </Stack>
        <PageFooter sticky={false}>
          <PageActions {...actions} />
        </PageFooter>
      </Stack>
    </Flex>
  );
}
