// Fixture: a tooltip rebuilt straight on the Radix primitive.
import type { ReactNode } from 'react';

import * as RadixTooltip from '@radix-ui/react-tooltip';
import { styled } from 'leather-styles/jsx';

interface InfoTooltipProps {
  label: string;
  side?: 'top' | 'bottom';
  children: ReactNode;
}

export function InfoTooltip({ label, side = 'top', children }: InfoTooltipProps) {
  return (
    <RadixTooltip.Root delayDuration={300}>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content side={side}>
          <styled.span
            textStyle="caption.01"
            bg="black"
            color="white"
            px="space.02"
            borderRadius="xs"
          >
            {label}
          </styled.span>
          <RadixTooltip.Arrow />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
