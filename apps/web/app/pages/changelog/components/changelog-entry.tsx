import { createContext, useContext } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import { Link } from 'react-router';

import { Box, type BoxProps, type HTMLStyledProps, styled } from 'leather-styles/jsx';
import remarkGfm from 'remark-gfm';
import { contentComponents } from '~/components/content/content-components';

import { type ChangelogEntry as ChangelogEntryData } from '../changelog.data';

const ChangelogEntryContext = createContext<ChangelogEntryData | null>(null);

const changelogBodyComponents: Components = {
  ...contentComponents,
  // Fenced code renders as a highlighted block on its own, so it needs no <pre> wrapper
  pre: ({ children }) => <>{children}</>,
  img: ({ src, alt }) => (
    <styled.img
      src={typeof src === 'string' ? src : undefined}
      maxW="100%"
      border="1px solid"
      borderColor="ink.border-transparent"
      borderRadius="md"
      alt={alt ?? ''}
      loading="lazy"
    />
  ),
};

function useChangelogEntry() {
  const context = useContext(ChangelogEntryContext);
  if (!context) throw new Error('Changelog entry components must be used within a ChangelogEntry');
  return context;
}

interface ChangelogEntryProps extends HTMLStyledProps<'article'> {
  entry: ChangelogEntryData;
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
      textStyle="heading.05"
      _hover={{ color: 'ink.action-primary-hover' }}
      mt="space.02"
      mb="space.04"
      {...props}
    >
      <Link to={`/changelog/${entry.slug}`} style={{ color: 'inherit' }}>
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
  if (!entry.cover) return null;
  return (
    <styled.img
      src={entry.cover}
      maxW="100%"
      border="1px solid"
      borderColor="ink.border-transparent"
      borderRadius="md"
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
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={changelogBodyComponents}>
        {entry.body}
      </ReactMarkdown>
    </Box>
  );
}

ChangelogEntry.Title = Title;
ChangelogEntry.PublishDate = PublishDate;
ChangelogEntry.Image = Image;
ChangelogEntry.Body = Body;
