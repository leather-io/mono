import { ReactNode } from 'react';

import * as RadixTooltip from '@radix-ui/react-tooltip';

import { Tooltip } from './tooltip.web';

interface BasicTooltipProps {
  children: ReactNode;
  label?: string | ReactNode;
  disabled?: boolean;
  side?: RadixTooltip.TooltipContentProps['side'];
  asChild?: boolean;
}

export function BasicTooltip({ children, label, disabled, side, asChild }: BasicTooltipProps) {
  const isDisabled = !label || disabled;
  return (
    <Tooltip.Root delayDuration={400}>
      <Tooltip.Trigger asChild={asChild}>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content hidden={isDisabled} side={side} sideOffset={5}>
          {label}
          <Tooltip.Arrow />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
