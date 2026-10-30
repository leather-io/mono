import { useId, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';
import {
  listRowEntranceDelay,
  listRowEntranceStyles,
  useListEntrance,
} from '~/pages/marketing/shared/list-entrance';

import { CloseIcon, MagnifyingGlassIcon } from '@leather.io/ui';

import { LoadMoreButton } from './posts-index-load-more';
import { type PostsIndexItem, filterPosts, postsIndexPageSize } from './posts-index.utils';

const searchParamKey = 'q';

interface PostsIndexProps {
  posts: PostsIndexItem[];
}

export function PostsIndex({ posts }: PostsIndexProps) {
  const listId = useId();
  const [searchParams, setSearchParams] = useSearchParams();
  // The search box is seeded from ?q= (so filtered views are shareable) and writes back to it
  // with history.replace, so typing never piles up history entries.
  const [query, setQuery] = useState(() => searchParams.get(searchParamKey) ?? '');
  const [visibleCount, setVisibleCount] = useState(postsIndexPageSize);
  const isEntering = useListEntrance();

  const results = useMemo(() => filterPosts(posts, query), [posts, query]);
  const visibleResults = results.slice(0, visibleCount);
  const hasQuery = query.trim().length > 0;

  function updateQuery(value: string) {
    setQuery(value);
    setVisibleCount(postsIndexPageSize);
    setSearchParams(
      current => {
        const next = new URLSearchParams(current);
        if (value.trim()) next.set(searchParamKey, value);
        else next.delete(searchParamKey);
        return next;
      },
      { replace: true, preventScrollReset: true }
    );
  }

  return (
    <Box>
      <styled.form
        role="search"
        onSubmit={e => e.preventDefault()}
        display="flex"
        alignItems="center"
        gap="space.03"
        height="64px"
        borderBottom="default"
        _focusWithin={{ borderColor: 'ink.text-primary' }}
      >
        <MagnifyingGlassIcon variant="small" color="ink.text-subdued" aria-hidden />
        <styled.input
          type="search"
          name={searchParamKey}
          aria-label="Search posts"
          aria-controls={listId}
          placeholder={`Search ${posts.length} items...`}
          value={query}
          onChange={e => updateQuery(e.target.value)}
          onKeyDown={e => e.key === 'Escape' && updateQuery('')}
          autoComplete="off"
          flex="1"
          minWidth={0}
          height="100%"
          bg="transparent"
          border="none"
          outline="none"
          textStyle="body.02"
          color="ink.text-primary"
          _placeholder={{ color: 'ink.text-subdued' }}
          css={{ '&::-webkit-search-cancel-button': { display: 'none' } }}
        />
        {hasQuery && (
          <styled.button
            type="button"
            aria-label="Clear search"
            onClick={() => updateQuery('')}
            display="flex"
            p="space.02"
            borderRadius="xs"
            _hover={{ bg: 'ink.component-background-hover' }}
          >
            <CloseIcon variant="small" color="ink.text-subdued" />
          </styled.button>
        )}
      </styled.form>

      <styled.p srOnly aria-live="polite">
        {hasQuery ? `${results.length} ${results.length === 1 ? 'post' : 'posts'} found` : ''}
      </styled.p>

      {results.length === 0 ? (
        <styled.p textStyle="body.01" color="ink.text-subdued" py="space.07">
          No posts match “{query.trim()}”.
        </styled.p>
      ) : (
        <styled.ul id={listId} listStyleType="none">
          {visibleResults.map((post, index) => (
            <styled.li
              key={post.slug}
              borderBottom="default"
              className={isEntering ? listRowEntranceStyles : undefined}
              style={isEntering ? listRowEntranceDelay(index) : undefined}
            >
              <Link to={`/posts/${post.slug}`}>
                <Flex
                  flexDirection="column"
                  gap="space.02"
                  py="space.05"
                  _hover={{ '& h2': { textDecoration: 'underline' } }}
                >
                  <styled.h2 textStyle="heading.05" fontWeight="400" color="ink.text-primary">
                    {post.title}
                  </styled.h2>
                  {post.category && (
                    <styled.span textStyle="caption.01" color="ink.text-subdued">
                      {post.category}
                    </styled.span>
                  )}
                </Flex>
              </Link>
            </styled.li>
          ))}
        </styled.ul>
      )}

      {results.length > visibleCount && (
        <LoadMoreButton
          controls={listId}
          onClick={() => setVisibleCount(count => count + postsIndexPageSize)}
        />
      )}
    </Box>
  );
}
