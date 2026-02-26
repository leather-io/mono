import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useFetcher } from 'react-router';

import { Box } from 'leather-styles/jsx/box';
import { styled } from 'leather-styles/jsx/factory';
import { Flex } from 'leather-styles/jsx/flex';

import { ChevronRightIcon, MagnifyingGlassIcon } from '@leather.io/ui';

interface SearchResult {
  _id: string;
  title: string;
  slug: { current: string };
  categories: { _id: string; name: string; slug: { current: string } }[];
}

interface SearchResponse {
  results: SearchResult[];
}

export function GuideSearch() {
  const fetcher = useFetcher<SearchResponse>();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const results = fetcher.data?.results ?? [];

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (value.length < 2) {
        setIsOpen(false);
        return;
      }

      debounceRef.current = setTimeout(() => {
        void fetcher.load(`/support/search?q=${encodeURIComponent(value)}`);
        setIsOpen(true);
      }, 300);
    },
    [fetcher]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') setIsOpen(false);
  }

  return (
    <Box ref={containerRef} position="relative" width="100%">
      <Flex
        alignItems="center"
        justifyContent="space-between"
        height="48px"
        px="space.05"
        border="default"
        borderRadius="100px"
      >
        <styled.input
          type="text"
          placeholder="Search help articles..."
          value={query}
          onChange={e => handleSearch(e.target.value)}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          textStyle="body.02"
          color="ink.text-primary"
          bg="transparent"
          border="none"
          outline="none"
          flex="1"
          _placeholder={{ color: 'ink.text-subdued' }}
        />
        <styled.span flexShrink={0} color="ink.text-subdued">
          <MagnifyingGlassIcon />
        </styled.span>
      </Flex>

      {isOpen && (
        <Box
          position="absolute"
          top="56px"
          left={0}
          right={0}
          zIndex={10}
          bg="ink.background-primary"
          border="default"
          borderRadius="md"
          p="space.03"
          boxShadow="0px 4px 16px rgba(0, 0, 0, 0.08)"
        >
          {results.length === 0 && fetcher.state === 'idle' && (
            <styled.p textStyle="body.02" color="ink.text-subdued" p="space.03">
              No results found
            </styled.p>
          )}
          {fetcher.state === 'loading' && (
            <styled.p textStyle="body.02" color="ink.text-subdued" p="space.03">
              Searching...
            </styled.p>
          )}
          <styled.ul listStyleType="none">
            {results.map(result => {
              const href = `/support/${result.slug.current}`;
              return (
                <styled.li
                  key={result._id}
                  cursor="pointer"
                  _hover={{ bg: 'ink.component-background-hover', borderRadius: 'sm' }}
                >
                  <Link
                    to={href}
                    onClick={() => setIsOpen(false)}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <styled.span
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      p="space.03"
                      textStyle="label.02"
                      color="ink.action-primary-default"
                    >
                      {result.title}
                      <ChevronRightIcon variant="small" />
                    </styled.span>
                  </Link>
                </styled.li>
              );
            })}
          </styled.ul>
        </Box>
      )}
    </Box>
  );
}
