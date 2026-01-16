import { ReactNode } from 'react';

import * as RadixTooltip from '@radix-ui/react-tooltip';
import { css } from 'leather-styles/css';

import { Tooltip } from './tooltip';

interface BasicTooltipProps extends RadixTooltip.TooltipTriggerProps {
  children: ReactNode;
  label?: string | ReactNode;
  disabled?: boolean;
  side?: RadixTooltip.TooltipContentProps['side'];
  variant?: 'sm' | 'md';
}

export function BasicTooltip({
  children,
  label,
  disabled,
  side,
  variant = 'md',
  ...props
}: BasicTooltipProps) {
  const isDisabled = !label || disabled;
  const matchClassName = {
    sm: css({ px: 'space.01' }),
    md: undefined,
  };
  return (
    <Tooltip.Root>
      <Tooltip.Trigger {...props}>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          hidden={isDisabled}
          side={side}
          sideOffset={5}
          className={matchClassName[variant]}
        >
          {label}
          <Tooltip.Arrow />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
