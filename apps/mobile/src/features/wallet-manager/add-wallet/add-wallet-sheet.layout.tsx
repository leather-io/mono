import { RefObject, useState } from 'react';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { useWaitlistFlag } from '@/features/feature-flags';
import { TestId } from '@/shared/test-id';
import { t } from '@lingui/macro';
import { Image } from 'expo-image';

import {
  ArrowRotateClockwiseIcon,
  Box,
  CLOSED_ANIMATED_SHARED_VALUE,
  EllipsisVIcon,
  PlusIcon,
  Sheet,
  SheetRef,
  Text,
  ThemeVariant,
} from '@leather.io/ui/native';

import { AddWalletCell } from './add-wallet-cell';

const AnimatedBox = Animated.createAnimatedComponent(Box);

interface AddWalletSheetBaseProps {
  addWalletSheetRef: RefObject<SheetRef | null>;
}

interface AddWalletSheetLayoutProps extends AddWalletSheetBaseProps {
  createWallet(): unknown;
  restoreWallet(): unknown;
  themeVariant: ThemeVariant;
  opensFully?: boolean;
}
export function AddWalletSheetLayout({
  addWalletSheetRef,
  createWallet,
  restoreWallet,
  themeVariant,
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
      isScrollView
      animatedIndex={animatedIndex}
      ref={addWalletSheetRef}
      themeVariant={themeVariant}
      onDismiss={() => {
        setMoreOptionsVisible(!!opensFully);
      }}
    >
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
            <Text variant="heading03">
              {t({
                id: 'add_wallet.header_title',
                message: 'Add wallet',
              })}
            </Text>
          </Box>
          <Box gap="1" pb="5">
            <AddWalletCell
              onPress={createWallet}
              title={t({
                id: 'add_wallet.create_wallet.cell_title',
                message: 'Create new wallet',
              })}
              caption={t({
                id: 'add_wallet.create_wallet.cell_caption',
                message: 'Generate new Secret Key for self-custody',
              })}
              testID={TestId.createNewWalletSheetButton}
              icon={<PlusIcon />}
            />
            <AddWalletCell
              onPress={restoreWallet}
              title={t({
                id: 'add_wallet.restore_wallet.cell_title',
                message: 'Restore wallet',
              })}
              caption={t({
                id: 'add_wallet.restore_wallet.cell_caption',
                message: 'Import existing accounts from self-custody',
              })}
              testID={TestId.restoreWalletSheetButton}
              icon={<ArrowRotateClockwiseIcon />}
            />
            {releaseWaitlistFeatures && (
              <AddWalletCell
                onPress={openOptions}
                title={t({
                  id: 'add_wallet.options.cell_title',
                  message: 'More options',
                })}
                icon={moreOptionsVisible ? undefined : <EllipsisVIcon />}
              />
            )}
          </Box>
        </Box>
      </AnimatedBox>
    </Sheet>
  );
}
