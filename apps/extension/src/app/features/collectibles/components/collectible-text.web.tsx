import { useMemo } from 'react';

import { Box, styled } from 'leather-styles/jsx';

import { Iframe } from '@app/ui/components/iframe';

import { CollectibleCard } from './collectible-card.web';

interface CollectibleTextProps {
  src: string;
  height?: number;
  onPress?(): void;
}

const htmlRegex = /<\w+[\s\S]*?>/;

function createHtmlDataUrl(html: string): string {
  const wrappedHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      padding: 16px;
      font-family: system-ui, sans-serif;
      background: #12100f;
      color: #f5f1ed;
      overflow: hidden;
    }
  </style>
</head>
<body>${html}</body>
</html>`;
  return `data:text/html;charset=utf-8,${encodeURIComponent(wrappedHtml)}`;
}

export function CollectibleText({ src, height = 200, onPress }: CollectibleTextProps) {
  const preview = typeof src === 'string' ? src.slice(0, 512) : '';
  const isHtml = htmlRegex.test(preview);

  const dataUrl = useMemo(() => (isHtml ? createHtmlDataUrl(src) : null), [isHtml, src]);

  const content = isHtml ? (
    <Box height={height} overflow="hidden">
      <Iframe
        src={dataUrl!}
        height="100%"
        width="100%"
        onError={() => {
          // Silently handle errors - the iframe will show blank
        }}
      />
    </Box>
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
        <styled.button
          type="button"
          onClick={onPress}
          border="none"
          p={0}
          m={0}
          bg="transparent"
          width="100%"
        >
          {content}
        </styled.button>
      </CollectibleCard>
    );
  }

  return <CollectibleCard height={height}>{content}</CollectibleCard>;
}
