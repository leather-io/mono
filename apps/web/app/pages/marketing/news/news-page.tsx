import { useId, useState } from 'react';
import { Link } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { LoadMoreButton } from '~/pages/posts/posts-index-load-more';

import { type NewsItem, getNewsCover, newsListPageSize } from './news.data';

function postHref(slug: string) {
  return `/posts/${slug}`;
}

interface NewsCoverImageProps {
  slug: string;
  sizes: string;
  eager?: boolean;
}

function NewsCoverImage({ slug, sizes, eager }: NewsCoverImageProps) {
  const cover = getNewsCover(slug);

  return (
    <Box
      position="relative"
      width="100%"
      aspectRatio="16 / 10"
      overflow="hidden"
      borderRadius="xs"
      bg="ink.background-secondary"
    >
      {cover && (
        <styled.img
          src={cover.src}
          srcSet={cover.largeSrc ? `${cover.src} 720w, ${cover.largeSrc} 1280w` : undefined}
          sizes={cover.largeSrc ? sizes : undefined}
          // Decorative: every cover sits next to its post title inside the same link.
          alt=""
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          position="absolute"
          inset={0}
          width="100%"
          height="100%"
          objectFit="cover"
        />
      )}
    </Box>
  );
}

function FeaturedNews({ item }: { item: NewsItem }) {
  return (
    <Link to={postHref(item.slug)}>
      <Flex
        flexDirection={{ base: 'column-reverse', md: 'row' }}
        gap={{ base: 'space.05', md: 'space.07' }}
        pb={{ base: 'space.06', md: 'space.07' }}
        borderBottom="default"
        _hover={{ '& h2': { textDecoration: 'underline' } }}
      >
        <Flex flexDirection="column" gap="space.03" flex="1">
          <styled.h2 textStyle="heading.03" textTransform="uppercase" color="ink.text-primary">
            {item.title}
          </styled.h2>
          {item.description && (
            <styled.p textStyle="body.02" color="ink.text-primary" maxWidth="460px">
              {item.description}
            </styled.p>
          )}
        </Flex>
        <Box flex="1" minWidth={0}>
          <NewsCoverImage slug={item.slug} sizes="(min-width: 768px) 50vw, 100vw" eager />
        </Box>
      </Flex>
    </Link>
  );
}

function NewsRow({ item }: { item: NewsItem }) {
  return (
    <styled.li borderBottom="default">
      <Link to={postHref(item.slug)}>
        <Flex
          flexDirection={{ base: 'column', md: 'row' }}
          alignItems={{ base: 'stretch', md: 'center' }}
          gap={{ base: 'space.04', md: 'space.05' }}
          py="space.05"
          _hover={{ '& h3': { textDecoration: 'underline' } }}
        >
          <Box width={{ base: '100%', md: '120px' }} flexShrink={0}>
            <NewsCoverImage slug={item.slug} sizes="(min-width: 768px) 120px, 100vw" />
          </Box>
          <styled.h3 textStyle="body.01" color="ink.text-primary">
            {item.title}
          </styled.h3>
        </Flex>
      </Link>
    </styled.li>
  );
}

interface NewsPageProps {
  items: NewsItem[];
}

export function NewsPage({ items }: NewsPageProps) {
  const listId = useId();
  const [visibleCount, setVisibleCount] = useState(newsListPageSize);
  const [featured, ...rest] = items;

  if (!featured) {
    return (
      <styled.p textStyle="body.01" color="ink.text-subdued" py="space.07">
        No news yet.
      </styled.p>
    );
  }

  return (
    <Box pt={{ base: 'space.05', md: 'space.07' }}>
      <FeaturedNews item={featured} />

      <styled.ul id={listId} listStyleType="none">
        {rest.slice(0, visibleCount).map(item => (
          <NewsRow key={item.slug} item={item} />
        ))}
      </styled.ul>

      {rest.length > visibleCount && (
        <LoadMoreButton
          controls={listId}
          onClick={() => setVisibleCount(count => count + newsListPageSize)}
        />
      )}
    </Box>
  );
}
