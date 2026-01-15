import { Box, styled } from 'leather-styles/jsx';

import { formatText } from './collectible-text.utils';

interface PlainTextContentProps {
  src: string;
  height: number;
}

export function PlainTextContent({ src, height }: PlainTextContentProps) {
  return (
    <Box bg="ink.text-primary" height={height} overflow="hidden" p="space.04">
      <styled.pre color="ink.background-secondary" fontFamily="mono" fontSize="sm">
        {formatText(src)}
      </styled.pre>
    </Box>
  );
}
