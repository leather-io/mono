import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

import { css } from 'leather-styles/css';
import { Flex, HTMLStyledProps, styled } from 'leather-styles/jsx';
import { Drawer } from 'vaul';
import { LeatherLogo } from '~/components/icons/leather-logo';
import { StackingIcon } from '~/components/icons/stacking-icon';
import { multisigEnabled } from '~/pages/multisig/multisig.constants';
import { externalLeatherNavigator } from '~/utils/external-leather-navigator';

import {
  BarsTwoIcon,
  ChangelogIcon,
  CodeIcon,
  GridIcon,
  IconButton,
  KeyIcon,
  StacksIcon,
  SuitcaseIcon,
  SupportIcon,
} from '@leather.io/ui';

import { NavItem } from './nav-item.layout';

function LeatherLogoHomeLink(props: HTMLStyledProps<'a'>) {
  return (
    <styled.a href={externalLeatherNavigator.home} display="inline-block" {...props}>
      <LeatherLogo />
    </styled.a>
  );
}

function NavContents() {
  return (
    <>
      <NavItem href="/portfolio" icon={<SuitcaseIcon variant="small" />}>
        Portfolio
      </NavItem>

      <NavItem href="/staking" icon={<StacksIcon variant="small" />}>
        Staking
      </NavItem>

      <NavItem href="/sbtc" icon={<StackingIcon />}>
        sBTC
      </NavItem>

      <NavItem href={externalLeatherNavigator.apps} icon={<GridIcon variant="small" />}>
        Apps
      </NavItem>

      {multisigEnabled && (
        <NavItem href="/multisig" icon={<KeyIcon variant="small" />}>
          Multisig
        </NavItem>
      )}

      <styled.div mt="auto" mb={[null, null, 'space.06']}>
        <NavItem href="/changelog" icon={<ChangelogIcon variant="small" />}>
          Changelog
        </NavItem>
        <NavItem href={externalLeatherNavigator.docs} newTab icon={<CodeIcon variant="small" />}>
          Developers
        </NavItem>
        <NavItem href="/support" icon={<SupportIcon variant="small" />}>
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
        minHeight="fit-content"
        pl="space.02"
      >
        <Flex>
          <LeatherLogoHomeLink
            // To baseline align with the text in the header
            mt="7px"
            p="space.04"
            mb="40px"
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
