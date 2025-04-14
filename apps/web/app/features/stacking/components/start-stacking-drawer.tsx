import { Dispatch, SetStateAction } from 'react';

import { css } from 'leather-styles/css';
import { Flex, styled } from 'leather-styles/jsx';
import { Drawer } from 'vaul';

import { HasChildren } from '@leather.io/ui';

interface StartPooledStackingDrawerProps extends HasChildren {
  drawerOpen: boolean;
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
}

export function StartStackingDrawer({
  drawerOpen,
  setDrawerOpen,
  children,
}: StartPooledStackingDrawerProps) {
  return (
    <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
      <Drawer.Portal>
        <Drawer.Overlay
          className={css({
            pos: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            bg: 'rgba(0,0,0,0.4)',
          })}
        />
        <Drawer.Title />
        <Drawer.Description />
        <Drawer.Content
          className={css({
            h: 'fit-content',
            pos: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            outline: 'none',
            zIndex: 'max',
          })}
        >
          <styled.svg
            my="space.02"
            mx="auto"
            width="62"
            height="7"
            viewBox="0 0 62 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.589844 3.25781C0.589844 1.4672 2.04142 0.015625 3.83203 0.015625H58.1699C59.9605 0.015625 61.4121 1.4672 61.4121 3.25781C61.4121 5.04842 59.9605 6.5 58.1699 6.5H3.83203C2.04142 6.5 0.589844 5.04842 0.589844 3.25781Z"
              fill="#D9D9D9"
            />
          </styled.svg>

          <Flex
            background="ink.background-primary"
            flexDirection="column"
            roundedTop="sm"
            pb="space.06"
          >
            {children}
          </Flex>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
