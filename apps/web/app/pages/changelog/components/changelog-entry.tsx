import { createContext, useContext } from 'react';
import { Link } from 'react-router';

import { Box, BoxProps, HTMLStyledProps, styled } from 'leather-styles/jsx';
import PortableTextContent from '~/components/content/portable-text-content';
import { urlFor } from '~/constants/cms-client';

import type { ChangelogEntryBySlugQueryResult } from '@leather.io/cms';

const ChangelogEntryContext = createContext<ChangelogEntryBySlugQueryResult>(null);

function useChangelogEntry() {
  const context = useContext(ChangelogEntryContext);
  if (!context) throw new Error('Changelog entry components must be used within a ChangelogEntry');
  return context;
}

interface ChangelogEntryProps extends HTMLStyledProps<'article'> {
  entry: ChangelogEntryBySlugQueryResult;
}
export function ChangelogEntry({ entry, ...props }: ChangelogEntryProps) {
  return (
    <ChangelogEntryContext.Provider value={entry}>
      <styled.article {...props} />
    </ChangelogEntryContext.Provider>
  );
}

function Title(props: HTMLStyledProps<'h1'>) {
  const entry = useChangelogEntry();
  return (
    <styled.h3
      textStyle="heading.03"
      _hover={{ color: 'ink.action-primary-hover' }}
      mt="space.02"
      mb="space.04"
      {...props}
    >
      <Link to={`/changelog/${entry.slug.current}`} style={{ color: 'inherit' }}>
        {entry.title}
      </Link>
    </styled.h3>
  );
}

function PublishDate(props: HTMLStyledProps<'time'>) {
  const entry = useChangelogEntry();
  const formattedDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(
    new Date(entry.publishedAt)
  );
  return (
    <styled.time
      textStyle="label.02"
      color="ink.text-subdued"
      dateTime={entry.publishedAt}
      {...props}
    >
      {formattedDate}
    </styled.time>
  );
}

function Image(props: HTMLStyledProps<'img'>) {
  const entry = useChangelogEntry();
  if (!entry.heroImage?.asset?._ref) return null;
  return (
    <styled.img
      src={urlFor(entry.heroImage)
        .format('webp')
        .width(800)
        .height(450)
        .auto('format')
        .quality(75)
        .url()}
      mt="space.02"
      mb="space.04"
      alt={entry.title}
      loading="eager"
      rel="preload"
      {...props}
    />
  );
}

function Body(props: BoxProps) {
  const entry = useChangelogEntry();
  return (
    <Box {...props}>
      <PortableTextContent value={entry.body} />
    </Box>
  );
}

ChangelogEntry.Title = Title;
ChangelogEntry.PublishDate = PublishDate;
ChangelogEntry.Image = Image;
ChangelogEntry.Body = Body;
