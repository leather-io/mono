import { Flex, type FlexProps, type HTMLStyledProps, styled } from 'leather-styles/jsx';

import { type InstallPlatform, installLinks } from './install-links';

const defaultPlatforms: InstallPlatform[] = ['chrome', 'ios', 'android'];

const storeDetails: Record<InstallPlatform, { label: string; icon: string; store: string }> = {
  chrome: { label: 'Chrome', icon: '/marketing/shared/chrome.webp', store: 'Chrome Web Store' },
  ios: { label: 'iOS', icon: '/marketing/shared/app-store.webp', store: 'App Store' },
  android: { label: 'Android', icon: '/marketing/shared/google-play.png', store: 'Google Play' },
};

type StoreButtonTone = 'light' | 'dark';

interface StoreButtonProps extends HTMLStyledProps<'a'> {
  platform: InstallPlatform;
  tone?: StoreButtonTone;
}

/** One outlined store pill (icon + platform name) linking to the platform's store listing. */
export function StoreButton({ platform, tone = 'light', ...props }: StoreButtonProps) {
  const { label, icon, store } = storeDetails[platform];
  const isDark = tone === 'dark';
  return (
    <styled.a
      href={installLinks[platform]}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label}: get Leather on the ${store} (opens in a new tab)`}
      display="inline-flex"
      alignItems="center"
      gap="space.02"
      height="48px"
      pl="space.03"
      pr="space.04"
      borderRadius="round"
      border="1px solid"
      borderColor={isDark ? 'rgba(255, 255, 255, 0.24)' : 'ink.border-default'}
      bg={isDark ? 'transparent' : 'ink.background-primary'}
      color={isDark ? 'white' : 'ink.text-primary'}
      textStyle="label.03"
      fontSize="14px"
      whiteSpace="nowrap"
      transition="background 120ms ease"
      _hover={{
        bg: isDark ? 'rgba(255, 255, 255, 0.08)' : 'ink.component-background-hover',
      }}
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
  /** `dark` for use on dark/black backgrounds. */
  tone?: StoreButtonTone;
  /** Optional layout props for the wrapping row (margins, justify, etc). */
  containerProps?: FlexProps;
}

/** Row of store pills: Chrome Web Store, App Store and Google Play. Each opens in a new tab. */
export function StoreButtons({
  platforms = defaultPlatforms,
  tone = 'light',
  containerProps,
}: StoreButtonsProps) {
  return (
    <Flex gap="space.02" flexWrap="wrap" {...containerProps}>
      {platforms.map(platform => (
        <StoreButton key={platform} platform={platform} tone={tone} />
      ))}
    </Flex>
  );
}
