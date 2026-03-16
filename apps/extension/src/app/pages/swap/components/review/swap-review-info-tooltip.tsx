import { ReactNode } from 'react';

import { css } from 'leather-styles/css';
import { Box } from 'leather-styles/jsx';

import { InfoCircleIcon } from '@leather.io/ui';

import { Tooltip } from '@app/ui/components/tooltip/tooltip';

const leftAlignedContent = css({ textAlign: 'left' });

interface SwapReviewInfoTooltipProps {
  label: ReactNode;
}

export function SwapReviewInfoTooltip({ label }: SwapReviewInfoTooltipProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger>
        <Box _hover={{ cursor: 'pointer' }} color="ink.text-subdued" ml="space.01">
          <InfoCircleIcon variant="small" />
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
