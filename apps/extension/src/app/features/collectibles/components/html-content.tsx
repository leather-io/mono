import { Box } from 'leather-styles/jsx';

import { Iframe } from '@app/ui/components/iframe';

interface HtmlContentProps {
  dataUrl: string;
  height: number;
}

export function HtmlContent({ dataUrl, height }: HtmlContentProps) {
  return (
    <Box height={height} overflow="hidden">
      <Iframe
        src={dataUrl}
        height="100%"
        width="100%"
        onError={() => {
          // Silently handle errors - the iframe will show blank
        }}
      />
    </Box>
  );
}
