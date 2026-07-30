import { ReactNode } from 'react';

import { Stack, styled } from 'leather-styles/jsx';

import { HasChildren, HoverCard } from '@leather.io/ui';

interface BasicHoverCardProps extends HasChildren {
  title?: ReactNode;
  content: ReactNode;
  align?: 'start' | 'center' | 'end';
}

// HoverCard.Content already supplies the padding and max width, so nothing here
// adds its own — a second layer is what made these read as over-padded.
export function BasicHoverCard({
  children,
  title,
  content,
  align = 'center',
}: BasicHoverCardProps) {
  return (
    <HoverCard.Root openDelay={220}>
      <HoverCard.Trigger>{children}</HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content side="top" align={align}>
          <Stack gap="space.01" textAlign="left">
            {title && (
              <styled.span textStyle="caption.01" fontWeight={500} color="ink.text-primary">
                {title}
              </styled.span>
            )}
            <styled.p textStyle="caption.01" color="ink.text-subdued" textWrapStyle="pretty">
              {content}
            </styled.p>
          </Stack>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
