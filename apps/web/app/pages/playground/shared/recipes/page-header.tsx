// Recipe parts: the page header and footer shared by PopupPage and TabPage.
// Header: back on the left, an optional title in the middle, close (or a
// trailing action such as Send's settings menu) on the right, as in the
// extension's PageHeader. Footer: the screen's actions (see footerActionsMeta).
// Use them through PopupPage or TabPage; reach for them directly only in a custom shell.
//
// One horizontal gutter. The page body's content rail is `pageGutter` (space.05,
// 24px) from each edge. Header icon buttons are 40px squares holding a 24px
// glyph, so the header pads `headerInset` (space.04, 16px) on both sides and
// the glyph lands on the rail: 16 + (40 − 24) / 2 = 24. Both icon slots are
// always 40px wide, so a header with only a back button stays symmetric and the
// title stays centred. Don't add a margin to one side (round 3's Send header
// had ml space.02 on back only, so back and settings sat 8px apart).
// `pnpm design:align` checks the rail and the header symmetry on a render.
import type { ReactNode } from 'react';

import { Flex, Grid, styled } from 'leather-styles/jsx';

import { ArrowLeftIcon, CloseIcon, IconButton } from '@leather.io/ui';

import { defineRecipeMeta } from './recipe-meta';

// The content gutter every popup and tab page body uses.
export const pageGutter = 'space.05';
// The header's own padding: an IconButton's 8px inner space makes up the rest.
const headerInset = 'space.04';

export const footerActionsMeta = defineRecipeMeta({
  name: 'Footer actions (PageActions through PopupPage / TabPage actions)',
  mirrors:
    'apps/extension/src/app/features/dialogs/switch-account-sheet/switch-account-sheet.tsx (Add wallet + Manage), components/layout/card/components/button-row.tsx',
  useWhen: [
    'The screen-level actions: Continue, Send, Save, Add address, Done. They live in the footer, not as small row or header actions',
    'At most one solid Button per screen (pnpm design:words counts them). A management screen (address book, accounts) has no solid: "Add …" is outline with iconStart PlusIcon, next to "Manage" (as Add wallet does)',
    'Typed primary and secondary actions: equal columns, readable labels, one solid action and shared pending disabling',
    'A choice after a finished task belongs in PageActions only when the feature brief calls for it',
  ],
  dontUseWhen: [
    {
      situation:
        'Two competing primaries (Save and Done together, View details and Copy ID both solid)',
      use: 'one primary descriptor that finishes the task and an optional secondary outline action',
    },
    { situation: 'A per-item action (copy, edit one contact)', use: 'list-row actions' },
  ],
});

export interface PageHeaderProps {
  title?: string;
  onBack?(): void;
  onClose?(): void;
  // A trailing icon action in place of close (Send's settings menu). A 40px
  // IconButton, so it mirrors back.
  trailing?: ReactNode;
}

// A 40px slot: empty or holding one IconButton.
function HeaderSlot({ align, children }: { align: 'start' | 'end'; children: ReactNode }) {
  return (
    // Literal branches: Panda extracts styles statically, so `justifySelf={align}`
    // would generate no class (design:align caught the settings icon off-centre).
    <Flex
      justifySelf={align === 'end' ? 'end' : 'start'}
      width="40px"
      height="40px"
      alignItems="center"
      justifyContent="center"
    >
      {children}
    </Flex>
  );
}

export function PageHeader({ title, onBack, onClose, trailing }: PageHeaderProps) {
  return (
    <Grid
      as="header"
      gridTemplateColumns="1fr auto 1fr"
      alignItems="center"
      gap="space.02"
      minHeight="popupHeaderHeight"
      px={headerInset}
      flexShrink={0}
      data-page-header=""
    >
      <HeaderSlot align="start">
        {onBack ? <IconButton icon={<ArrowLeftIcon />} aria-label="Back" onClick={onBack} /> : null}
      </HeaderSlot>
      <styled.h1 textStyle="heading.05" color="ink.text-primary" whiteSpace="nowrap">
        {title}
      </styled.h1>
      <HeaderSlot align="end">
        {trailing ??
          (onClose ? (
            <IconButton icon={<CloseIcon />} aria-label="Close" onClick={onClose} />
          ) : null)}
      </HeaderSlot>
    </Grid>
  );
}

interface PageFooterProps {
  children: ReactNode;
  // Sticky pins the footer to the bottom edge of the scroll area (popup).
  sticky?: boolean;
}

export function PageFooter({ children, sticky = true }: PageFooterProps) {
  return (
    <Grid
      gridAutoFlow="column"
      gridAutoColumns="minmax(0, 1fr)"
      gap="space.04"
      p={pageGutter}
      mt="auto"
      position={sticky ? 'sticky' : undefined}
      bottom={sticky ? '0' : undefined}
      zIndex={sticky ? 1 : undefined}
      flexShrink={0}
      minWidth={0}
      css={{
        '& > *': { minWidth: 0, maxWidth: '100%', overflowWrap: 'anywhere', whiteSpace: 'normal' },
        '& > button': { height: 'auto', minHeight: '48px' },
      }}
      bg={sticky ? 'ink.background-primary' : undefined}
      boxShadow={sticky ? 'contentOverflowFade' : undefined}
      data-page-footer=""
    >
      {children}
    </Grid>
  );
}
