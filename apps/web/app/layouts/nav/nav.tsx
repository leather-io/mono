import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

import { css } from 'leather-styles/css';
import { Flex, styled } from 'leather-styles/jsx';
import { Drawer } from 'vaul';
import { SbtcIcon } from '~/components/icons/sbtc-icon';
import { StackingIcon } from '~/components/icons/stacking-icon';

import {
  BarsTwoIcon,
  GlassesIcon,
  IconButton,
  NewspaperIcon,
  SupportIcon,
  TerminalIcon,
} from '@leather.io/ui';

import { NavItem } from './nav-item.layout';

export function NavContents() {
  return (
    <>
      <NavItem href="/sbtc-rewards" icon={<StackingIcon />}>
        sBTC
      </NavItem>

      <NavItem href="/stacking" icon={<SbtcIcon />}>
        Stacking
      </NavItem>

      <NavItem href="/blog" icon={<NewspaperIcon variant="small" />}>
        Blog
      </NavItem>
      <NavItem href="/guides" icon={<GlassesIcon variant="small" />}>
        Guides
      </NavItem>

      <styled.div mt="auto" mb={[null, null, 'space.06']}>
        <NavItem href="/dev-docs" icon={<TerminalIcon variant="small" />}>
          Developers
        </NavItem>

        <NavItem href="/support" icon={<SupportIcon variant="small" />}>
          Support
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
  }, [location]);

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
          <styled.svg
            flexShrink={0}
            m="space.04"
            mb="space.08"
            // To baseline align with the text in the header
            mt="18px"
            xmlns="http://www.w3.org/2000/svg"
            width="83"
            height="18"
            viewBox="0 0 83 18"
            fill="none"
          >
            <path
              d="M79.8738 13.0979C79.1082 14.5532 77.9854 15.4468 77.1177 15.4468C76.4542 15.4468 75.9438 14.8851 75.9438 13.5574C75.9438 11.4894 76.9646 8.27234 77.4495 6.58723H69.8447L69.1047 9.16596C67.9818 13.1234 66.221 15.4468 63.4394 15.4468C63.0311 15.4468 62.5462 15.3702 62.291 15.217C64.3836 13.7106 66.5017 11.3106 66.5017 8.93617C66.5017 6.97021 65.0726 6.20426 63.7712 6.20426C59.6881 6.20426 56.7789 11.566 57.8762 14.9362C57.2127 15.166 56.6003 15.4468 55.8602 15.4468C55.1201 15.4468 54.7118 14.9362 54.8649 14.2468C55.0436 13.4298 56.0643 10.6979 56.0643 9.21702C56.0643 7.40426 54.6608 6.17872 52.5427 6.17872C52.0578 6.17872 51.5219 6.30638 50.986 6.51064L52.3385 1.73617H49.6845L46.5201 12.8681C46.0353 14.6043 44.5807 15.4468 43.3813 15.4468C41.8756 15.4468 41.3142 14.2468 41.6715 13.0468L42.7943 9.14043H45.678L46.4181 6.58723H43.5089L44.8869 1.73617H42.2329L38.7878 13.8383C38.4561 14.9872 37.665 15.4468 36.9759 15.4468C35.8786 15.4468 35.5469 14.5532 35.7765 13.7362L37.8181 6.58723C37.1035 6.35745 36.0828 6.17872 35.2917 6.17872C30.7237 6.17872 26.411 10.2383 26.411 14.2468C26.411 14.2504 26.411 14.2542 26.411 14.2578C25.1891 15.0416 23.7715 15.4468 22.532 15.4468C21.6644 15.4468 21.1795 15.3702 20.7967 15.166C22.9404 13.7617 25.1605 11.4128 25.1605 8.93617C25.1605 6.97021 23.7315 6.20426 22.43 6.20426C18.3724 6.20426 15.5398 11.4383 16.484 14.783C15.5908 15.2426 14.7742 15.4723 13.881 15.4723C12.4775 15.4723 11.1505 14.8851 10.1297 13.7106L11.4312 9.14043C14.5956 8.88511 18.7807 6.28085 18.7807 3.08936C18.7807 1.09787 17.4537 0 15.7694 0C12.7837 0 10.538 2.88511 9.49171 6.58723C7.55225 6.35745 6.50596 4.26383 8.03711 1.73617H5.28103C3.57124 5.54043 5.30655 8.19574 8.77717 9.14043L7.93504 12.0766C6.65907 11.2851 5.66382 10.9787 4.48994 10.9787C-1.14982 10.9787 -1.37949 18 4.15819 18C5.7659 18 7.70536 17.1574 8.72613 16.034C10.1807 17.3106 11.6098 18 13.4472 18C14.8508 18 16.2798 17.5915 17.7599 16.7234C18.7552 17.5404 20.0567 18 21.9196 18C23.574 18 25.2287 17.6563 26.9326 16.4584C27.4374 17.3471 28.3583 18 29.9071 18C31.2086 18 32.6377 17.4383 33.7095 16.2383C34.5006 17.3872 35.7 18 36.9249 18C37.9457 18 38.992 17.5915 39.8851 16.7745C40.5997 17.5404 41.9012 18 43.3302 18C45.5504 18 48.0258 16.8255 48.8934 13.7872L49.8887 10.2638C50.1949 9.21702 51.0115 8.73192 51.9557 8.73192C52.7724 8.73192 53.2062 9.14043 53.2062 9.85532C53.2062 11.183 52.0323 14.3489 52.0323 15.4723C52.0323 17.3617 53.3083 18 55.0181 18C56.0899 18 56.932 17.9745 59.3308 16.9021C60.3005 17.617 61.8062 18 63.516 18C67.3183 18 69.9723 15.3957 71.7842 9.14043H74.0809C73.6471 10.5957 73.3409 12.2043 73.3409 13.634C73.3409 16.034 74.2085 18 76.8881 18C78.9806 18 81.8898 15.8809 82.6299 13.0979H79.8738ZM15.3867 2.55319C15.8715 2.55319 16.2033 2.83404 16.2033 3.24255C16.2033 4.59574 13.8045 6.33192 12.1457 6.58723C12.9113 3.93192 14.468 2.55319 15.3867 2.55319ZM4.28578 15.4468C2.11665 15.4468 2.29528 13.3021 4.46442 13.3021C5.40863 13.3021 6.14869 13.6085 7.04186 14.3745C6.4294 15.0638 5.25552 15.4468 4.28578 15.4468ZM21.6644 8.73192C22.2003 8.73192 22.532 9.06383 22.532 9.6C22.532 11.0298 20.6691 12.7915 19.0869 13.6851C18.5255 12.0511 20.1332 8.73192 21.6644 8.73192ZM30.3665 15.4468C29.5754 15.4468 29.1926 14.8851 29.1926 14.0681C29.1926 12.1021 31.3107 8.78298 34.5516 8.73192C33.3777 12.8426 32.5866 15.4468 30.3665 15.4468ZM63.0056 8.73192C63.5415 8.73192 63.8732 9.06383 63.8732 9.6C63.8732 11.0298 61.9338 12.8681 60.4537 13.7872C59.8157 12.2553 61.4489 8.73192 63.0056 8.73192Z"
              fill="#12100F"
            />
          </styled.svg>
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
              <NavContents />
            </styled.div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
