import {
  type MouseEvent,
  type ReactNode,
  cloneElement,
  isValidElement,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router';

import { css } from 'leather-styles/css';
import { Box, Flex, Grid, styled } from 'leather-styles/jsx';
import { Dialog as RadixDialog, VisuallyHidden } from 'radix-ui';

import { CloseIcon, IconButton } from '@leather.io/ui';

import { type InstallPlatform } from './install-links';
import { StoreButtons } from './store-buttons';

const StyledLink = styled(Link);

const overlayStyles = css({
  position: 'fixed',
  inset: 0,
  zIndex: 999,
  bg: 'overlay',
  '&[data-state=open]': { animation: 'fadein 0.3s cubic-bezier(0.16, 1, 0.3, 1)' },
  '&[data-state=closed]': { animation: 'fadeout 0.2s ease-in both' },
});

// Desktop: a centred dialog that springs in (opacity, scale 0.7 → 1 and a small offset, as on
// the Framer site). Mobile: a bottom sheet that slides up. Reduced motion: a short fade only.
const contentStyles = css({
  position: 'fixed',
  zIndex: 999,
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
  bg: 'ink.background-primary',
  boxShadow: 'hsl(206 22% 7% / 35%) 0 10px 38px -10px, hsl(206 22% 7% / 20%) 0 10px 20px -15px',
  pb: 'space.04',
  left: 0,
  right: 0,
  bottom: 0,
  maxHeight: '100dvh',
  borderTopRadius: 'lg',
  md: {
    inset: 0,
    margin: 'auto',
    width: 'min(560px, 100vw)',
    height: 'fit-content',
    maxHeight: '90vh',
    borderRadius: 'md',
  },
  _focus: { outline: 'none' },
  _motionSafe: {
    '&[data-state=open]': {
      animation: {
        base: 'marketingSheetIn 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
        md: 'marketingModalIn 0.4s cubic-bezier(0.34, 1.3, 0.64, 1)',
      },
    },
    '&[data-state=closed]': {
      animation: {
        base: 'marketingSheetOut 0.25s cubic-bezier(0.32, 0.72, 0, 1) both',
        md: 'marketingModalOut 0.2s cubic-bezier(0.4, 0, 1, 1) both',
      },
    },
  },
  _motionReduce: {
    '&[data-state=open]': { animation: 'fadein 0.15s ease-out' },
    '&[data-state=closed]': { animation: 'fadeout 0.15s ease-in both' },
  },
});

interface PlatformCardProps {
  title: string;
  description: string;
  image: string;
  platforms: InstallPlatform[];
}
function PlatformCard({ title, description, image, platforms }: PlatformCardProps) {
  return (
    <Flex
      flexDir="column"
      border="1px solid"
      borderColor="ink.border-default"
      borderRadius="xs"
      overflow="hidden"
    >
      <styled.img
        src={image}
        alt=""
        width="100%"
        height={['140px', null, '188px']}
        objectFit="cover"
        objectPosition={['center 55%', null, 'left top']}
        bg="black"
      />
      <Flex flexDir="column" flex={1} p="space.04" pt="space.05">
        <styled.h3 textStyle="label.01" fontWeight="400">
          {title}
        </styled.h3>
        <styled.p textStyle="body.02" color="ink.text-subdued" mt="space.01" mb="space.05">
          {description}
        </styled.p>
        <Box mt="auto">
          <StoreButtons platforms={platforms} />
        </Box>
      </Flex>
    </Flex>
  );
}

interface InstallModalProps {
  /** Element that opens the modal on click (e.g. an "Install" button); its onClick is replaced. */
  trigger?: ReactNode;
  /** Controlled mode: pass `open` + `onOpenChange` to drive the modal without a trigger. */
  open?: boolean;
  onOpenChange?(open: boolean): void;
}

/** The "Choose the platform" dialog: browser extension (Chrome) or mobile (iOS / Android). */
export function InstallModal({ trigger, open, onOpenChange }: InstallModalProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = open ?? uncontrolledOpen;
  // There's no Radix trigger to return focus to, so do it ourselves once the dialog has unmounted
  // (onCloseAutoFocus), after its exit animation and after Radix lifts aria-hidden
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Layout effect: runs before the dialog moves focus inside itself
  useLayoutEffect(() => {
    if (isOpen && !returnFocusRef.current && document.activeElement instanceof HTMLElement) {
      returnFocusRef.current = document.activeElement;
    }
  }, [isOpen]);

  function setOpen(next: boolean) {
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  const triggerElement = isValidElement<{ onClick?(event: MouseEvent): void }>(trigger)
    ? cloneElement(trigger, {
        onClick(event: MouseEvent) {
          event.preventDefault();
          // Safari doesn't focus buttons on click, so remember the trigger itself
          if (event.currentTarget instanceof HTMLElement) {
            returnFocusRef.current = event.currentTarget;
          }
          setOpen(true);
        },
      })
    : trigger;

  return (
    <>
      {triggerElement}
      <RadixDialog.Root open={isOpen} onOpenChange={setOpen}>
        <RadixDialog.Portal>
          <RadixDialog.Overlay className={overlayStyles} />
          <RadixDialog.Content
            className={contentStyles}
            // Focus goes back to the trigger from the effect above, not on unmount
            onCloseAutoFocus={event => {
              event.preventDefault();
              returnFocusRef.current?.focus();
              returnFocusRef.current = null;
            }}
          >
            <VisuallyHidden.Root>
              <RadixDialog.Description>
                Install Leather as a browser extension or mobile app
              </RadixDialog.Description>
            </VisuallyHidden.Root>
            <Box px={['space.04', null, 'space.05']} pt={['space.05', null, 'space.05']}>
              <Flex justifyContent="space-between" alignItems="flex-start" gap="space.04">
                <RadixDialog.Title asChild>
                  <styled.h2
                    textStyle="heading.02"
                    fontSize={['32px', null, '44px']}
                    lineHeight="0.95"
                  >
                    Choose the <br />
                    platform
                  </styled.h2>
                </RadixDialog.Title>
                <Flex alignItems="center" gap="space.02" flexShrink={0}>
                  <StyledLink
                    to="/changelog"
                    onClick={() => {
                      // Navigating away: don't pull focus back to the trigger
                      returnFocusRef.current = null;
                      setOpen(false);
                    }}
                    textStyle="label.03"
                    fontSize="14px"
                    borderBottom="1px solid"
                    borderColor="ink.text-primary"
                    display={['none', 'inline']}
                  >
                    View release notes
                  </StyledLink>
                  <IconButton
                    icon={<CloseIcon variant="small" />}
                    aria-label="Close"
                    onClick={() => setOpen(false)}
                  />
                </Flex>
              </Flex>
              <Grid gridTemplateColumns={['1fr', null, '1fr 1fr']} gap="space.03" mt="space.05">
                <PlatformCard
                  title="Browser extension"
                  description="Connect to Web3 apps directly from your browser"
                  image="/marketing/shared/install-extension.webp"
                  platforms={['chrome']}
                />
                <PlatformCard
                  title="Mobile"
                  description="Your wallet, wherever you are"
                  image="/marketing/shared/install-mobile.webp"
                  platforms={['ios', 'android']}
                />
              </Grid>
            </Box>
          </RadixDialog.Content>
        </RadixDialog.Portal>
      </RadixDialog.Root>
    </>
  );
}
