import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

import { css } from 'leather-styles/css';
import { Flex, HTMLStyledProps, styled } from 'leather-styles/jsx';
import { Drawer } from 'vaul';
import { LeatherLogo } from '~/components/icons/leather-logo';
import { SbtcMonogramIcon } from '~/components/icons/sbtc-monogram-icon';
import { StackingIcon } from '~/components/icons/stacking-icon';
import { advancedModeEnabled } from '~/pages/advanced/advanced.route';
import { externalLeatherNavigator } from '~/utils/external-leather-navigator';

import {
  BarsTwoIcon,
  ChangelogIcon,
  CodeIcon,
  GridIcon,
  IconButton,
  SupportIcon,
  WalletIcon,
} from '@leather.io/ui';

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
      <NavItem href="/stacking" icon={<SbtcMonogramIcon />}>
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
      {advancedModeEnabled && (
        <NavItem
          href="/advanced"
          icon={
            // TODO: add this to UI library @fabric-8
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.50016 7.16683V2.8335C8.50016 2.28121 8.94788 1.8335 9.50016 1.8335H11.8335C12.3858 1.8335 12.8335 2.28121 12.8335 2.8335V7.16683M8.50016 4.50016H10.1668M3.16683 7.16683V4.25228C3.16683 4.08679 3.2079 3.92389 3.28636 3.77818L4.17546 2.12699C4.2728 1.94622 4.46152 1.8335 4.66683 1.8335V1.8335C4.87213 1.8335 5.06086 1.94622 5.1582 2.12699L6.0473 3.77818C6.12576 3.92389 6.16683 4.08679 6.16683 4.25228V7.16683M1.8335 7.16683H14.1668V12.5002C14.1668 13.0524 13.7191 13.5002 13.1668 13.5002H2.8335C2.28121 13.5002 1.8335 13.0524 1.8335 12.5002V7.16683Z"
                stroke="#12100F"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        >
          Advanced
        </NavItem>
      )}

      <styled.div mt="auto" mb={[null, null, 'space.06']}>
        <NavItem href="/changelog" icon={<ChangelogIcon variant="small" />}>
          Changelog
        </NavItem>
        <NavItem href={externalLeatherNavigator.docs} newTab icon={<CodeIcon variant="small" />}>
          Developers
        </NavItem>
        <NavItem href="/help-center" icon={<SupportIcon variant="small" />}>
          Help Center
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
            width="40px"
            height="40px"
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
