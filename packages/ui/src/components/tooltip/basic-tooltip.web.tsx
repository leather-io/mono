import { ReactNode } from 'react';

import { css } from 'leather-styles/css';
import { Tooltip as RadixTooltip } from 'radix-ui';

import { Tooltip } from './tooltip.web';

const variantClassName = {
  sm: css({ px: 'space.01' }),
  md: undefined,
};

interface BasicTooltipProps extends RadixTooltip.TooltipTriggerProps {
  children: ReactNode;
  label?: string | ReactNode;
  disabled?: boolean;
  side?: RadixTooltip.TooltipContentProps['side'];
  variant?: keyof typeof variantClassName;
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
  return (
    <Tooltip.Root delayDuration={400}>
      <Tooltip.Trigger {...props}>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          hidden={isDisabled}
          side={side}
          sideOffset={5}
          className={variantClassName[variant]}
        >
          {label}
          <Tooltip.Arrow />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
