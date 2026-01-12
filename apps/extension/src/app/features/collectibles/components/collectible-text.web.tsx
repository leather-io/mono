import { Box, styled } from 'leather-styles/jsx';

import { sanitizeContent } from '@leather.io/utils/sanitize-content';

import { CollectibleCard } from './collectible-card.web';

interface CollectibleTextProps {
  src: string;
  height?: number;
  onPress?(): void;
}

const htmlRegex = /<\w+[\s\S]*?>/;

export function CollectibleText({ src, height = 200, onPress }: CollectibleTextProps) {
  const preview = typeof src === 'string' ? src.slice(0, 512) : '';
  const isHtml = htmlRegex.test(preview);
  // FIXME:   dangerouslySetInnerHTML={{ __html: sanitizeContent(src) }} is unsafe here
  const content = isHtml ? (
    <Box
      dangerouslySetInnerHTML={{ __html: sanitizeContent(src) }}
      color="ink.background-secondary"
      bg="ink.text-primary"
      height={height}
      overflow="hidden"
      p="space.04"
    />
  ) : (
    <Box bg="ink.text-primary" height={height} overflow="hidden" p="space.04">
      <styled.pre color="ink.background-secondary" fontFamily="mono" fontSize="sm">
        {(() => {
          try {
            const parsed = JSON.parse(src);
            return JSON.stringify(parsed, null, 2);
          } catch {
            return src;
          }
        })()}
      </styled.pre>
    </Box>
  );

  if (onPress) {
    return (
      <CollectibleCard height={height}>
        <button
          type="button"
          onClick={onPress}
          style={{ border: 0, padding: 0, margin: 0, background: 'transparent', width: '100%' }}
        >
          {content}
        </button>
      </CollectibleCard>
    );
  }

  return <CollectibleCard height={height}>{content}</CollectibleCard>;
}
