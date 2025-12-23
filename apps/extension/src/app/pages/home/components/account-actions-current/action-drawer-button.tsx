import { type ReactNode } from 'react';

import { ItemLayout } from '@leather.io/ui';

import { IconWrapper } from '@app/components/icon-wrapper';

interface ActionDrawerButtonProps {
  title: string;
  caption: string;
  icon: ReactNode;
  onClick(): void;
}

export function ActionDrawerButton({ title, caption, icon, onClick }: ActionDrawerButtonProps) {
  return (
    <button onClick={onClick}>
      <ItemLayout
        showChevron
        titleRight={null}
        img={<IconWrapper>{icon}</IconWrapper>}
        titleLeft={title}
        captionLeft={caption}
      />
    </button>
  );
}
