import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Pressable,
  Text,
  legacyTouchablePressEffect,
} from '@leather.io/ui/native';

import { BrowserNavigationBarContainer } from './browser-navigation-bar-container';

function getIconOpacity(isEnabled: boolean) {
  return isEnabled ? 1 : 0.7;
}

interface BrowserNavigationBarProps {
  searchUrl: string;
  onGoBack(): void;
  onGoForward(): void;
  canGoBack: boolean;
  canGoForward: boolean;
  onPressUrl(): void;
}
export function BrowserNavigationBar({
  searchUrl,
  onGoBack,
  onGoForward,
  canGoBack,
  canGoForward,
  onPressUrl,
}: BrowserNavigationBarProps) {
  const hostname = new URL(searchUrl).hostname;
  return (
    <BrowserNavigationBarContainer>
      <Pressable
        p="3"
        onPress={onGoBack}
        disabled={!canGoBack}
        pressEffects={legacyTouchablePressEffect}
      >
        <ChevronLeftIcon style={{ opacity: getIconOpacity(canGoBack) }} variant="large" />
      </Pressable>
      <Pressable p="4" onPress={onPressUrl} pressEffects={legacyTouchablePressEffect}>
        <Text variant="caption01">{hostname}</Text>
      </Pressable>
      <Pressable
        p="3"
        onPress={onGoForward}
        disabled={!canGoForward}
        pressEffects={legacyTouchablePressEffect}
      >
        <ChevronRightIcon style={{ opacity: getIconOpacity(canGoForward) }} variant="large" />
      </Pressable>
    </BrowserNavigationBarContainer>
  );
}
