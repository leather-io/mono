// Recipe: popup page shell (360/390×600). Use it for every full screen in the
// extension popup. Not for a focused sub-task over the current screen: that is
// a Sheet (see review-sheet.tsx).
//
// Scrolling, as in Phantom's send and the extension's own pages: the header
// stays put, an optional `pinned` region under it stays put (the recipient
// input above a list of contacts, a search field), only the body scrolls, and
// the footer with the screen's one solid action sticks to the bottom. Never let
// the header scroll away with the list.
//
// One gutter: the pinned region, the body and the footer all sit on
// `pageGutter` (24px), and the header's icon glyphs land on the same rail (see
// page-header.tsx). Rows, inputs and section headers are direct children of the
// body and add no horizontal padding of their own. `data-gutter` marks the rail
// for `pnpm design:align`.
import type { ReactNode } from 'react';

import { Box, Flex, Stack } from 'leather-styles/jsx';

import { PageActions, type PageFooterContentProps } from './page-actions';
import { PageFooter, PageHeader, type PageHeaderProps, pageGutter } from './page-header';
import { PageNotice, type PageNoticeProps } from './page-notice';
import { defineRecipeMeta } from './recipe-meta';

export const popupPageMeta = defineRecipeMeta({
  name: 'Popup page shell (PopupPage, FramePage in the popup)',
  mirrors:
    'apps/extension/src/app/features/container/headers/page.header.tsx, components/layout/card/card.tsx (footer pinned to the bottom in the popup)',
  useWhen: [
    'Every full popup screen: header, body, footer',
    'pinned: what must stay in reach while a long list scrolls under it (the recipient field over contacts, a search field)',
    'trailing: a header icon action in place of close (Send settings)',
  ],
  dontUseWhen: [
    { situation: 'A focused sub-task over the current screen', use: 'ReviewSheet / Sheet' },
    {
      situation: 'Extra px on a row, input or section header inside the body',
      use: 'nothing: the body gutter is the only horizontal padding',
    },
  ],
});

interface PopupPageContentProps extends PageHeaderProps {
  notice?: PageNoticeProps;
  // Stays fixed under the header while the body scrolls.
  pinned?: ReactNode;
  children: ReactNode;
}

export type PopupPageProps = PopupPageContentProps & PageFooterContentProps;

export function PopupPage({
  title,
  onBack,
  onClose,
  trailing,
  actions,
  customFooter,
  notice,
  pinned,
  children,
}: PopupPageProps) {
  return (
    <Flex
      direction="column"
      flex="1"
      minWidth={0}
      maxWidth="100%"
      minHeight={0}
      height="100%"
      data-page-shell="popup"
    >
      <PageHeader title={title} onBack={onBack} onClose={onClose} trailing={trailing} />
      {pinned ? (
        <Box px={pageGutter} pb="space.04" flexShrink={0} data-gutter="" data-pinned="">
          {pinned}
        </Box>
      ) : null}
      {/* pt space.01: room for a first row's 12px hover bleed above its 8px margin. */}
      <Stack
        gap="space.05"
        px={pageGutter}
        pt="space.01"
        pb="space.05"
        flex="1"
        minWidth={0}
        minHeight={0}
        overflowY="auto"
        css={{ '& > *': { flexShrink: 0, minWidth: 0 } }}
        data-gutter=""
        data-page-body=""
      >
        {notice ? <PageNotice {...notice} /> : null}
        {children}
      </Stack>
      {actions ? (
        <PageFooter>
          <PageActions {...actions} />
        </PageFooter>
      ) : null}
      {customFooter ? <PageFooter>{customFooter}</PageFooter> : null}
    </Flex>
  );
}
