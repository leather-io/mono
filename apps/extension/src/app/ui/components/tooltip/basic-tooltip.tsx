import { ReactNode } from 'react';

import * as RadixTooltip from '@radix-ui/react-tooltip';

import { Tooltip } from './tooltip';

interface BasicTooltipProps extends RadixTooltip.TooltipTriggerProps {
  children: ReactNode;
  label?: string | ReactNode;
  disabled?: boolean;
  side?: RadixTooltip.TooltipContentProps['side'];
}

export function BasicTooltip({ children, label, disabled, side, ...props }: BasicTooltipProps) {
  const isDisabled = !label || disabled;
  return (
    <Tooltip.Root>
      <Tooltip.Trigger {...props}>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content hidden={isDisabled} side={side} sideOffset={5}>
          {label}
          <Tooltip.Arrow />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
