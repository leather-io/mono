import { css } from 'leather-styles/css';
import { Box, Stack, styled } from 'leather-styles/jsx';

import { isString } from '@leather.io/utils';

const captureModules = import.meta.glob('../captures/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

export function getCaptureUrl(id: string) {
  const url = captureModules[`../captures/${id}.png`];
  return isString(url) ? url : undefined;
}

const hiddenScrollbar = css({
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
});

interface CaptureFrameProps {
  captureId: string;
}

export function CaptureFrame({ captureId }: CaptureFrameProps) {
  const url = getCaptureUrl(captureId);
  return (
    <Stack gap="space.02" flexShrink={0}>
      <styled.span textStyle="caption.02" color="ink.text-subdued">
        Today · real capture, 4 Aug 2026
      </styled.span>
      <Box
        position="relative"
        width="popupWidth"
        height="popupHeight"
        overflowY="auto"
        className={hiddenScrollbar}
        borderWidth={1}
        borderColor="ink.border-default"
        borderRadius="sm"
        bg="ink.background-secondary"
      >
        {url ? (
          <styled.img src={url} alt="" display="block" width="100%" />
        ) : (
          <styled.p p="space.05" textStyle="caption.01" color="ink.text-subdued">
            No capture for this screen yet.
          </styled.p>
        )}
      </Box>
    </Stack>
  );
}
