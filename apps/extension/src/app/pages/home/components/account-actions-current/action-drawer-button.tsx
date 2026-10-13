import type { ComponentProps } from 'react';

import { Avatar, ItemLayout } from '@leather.io/ui';

interface ActionDrawerButtonProps {
  title: string;
  caption: string;
  icon: ComponentProps<typeof Avatar>['icon'] | null;
  onClick(): void;
}

export function ActionDrawerButton({ title, caption, icon, onClick }: ActionDrawerButtonProps) {
  return (
    <button onClick={onClick}>
      <ItemLayout
        showChevron
        titleRight={null}
        img={
          <Avatar
            size="lg"
            bg="ink.component-background-hover"
            outlineColor="ink.component-background-hover"
            icon={icon ?? undefined}
          />
        }
        titleLeft={title}
        captionLeft={caption}
      />
    </button>
  );
}
