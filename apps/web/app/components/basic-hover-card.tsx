import { ReactNode } from 'react';

import { styled } from 'leather-styles/jsx';

import { HasChildren, HoverCard } from '@leather.io/ui';

interface BasicHoverCardProps extends HasChildren {
  content: ReactNode;
}
export function BasicHoverCard({ children, content }: BasicHoverCardProps) {
  return (
    <HoverCard.Root openDelay={220}>
      <HoverCard.Trigger>{children}</HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content side="top">
          <styled.p textAlign="left" textWrapStyle="pretty" color="ink.text-primary">
            {content}
          </styled.p>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
