import { type ReactNode } from 'react';

import { css } from 'leather-styles/css';
import { Box } from 'leather-styles/jsx';

import { InfoCircleIcon, Tooltip } from '@leather.io/ui';

const leftAlignedContent = css({ textAlign: 'left' });

interface SwapReviewInfoTooltipProps {
  label: ReactNode;
}

export function SwapReviewInfoTooltip({ label }: SwapReviewInfoTooltipProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger>
        <Box _hover={{ cursor: 'pointer' }} color="ink.text-subdued" ml="space.01">
          <InfoCircleIcon variant="small" color="ink.text-subdued" />
        </Box>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content side="bottom" sideOffset={5} className={leftAlignedContent}>
          {label}
          <Tooltip.Arrow />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
