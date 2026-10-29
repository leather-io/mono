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
