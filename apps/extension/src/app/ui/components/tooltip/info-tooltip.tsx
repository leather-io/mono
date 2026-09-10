import { styled } from 'leather-styles/jsx';

import { InfoCircleIcon } from '@leather.io/ui';

import { BasicTooltip } from './basic-tooltip';

interface InfoTooltipProps {
  label?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  size?: 14 | 16;
}

// The span is required: svgr runs without `ref: true`, so an icon passed
// straight to `asChild` gives Radix no node to trigger on
export function InfoTooltip({ label, side = 'top', size = 16 }: InfoTooltipProps) {
  if (!label) return null;
  return (
    <BasicTooltip label={label} side={side} asChild>
      <styled.span display="flex" alignItems="center" flexShrink={0}>
        <InfoCircleIcon color="ink.text-subdued" variant="small" width={size} height={size} />
      </styled.span>
    </BasicTooltip>
  );
}
