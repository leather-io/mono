import { useMemo } from 'react';

import { Box, styled } from 'leather-styles/jsx';

import { Iframe } from '@app/ui/components/iframe';

import { CollectibleCard } from './collectible-card';

interface CollectibleTextProps {
  src: string;
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

function TextHtmlPreview({ dataUrl }: { dataUrl: string }) {
  return (
    <Box width="100%" height="100%" overflow="hidden">
      <Iframe src={dataUrl} height="100%" width="100%" />
    </Box>
  );
}

function formatTextContent(src: string): string {
  try {
    const parsed = JSON.parse(src);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return src;
  }
}

function TextPreview({ src }: { src: string }) {
  return (
    <Box bg="#12100f" width="100%" height="100%" overflow="hidden" p="space.03">
      <styled.pre
        color="#f5f1ed"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        fontSize="11px"
        lineHeight="1.4"
        margin="0"
        whiteSpace="pre-wrap"
        wordBreak="break-all"
      >
        {formatTextContent(src)}
      </styled.pre>
    </Box>
  );
}

export function CollectibleText({ src, onPress }: CollectibleTextProps) {
  const preview = typeof src === 'string' ? src.slice(0, 512) : '';
  const isHtml = htmlRegex.test(preview);

  const dataUrl = useMemo(() => (isHtml ? createHtmlDataUrl(src) : null), [isHtml, src]);

  const contentElement = isHtml ? (
    <TextHtmlPreview dataUrl={dataUrl!} />
  ) : (
    <TextPreview src={src} />
  );

  if (onPress) {
    return (
      <CollectibleCard>
        <styled.button
          type="button"
          onClick={onPress}
          border="none"
          p={0}
          m={0}
          bg="transparent"
          width="100%"
          height="100%"
        >
          {contentElement}
        </styled.button>
      </CollectibleCard>
    );
  }

  return <CollectibleCard>{contentElement}</CollectibleCard>;
}
