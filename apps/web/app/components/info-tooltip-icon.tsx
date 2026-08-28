import { styled } from 'leather-styles/jsx';
import type { ColorToken } from 'leather-styles/tokens';
import { BasicHoverCard } from '~/components/basic-hover-card';

import { InfoCircleIcon } from '@leather.io/ui';

interface InfoTooltipIconProps {
  title: string;
  explanation: string;
  ariaLabel: string;
  size?: number;
  color?: ColorToken;
}

// Kept in the text flow rather than made a flex sibling, so the icon follows the
// last word wherever the label wraps instead of detaching to the right. A flex
// parent would blockify HoverCard.Trigger's anchor and break that.
export function InfoTooltipIcon({
  title,
  explanation,
  ariaLabel,
  size = 16,
  color = 'ink.text-subdued',
}: InfoTooltipIconProps) {
  return (
    <BasicHoverCard title={title} content={explanation}>
      <styled.span
        display="inline-flex"
        alignItems="center"
        height="1lh"
        verticalAlign="top"
        ml="space.01"
        cursor="help"
        aria-label={ariaLabel}
      >
        <InfoCircleIcon variant="small" width={size} height={size} color={color} />
      </styled.span>
    </BasicHoverCard>
  );
}
