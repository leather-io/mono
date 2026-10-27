// Recipe: review sheet. A headline, grouped key-value rows and one action, over
// the screen it confirms. Mirrors the extension's send review
// (apps/extension/src/app/pages/send/send-crypto-asset-form/form/send-form-confirmation.layout.tsx):
// amount → an optional edge-to-edge Callout → the recipient group → a dashed
// divider → the totals group. Product code uses `Sheet` + `SheetHeader` from
// @leather.io/ui; this inline version draws the same thing inside a Playground
// frame, because a real Sheet portals out of it. ReviewRow also works on a page.
//
// Structure rules:
// - Group rows by what they answer (who / how much / when) with ReviewSection,
//   and split groups with ReviewDivider. Nothing floats between groups.
// - A value's breakdown nests under it (`nested`): smaller type for the nested
//   label and number, so the parent value stays the one that reads first.
// - At most three text styles in one group: label, value, caption.
// - Values are Diatype label.02, never mono and no tabular-nums: in the web
//   build Diatype's tabular figures come from its semi-mono cut, which is how
//   round 3's Total spend / Sending / Fee turned monospaced. Only a full
//   address is mono (AddressDisplayer).
// - The amount comes from AmountDisplay (`amount`), so its fiat gap matches
//   the send form. The recipient is a RecipientSummary.
import type { ReactNode } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { Caption, DashedHr, SheetHeader } from '@leather.io/ui';

import type { FrameId } from '../exploration/frame';
import { AmountDisplay, type AmountDisplayProps } from './amount-display';
import { InfoLabel } from './inline-info';
import { defineRecipeMeta } from './recipe-meta';

export const reviewSheetMeta = defineRecipeMeta({
  name: 'Review sheet (ReviewSheet, ReviewSection, ReviewRow, ReviewDivider)',
  mirrors:
    'apps/extension/src/app/pages/send/send-crypto-asset-form/form/send-form-confirmation.layout.tsx, components/info-card/info-card.tsx',
  useWhen: [
    'Confirming a task: the amount (AmountDisplay via `amount`), grouped facts, one solid action',
    'The recipient: RecipientSummary in the first ReviewSection',
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
  // Fiat or a short qualifier under the value.
  caption?: string;
  // One-sentence explanation behind an info icon.
  info?: string;
  // A breakdown line under the row above: caption.01 label, label.03 value.
  nested?: boolean;
}

// The label lines up with the first line of the value, as InfoCardRow does on
// the shipped review (a multi-line address or a caption grows downward).
export function ReviewRow({ label, value, caption, info, nested = false }: ReviewRowProps) {
  if (nested)
    return (
      <Flex justifyContent="space-between" alignItems="flex-start" gap="space.04" pl="space.03">
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          {label}
        </styled.span>
        <styled.span textStyle="label.03" color="ink.text-secondary" textAlign="right">
          {value}
        </styled.span>
      </Flex>
    );
  return (
    <Flex justifyContent="space-between" alignItems="flex-start" gap="space.04">
      <InfoLabel label={label} info={info} />
      <Stack gap="0" alignItems="flex-end" textAlign="right" minWidth={0}>
        <styled.span textStyle="label.02" color="ink.text-primary">
          {value}
        </styled.span>
        {caption ? <Caption>{caption}</Caption> : null}
      </Stack>
    </Flex>
  );
}

// One group of rows that answer one question.
export function ReviewSection({ children }: { children: ReactNode }) {
  return <Stack gap="space.03">{children}</Stack>;
}

// The dashed divider between groups (InfoCardSeparator).
export function ReviewDivider() {
  return <DashedHr my="space.01" />;
}

interface ReviewSheetProps {
  frame: FrameId;
  title: string;
  action: ReactNode;
  children: ReactNode;
  // The amount the review is about, drawn with AmountDisplay so the amount →
  // fiat spacing matches the send form.
  amount?: Omit<AmountDisplayProps, 'size'>;
  // Anything else that leads the review (an NFT, a contract). Prefer `amount`.
  headline?: ReactNode;
  // A Callout about this review. Drawn edge to edge under the headline.
  callout?: ReactNode;
  onClose?(): void;
}

// Popup: a bottom sheet. Tab: a centred dialog, the way Sheet renders at md+.
// `position: fixed` stays inside the frame (the frame is its containing block).
export function ReviewSheet({
  frame,
  title,
  action,
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
        bg="ink.background-primary"
        borderWidth={1}
        borderStyle="solid"
        borderColor="ink.border-default"
        borderTopRadius="lg"
        borderBottomRadius={isPopup ? 'none' : 'lg'}
        overflow="hidden"
      >
        <SheetHeader title={title} onClose={onClose} />
        {amount || headline ? (
          <Box px="space.05">{amount ? <AmountDisplay {...amount} /> : headline}</Box>
        ) : null}
        {callout ? <Box mb="space.05">{callout}</Box> : null}
        <Stack gap="space.04" px="space.05" data-gutter="">
          {children}
        </Stack>
        <Flex gap="space.04" p="space.05">
          {action}
        </Flex>
      </Stack>
    </Flex>
  );
}
