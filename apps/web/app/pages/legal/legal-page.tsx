import ReactMarkdown from 'react-markdown';

import { Box, styled } from 'leather-styles/jsx';
import remarkGfm from 'remark-gfm';
import { contentComponents } from '~/components/content/content-components';
import { Page } from '~/layouts/page/page';
import { ChangelogEntryLayout } from '~/pages/changelog/components/changelog-page-layout';
import { marketingMeta } from '~/pages/marketing/shared/marketing-meta';

import { type LegalPage as LegalPageData } from './legal.data';

export function legalPageMeta({ title, path, description }: LegalPageData) {
  return marketingMeta({ title: `${title} – Leather`, path, description });
}

interface LegalPageProps {
  page: LegalPageData;
}
export function LegalPage({ page }: LegalPageProps) {
  return (
    <Page>
      <Page.Header />
      <Box maxW="960px" mt="space.08">
        <styled.article>
          <ChangelogEntryLayout
            leftColumn={
              <styled.h1 textStyle="heading.05" mt="space.02" mb="space.04">
                {page.title}
              </styled.h1>
            }
            isLast
          >
            <Box mt="space.01">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={contentComponents}>
                {page.body}
              </ReactMarkdown>
            </Box>
          </ChangelogEntryLayout>
        </styled.article>
      </Box>
    </Page>
  );
}
