import { useState } from 'react';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { useWaitlistFlag } from '@/features/feature-flags';
import { TestId } from '@/shared/test-id';
import { t } from '@lingui/core/macro';
import { Image } from 'expo-image';

import {
  ArrowRotateClockwiseIcon,
  Box,
  EllipsisVIcon,
  LogoGoogle,
  PlusIcon,
  Sheet,
  SheetRef,
  Text,
} from '@leather.io/ui/native';

import { AddWalletCell } from './add-wallet-cell';

const AnimatedBox = Animated.createAnimatedComponent(Box);

const CLOSED_ANIMATED_SHARED_VALUE = -888;

interface AddWalletSheetBaseProps {
  addWalletSheetRef: SheetRef;
}

interface AddWalletSheetLayoutProps extends AddWalletSheetBaseProps {
  createWallet(): unknown;
  restoreWallet(): unknown;
  googleWallet(): unknown;
  opensFully?: boolean;
}
export function AddWalletSheetLayout({
  addWalletSheetRef,
  createWallet,
  restoreWallet,
  googleWallet,
  opensFully,
}: AddWalletSheetLayoutProps) {
  const [moreOptionsVisible, setMoreOptionsVisible] = useState(!!opensFully);
  const animatedIndex = useSharedValue<number>(CLOSED_ANIMATED_SHARED_VALUE);
  const releaseWaitlistFeatures = useWaitlistFlag();

  function openOptions() {
    setMoreOptionsVisible(!moreOptionsVisible);
  }

  const animatedStyle = useAnimatedStyle(() => ({
    marginTop: interpolate(animatedIndex.value, [-1, 0], [-200, 0], Extrapolation.CLAMP),
    marginBottom: interpolate(animatedIndex.value, [-1, 0], [200, 0], Extrapolation.CLAMP),
  }));

  return (
    <Sheet
      animatedIndex={animatedIndex}
      ref={addWalletSheetRef}
      onDismiss={() => setMoreOptionsVisible(!!opensFully)}
    >
      <Sheet.ScrollView>
        <AnimatedBox style={animatedStyle}>
          <Box width="100%" style={{ height: 184, overflow: 'hidden' }}>
            <Image
              style={{ height: '100%' }}
              contentFit="cover"
              source={require('@/assets/stickers/add-wallet.png')}
            />
          </Box>
          <Box>
            <Box px="5" py="4">
              <Text variant="heading03">{t`Add wallet`}</Text>
            </Box>
            <Box gap="1" pb="5">
              <AddWalletCell
                onPress={createWallet}
                title={t`Create new wallet`}
                caption={t`Generate new Secret Key for self-custody`}
                testID={TestId.createNewWalletSheetButton}
                icon={<PlusIcon />}
              />
              <AddWalletCell
                onPress={restoreWallet}
                title={t`Restore wallet`}
                caption={t`Import existing accounts from self-custody`}
                testID={TestId.restoreWalletSheetButton}
                icon={<ArrowRotateClockwiseIcon />}
              />
              <AddWalletCell
                onPress={googleWallet}
                title={t`Continue with Google`}
                caption={t`Generate or import accounts from Google`}
                testID={TestId.restoreWalletSheetButton}
                icon={<LogoGoogle />}
              />
              {releaseWaitlistFeatures && (
                <AddWalletCell
                  onPress={openOptions}
                  title={t`More options`}
                  icon={moreOptionsVisible ? undefined : <EllipsisVIcon />}
                />
              )}
            </Box>
          </Box>
        </AnimatedBox>
      </Sheet.ScrollView>
    </Sheet>
  );
}
