import { ReactNode, useMemo } from 'react';
import { Platform, ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useActionBar } from '@/components/action-bar/use-action-bar';
import { TestId } from '@/shared/test-id';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { LinearGradient } from 'expo-linear-gradient';

import {
  BlurView,
  Box,
  BrowserIcon,
  Button,
  InboxIcon,
  PaperPlaneIcon,
  PlusIcon,
  Pressable,
  Text,
  Theme,
  legacyTouchablePressEffect,
} from '@leather.io/ui/native';

const AnimatedBox = Animated.createAnimatedComponent(Box);

const actionBarHeight = 64;
const minimumBottomOffset = 24;
const buttonBaseWidth = 52;
const blurIntensity = 50;
const androidBlurReductionFactor = 4;

export function ActionBar() {
  const {
    isActionBarVisible,
    hasWallets,
    isBrowserEnabled,
    onAddWallet,
    onOpenBrowser,
    onOpenReceive,
    onOpenSend,
  } = useActionBar();

  if (!isActionBarVisible) {
    return null;
  }

  if (hasWallets) {
    return (
      <ActionBarContainer>
        <ActionBarButton
          onPress={onOpenSend}
          icon={<PaperPlaneIcon />}
          label={t({ id: 'action_bar.send_label', message: 'Send' })}
        />
        <ActionBarButton
          onPress={onOpenReceive}
          icon={<InboxIcon />}
          label={t({ id: 'action_bar.receive_label', message: 'Receive' })}
        />
        {isBrowserEnabled && (
          <ActionBarButton
            onPress={onOpenBrowser}
            icon={<BrowserIcon />}
            label={t({ id: 'action_bar.browser_label', message: 'Browse' })}
          />
        )}
      </ActionBarContainer>
    );
  }

  return (
    <ActionBarContainer>
      <Button
        width="100%"
        buttonState="ghost"
        icon={<PlusIcon variant="small" />}
        title={t({ id: 'action_bar.add_wallet_label', message: 'Add wallet' })}
        testID={TestId.homeAddWalletButton}
        onPress={onAddWallet}
      />
    </ActionBarContainer>
  );
}

interface ActionBarContainerProps {
  children: ReactNode;
}

function ActionBarContainer({ children }: ActionBarContainerProps) {
  const { bottom } = useSafeAreaInsets();
  const bottomOffset = getActionBarBottomOffset(bottom);
  const theme = useTheme<Theme>();
  const { themeDerivedFromThemePreference } = useSettings();
  const styles = {
    position: 'absolute',
    bottom: bottomOffset,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: theme.spacing[6],
    height: actionBarHeight,
    marginHorizontal: theme.spacing[5],
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[2],
    overflow: 'hidden',
    borderRadius: theme.borderRadii['sm'],
    borderColor: theme.colors['ink.border-transparent'],
    borderWidth: 1,
  } as const;

  return (
    <AnimatedBox entering={FadeInDown} exiting={FadeOutDown}>
      <GradientBackdrop height={bottomOffset + actionBarHeight} />
      {Platform.select({
        ios: (
          <BlurView
            themeVariant={themeDerivedFromThemePreference}
            intensity={blurIntensity}
            blurReductionFactor={androidBlurReductionFactor}
            style={styles}
          >
            <BlurBackdrop />
            {children}
          </BlurView>
        ),
        android: (
          <Box style={styles}>
            <BlurBackdrop />
            {children}
          </Box>
        ),
      })}
    </AnimatedBox>
  );
}

interface ActionBarButtonProps {
  onPress: () => void;
  icon: ReactNode;
  label?: string;
  testID?: string;
}

function ActionBarButton({ onPress, icon, label, testID }: ActionBarButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      justifyContent="center"
      alignItems="center"
      gap="1"
      height="100%"
      pressEffects={legacyTouchablePressEffect}
      haptics="soft"
      testID={testID}
      minWidth={buttonBaseWidth}
    >
      {icon}
      {label && (
        <Text variant="label03" numberOfLines={1}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function GradientBackdrop({ height }: { height: number }) {
  const { themeDerivedFromThemePreference } = useSettings();
  const theme = useTheme<Theme>();
  const transparentStopColor =
    themeDerivedFromThemePreference === 'light' ? 'rgba(255,255,255,0)' : 'rgba(27,26,23,0)';
  const style = useMemo<ViewStyle>(
    () => ({
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height,
    }),
    [height]
  );

  return (
    <>
      <LinearGradient
        pointerEvents="none"
        colors={[transparentStopColor, theme.colors['ink.background-primary']]}
        locations={[0.35, 0.9]}
        style={style}
      />
      <LinearGradient
        colors={[transparentStopColor, theme.colors['ink.background-primary']]}
        locations={[0.1, 0.8]}
        style={style}
      />
    </>
  );
}

export function BlurBackdrop() {
  return (
    <Box
      bg="red.background-secondary"
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="ink.background-primary"
      opacity={0.7}
    />
  );
}

function getActionBarBottomOffset(safeAreaBottom: number): number {
  return Math.max(safeAreaBottom, minimumBottomOffset);
}

export function useActionBarOffset() {
  const { bottom } = useSafeAreaInsets();
  const bottomOffset = getActionBarBottomOffset(bottom);
  const topOffset = 24;

  return {
    actionBarOffset: topOffset + actionBarHeight + bottomOffset,
  };
}
