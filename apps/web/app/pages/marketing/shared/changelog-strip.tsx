import { Link } from 'react-router';

import { Box, Flex, type HTMLStyledProps, styled } from 'leather-styles/jsx';
import { getChangelogEntries } from '~/pages/changelog/changelog.data';

import { trackMarketingEvent } from './marketing-analytics';
import { Reveal } from './reveal';

const StyledLink = styled(Link);

export interface ChangelogStripEntry {
  slug: string;
  title: string;
  /** ISO publish date. */
  date?: string;
  imageUrl?: string;
}

/**
 * Loader helper: the latest changelog entries for the strip, newest first. Never throws, so a
 * content problem can't take down a marketing page; the strip just renders nothing.
 */
export function getChangelogStrip(limit = 4): ChangelogStripEntry[] {
  try {
    return getChangelogEntries()
      .slice(0, limit)
      .map(entry => ({
        slug: entry.slug,
        title: entry.title,
        date: entry.publishedAt,
        imageUrl: entry.cover,
      }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load changelog strip', error);
    return [];
  }
}

function formatChangelogDate(date: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(
    new Date(date)
  );
}

interface ChangelogStripProps extends HTMLStyledProps<'section'> {
  entries: ChangelogStripEntry[];
  /** Section heading. Defaults to "Changelog". */
  heading?: string;
}

/** "CHANGELOG" section with the latest entries as a 4-up card row (stacked on mobile). */
export function ChangelogStrip({ entries, heading = 'Changelog', ...props }: ChangelogStripProps) {
  if (!entries.length) return null;
  return (
    <styled.section aria-labelledby="changelog-strip-heading" {...props}>
      <Reveal>
        <Flex
          flexDir={['column', null, 'row']}
          alignItems={[null, null, 'flex-end']}
          justifyContent="space-between"
          gap="space.03"
          mb="space.06"
        >
          <styled.h2 id="changelog-strip-heading" textStyle="heading.03">
            {heading}
          </styled.h2>
          <StyledLink
            to="/changelog"
            prefetch="intent"
            alignSelf="flex-start"
            textStyle="label.03"
            fontSize="14px"
            borderBottom="1px solid"
            borderColor="ink.text-primary"
            _hover={{ color: 'ink.action-primary-hover' }}
            mb={[null, null, 'space.01']}
          >
            View the changelog
          </StyledLink>
        </Flex>
      </Reveal>
      <styled.ul
        display="grid"
        gridTemplateColumns={['1fr', null, 'repeat(2, 1fr)', `repeat(${entries.length}, 1fr)`]}
        gap="0"
        border="1px solid"
        borderColor="ink.border-default"
        borderRadius="md"
        overflow="hidden"
        listStyle="none"
      >
        {entries.map(entry => (
          <styled.li
            key={entry.slug}
            // Hairline dividers between cards that work for every column count
            boxShadow="-1px -1px 0 0 {colors.ink.border-default}"
          >
            <StyledLink
              to={`/changelog/${entry.slug}`}
              prefetch="intent"
              onClick={() => trackMarketingEvent('changelog_entry_clicked', { slug: entry.slug })}
              display="flex"
              flexDir="column"
              height="100%"
              minHeight="186px"
              p="space.05"
              transition="background 120ms ease"
              _hover={{ bg: 'ink.component-background-hover' }}
              _focusVisible={{
                outline: '2px solid',
                outlineColor: 'blue.border',
                outlineOffset: '-2px',
              }}
            >
              {entry.date && (
                <styled.time dateTime={entry.date} textStyle="label.03" color="ink.text-secondary">
                  {formatChangelogDate(entry.date)}
                </styled.time>
              )}
              <Box mt="auto" pt="space.07">
                <styled.h3 textStyle="heading.05" fontWeight="400" lineHeight="1.25">
                  {entry.title}
                </styled.h3>
              </Box>
            </StyledLink>
          </styled.li>
        ))}
      </styled.ul>
    </styled.section>
  );
}
