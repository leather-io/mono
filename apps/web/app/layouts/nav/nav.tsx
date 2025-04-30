import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

import { css } from 'leather-styles/css';
import { Flex, HTMLStyledProps, styled } from 'leather-styles/jsx';
import { Drawer } from 'vaul';
import { LeatherLogo } from '~/components/icons/leather-logo';
import { SbtcMonogramIcon } from '~/components/icons/sbtc-monogram-icon';
import { StackingIcon } from '~/components/icons/stacking-icon';
import { externalLeatherNavigator } from '~/utils/external-leather-navigator';

import { BarsTwoIcon, GridIcon, IconButton, SupportIcon, WalletIcon } from '@leather.io/ui';

import { NavItem } from './nav-item.layout';

function LeatherLogoHomeLink(props: HTMLStyledProps<'a'>) {
  return (
    <styled.a href={externalLeatherNavigator.home} display="inline-block" {...props}>
      <LeatherLogo />
    </styled.a>
  );
}

export function NavContents() {
  return (
    <>
      <NavItem href="/" icon={<SbtcMonogramIcon />}>
        Stacking
      </NavItem>

      <NavItem href="/sbtc" icon={<StackingIcon />}>
        sBTC
      </NavItem>

      <NavItem href={externalLeatherNavigator.wallet} icon={<WalletIcon variant="small" />}>
        Wallet
      </NavItem>
      <NavItem href={externalLeatherNavigator.apps} icon={<GridIcon variant="small" />}>
        Apps
      </NavItem>

      <styled.div mt="auto" mb={[null, null, 'space.06']}>
        {/* <NavItem href={externalLeatherNavigator.docs} icon={<TerminalIcon variant="small" />}>
          Developers
        </NavItem> */}

        <NavItem href={externalLeatherNavigator.support} icon={<SupportIcon variant="small" />}>
          Help
        </NavItem>
      </styled.div>
    </>
  );
}

export function Nav() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  return (
    <>
      <styled.nav
        display={['none', 'none', 'flex']}
        pos="fixed"
        height="100vh"
        flexDirection="column"
        width="navbar"
        minWidth="navbar"
        borderRight="default"
        minHeight="fit-content"
      >
        <Flex>
          <LeatherLogoHomeLink
            // To baseline align with the text in the header
            mt="2px"
            p="space.04"
            mb="41px"
          />
        </Flex>
        <NavContents />
      </styled.nav>
      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Trigger asChild>
          <IconButton
            display={['inline-block', 'inline-block', 'none']}
            variant="ghost"
            bottom="space.06"
            right="space.06"
            borderRadius="50%"
            bg="white"
            boxShadow="rgba(100, 100, 111, 0.2) 0px 7px 29px 0px"
            pos="fixed"
            zIndex={99}
            transform="scale(1.4)"
            icon={<BarsTwoIcon variant="small" />}
          />
        </Drawer.Trigger>
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
              m: 'space.02',
              h: 'fit-content',
              pos: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              outline: 'none',
              zIndex: 9999,
            })}
          >
            <styled.div p="space.04" bg="ink.background-primary" borderRadius="md">
              <LeatherLogoHomeLink p="space.04" />
              <NavContents />
            </styled.div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
