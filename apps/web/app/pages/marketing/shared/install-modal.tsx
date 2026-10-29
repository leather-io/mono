import {
  type MouseEvent,
  type ReactNode,
  cloneElement,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router';

import { Box, Flex, Grid, styled } from 'leather-styles/jsx';

import { CloseIcon, IconButton, Sheet } from '@leather.io/ui';

import { type InstallPlatform } from './install-links';
import { StoreButtons } from './store-buttons';

const StyledLink = styled(Link);

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
  // The Sheet unmounts on close and has no Radix trigger to return focus to, so do it here
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Layout effect: runs before the dialog moves focus inside itself
  useLayoutEffect(() => {
    if (isOpen && !returnFocusRef.current && document.activeElement instanceof HTMLElement) {
      returnFocusRef.current = document.activeElement;
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) return;
    returnFocusRef.current?.focus();
    returnFocusRef.current = null;
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
      {/* Sheet reads window on render, so only mount it once opened (always client-side) */}
      {isOpen && (
        <Sheet
          isShowing
          variant="drawer"
          maxWidth="560px"
          title="Choose the platform"
          description="Install Leather as a browser extension or mobile app"
          onClose={() => setOpen(false)}
        >
          <Box px={['space.04', null, 'space.05']} pt={['space.05', null, 'space.05']}>
            <Flex justifyContent="space-between" alignItems="flex-start" gap="space.04">
              <styled.h2 textStyle="heading.02" fontSize={['32px', null, '44px']} lineHeight="0.95">
                Choose the
                <br />
                platform
              </styled.h2>
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
        </Sheet>
      )}
    </>
  );
}
