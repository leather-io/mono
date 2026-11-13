import { Flex, type FlexProps, type HTMLStyledProps, styled } from 'leather-styles/jsx';

import { type InstallPlatform, installLinks } from './install-links';
import { type MarketingSection, trackMarketingEvent } from './marketing-analytics';

const defaultPlatforms: InstallPlatform[] = ['chrome', 'ios', 'android'];

const storeDetails: Record<InstallPlatform, { label: string; icon: string; store: string }> = {
  chrome: { label: 'Chrome', icon: '/marketing/shared/chrome.webp', store: 'Chrome Web Store' },
  ios: { label: 'iOS', icon: '/marketing/shared/app-store.webp', store: 'App Store' },
  android: { label: 'Android', icon: '/marketing/shared/google-play.png', store: 'Google Play' },
};

interface StoreButtonProps extends HTMLStyledProps<'a'> {
  platform: InstallPlatform;
  section: MarketingSection;
}

/** One outlined store pill (icon + platform name) linking to the platform's store listing. */
function StoreButton({ platform, section, ...props }: StoreButtonProps) {
  const { label, icon, store } = storeDetails[platform];
  return (
    <styled.a
      href={installLinks[platform]}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label}: get Leather on the ${store} (opens in a new tab)`}
      onClick={() =>
        trackMarketingEvent('store_link_clicked', {
          store: platform,
          section,
          url: installLinks[platform],
        })
      }
      display="inline-flex"
      alignItems="center"
      gap="space.02"
      height="48px"
      pl="space.03"
      pr="space.04"
      borderRadius="round"
      border="1px solid"
      borderColor="ink.border-default"
      bg="ink.background-primary"
      color="ink.text-primary"
      textStyle="label.03"
      fontSize="14px"
      whiteSpace="nowrap"
      transition="background 120ms ease"
      _hover={{ bg: 'ink.component-background-hover' }}
      _focusVisible={{ outline: '2px solid', outlineColor: 'blue.border', outlineOffset: '2px' }}
      {...props}
    >
      <styled.img src={icon} alt="" width="24px" height="24px" loading="lazy" />
      {label}
    </styled.a>
  );
}

interface StoreButtonsProps {
  /** Which stores to show, in order. Defaults to Chrome, iOS, Android. */
  platforms?: InstallPlatform[];
  /** Optional layout props for the wrapping row (margins, justify, etc). */
  containerProps?: FlexProps;
  /** Where the row sits, reported with each click. */
  section: MarketingSection;
}

/** Row of store pills: Chrome Web Store, App Store and Google Play. Each opens in a new tab. */
export function StoreButtons({
  platforms = defaultPlatforms,
  containerProps,
  section,
}: StoreButtonsProps) {
  return (
    <Flex gap="space.02" flexWrap="wrap" {...containerProps}>
      {platforms.map(platform => (
        <StoreButton key={platform} platform={platform} section={section} />
      ))}
    </Flex>
  );
}
