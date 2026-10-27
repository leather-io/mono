// Recipe: tab page shell (extension full-page tab, desktop web). The same header,
// body and footer as PopupPage, in a bordered card in a centred 500px column, as
// the extension's Card does at sm+. The footer sits under the content instead of
// sticking, and `pinned` simply leads the body (the page scrolls as a whole in a
// tab). Same gutter as the popup (pageGutter). FramePage picks the shell for
// the frame a screen is drawn in.
import { Flex, Stack } from 'leather-styles/jsx';

import type { FrameId } from '../exploration/frame';
import { PageActions } from './page-actions';
import { PageFooter, PageHeader, pageGutter } from './page-header';
import { PageNotice } from './page-notice';
import { PopupPage, type PopupPageProps } from './popup-page';

type TabPageProps = PopupPageProps;

export function TabPage({
  title,
  onBack,
  onClose,
  trailing,
  actions,
  customFooter,
  notice,
  pinned,
  children,
}: TabPageProps) {
  return (
    <Flex
      direction="column"
      width="100%"
      maxWidth="pageWidth"
      mx="auto"
      bg="ink.background-primary"
      borderWidth={1}
      borderStyle="solid"
      borderColor="ink.border-default"
      borderRadius="lg"
      overflow="hidden"
    >
      <PageHeader title={title} onBack={onBack} onClose={onClose} trailing={trailing} />
      <Stack gap="space.05" px={pageGutter} pb="space.05" data-gutter="" data-page-body="">
        {notice ? <PageNotice {...notice} /> : null}
        {pinned}
        {children}
      </Stack>
      {actions ? (
        <PageFooter sticky={false}>
          <PageActions {...actions} />
        </PageFooter>
      ) : null}
      {customFooter ? <PageFooter sticky={false}>{customFooter}</PageFooter> : null}
    </Flex>
  );
}

type FramePageProps = TabPageProps & {
  frame: FrameId;
};

export function FramePage({ frame, ...props }: FramePageProps) {
  return frame === 'popup' ? <PopupPage {...props} /> : <TabPage {...props} />;
}
