import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import type { Reference } from './exploration-config';
import { Thumb } from './lightbox';
import { RailDisclosure } from './section';

const cardWidth = 136;
const cardGap = 16;
const imageHeight = 236;

// An imported URL ("/app/…/x.png", "/assets/x-hash.png", "data:…", "https://…")
// is used as is; a bare file name is joined to `path`.
function imageSrc(image: string, path: string | undefined) {
  if (!path || /^(\/|[a-z][a-z0-9+.-]*:)/i.test(image)) return image;
  return `${path}/${image}`;
}

export interface InspirationItem {
  reference: Reference<string>;
  usedBy: string[];
  current: boolean;
}

function CardLabel({ item }: { item: InspirationItem }) {
  return (
    <Stack gap="0">
      <styled.span textStyle="label.03" color="ink.text-primary">
        {item.reference.app}
      </styled.span>
      <styled.span textStyle="caption.01" color="ink.text-secondary">
        {item.reference.took}
      </styled.span>
      <styled.span textStyle="caption.02" color="ink.text-subdued">
        {`Used in ${item.usedBy.join(', ')}`}
      </styled.span>
    </Stack>
  );
}

function Card({ item, path }: { item: InspirationItem; path?: string }) {
  const { reference } = item;
  if (!reference.image)
    return (
      <Stack gap="space.02" style={{ width: cardWidth }} flexShrink={0}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          style={{ height: imageHeight }}
          borderWidth={1}
          borderStyle="solid"
          borderColor="ink.border-default"
          borderRadius="xs"
          bg="ink.background-secondary"
        >
          <styled.span textStyle="caption.02" color="ink.text-subdued">
            Text source
          </styled.span>
        </Box>
        <CardLabel item={item} />
      </Stack>
    );
  return (
    <Thumb
      src={imageSrc(reference.image, path)}
      caption={`${reference.app} · ${reference.took}`}
      width={reference.wide ? cardWidth * 2 + cardGap : cardWidth}
      height={imageHeight}
      fit="contain"
    >
      <CardLabel item={item} />
    </Thumb>
  );
}

interface InspirationProps {
  items: InspirationItem[];
  path?: string;
}

export function Inspiration({ items, path }: InspirationProps) {
  if (items.length === 0) return null;
  const apps = new Set(items.map(item => item.reference.app));
  return (
    <RailDisclosure
      title="Inspiration"
      meta={`${items.length} screens · ${[...apps].join(' · ')}`}
      defaultOpen
    >
      <Flex columnGap={`${cardGap}px`} rowGap="space.05" flexWrap="wrap" alignItems="flex-start">
        {items.map(item => (
          <Card
            key={`${item.reference.app}-${item.reference.image ?? item.reference.took}`}
            item={item}
            path={path}
          />
        ))}
      </Flex>
    </RailDisclosure>
  );
}
