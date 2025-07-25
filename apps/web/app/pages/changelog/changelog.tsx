import { styled } from 'leather-styles/jsx';
import { Page } from '~/features/page/page';
import { ChangelogEntry, formatDate } from '~/utils/changelog';

import { sanitizeContent } from '@leather.io/ui';

interface ChangelogProps {
  entries: ChangelogEntry[];
}

export function Changelog({ entries }: ChangelogProps) {
  const changelogEntries = entries;

  return (
    <Page>
      <Page.Header title="Changelog" />

      <styled.div mb="space.05">
        <styled.h1 textStyle="heading.03" mb="space.03">
          What's New
        </styled.h1>
        <styled.p textStyle="body.01" color="ink.text-subdued">
          Stay up to date with the latest features, improvements, and bug fixes in Leather Wallet.
        </styled.p>
      </styled.div>

      <styled.div display="flex" flexDirection="column" gap="space.07">
        {changelogEntries.map(entry => (
          <styled.article
            key={entry.slug}
            border="1px solid"
            borderColor="ink.border-default"
            borderRadius="lg"
            p="space.05"
            backgroundColor="ink.background-primary"
          >
            <styled.header mb="space.04">
              <styled.div
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb="space.02"
              >
                <styled.h2
                  textStyle="heading.05"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeContent(entry.title),
                  }}
                />
                <styled.time textStyle="caption.01" color="ink.text-subdued" dateTime={entry.date}>
                  {formatDate(entry.date)}
                </styled.time>
              </styled.div>

              {entry.tags.length > 0 && (
                <styled.div display="flex" gap="space.02" flexWrap="wrap">
                  {entry.tags.map(tag => (
                    <styled.span
                      key={tag}
                      px="space.02"
                      py="space.01"
                      backgroundColor="ink.background-secondary"
                      borderRadius="sm"
                      textStyle="caption.01"
                      color="ink.text-subdued"
                    >
                      {sanitizeContent(tag)}
                    </styled.span>
                  ))}
                </styled.div>
              )}
            </styled.header>

            <styled.div
              textStyle="body.02"
              color="ink.text-primary"
              lineHeight="1.6"
              css={{
                '& h1': {
                  fontSize: 'var(--font-sizes-heading-05)',
                  fontWeight: 'var(--font-weights-medium)',
                  marginBottom: 'var(--spacing-space-03)',
                  marginTop: 'var(--spacing-space-04)',
                  '&:first-child': {
                    marginTop: 0,
                  },
                },
                '& h2': {
                  fontSize: 'var(--font-sizes-heading-06)',
                  fontWeight: 'var(--font-weights-medium)',
                  marginBottom: 'var(--spacing-space-02)',
                  marginTop: 'var(--spacing-space-04)',
                  '&:first-child': {
                    marginTop: 0,
                  },
                },
                '& h3': {
                  fontSize: 'var(--font-sizes-body-01)',
                  fontWeight: 'var(--font-weights-medium)',
                  marginBottom: 'var(--spacing-space-02)',
                  marginTop: 'var(--spacing-space-03)',
                },
                '& p': {
                  marginBottom: 'var(--spacing-space-03)',
                  '&:last-child': {
                    marginBottom: 0,
                  },
                },
                '& ul': {
                  marginBottom: 'var(--spacing-space-03)',
                  paddingLeft: 'var(--spacing-space-05)',
                },
                '& li': {
                  marginBottom: 'var(--spacing-space-01)',
                },
              }}
              dangerouslySetInnerHTML={{
                __html: entry.content,
              }}
            />
          </styled.article>
        ))}
      </styled.div>

      {changelogEntries.length === 0 && (
        <styled.div textAlign="center" py="space.07" color="ink.text-subdued">
          <styled.p textStyle="body.01">
            No changelog entries found. Check back soon for updates!
          </styled.p>
        </styled.div>
      )}

      <Page.Divider my="space.07" />
    </Page>
  );
}
