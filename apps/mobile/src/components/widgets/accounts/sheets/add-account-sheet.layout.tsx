import { RefObject } from 'react';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { t } from '@lingui/macro';

import {
  Box,
  CLOSED_ANIMATED_SHARED_VALUE,
  PlusIcon,
  Sheet,
  SheetRef,
  Text,
  ThemeVariant,
  WalletPlusIcon,
} from '@leather.io/ui/native';

import { AddWalletCell } from '../../../add-wallet/add-wallet-cell';

const AnimatedBox = Animated.createAnimatedComponent(Box);

interface AddAccountSheetBaseProps {
  addAccountSheetRef: RefObject<SheetRef>;
}

interface AddAccountSheetLayoutProps extends AddAccountSheetBaseProps {
  addToWallet(): unknown;
  addToNewWallet(): unknown;
  themeVariant: ThemeVariant;
}
export function AddAccountSheetLayout({
  addAccountSheetRef,
  addToWallet,
  addToNewWallet,
  themeVariant,
}: AddAccountSheetLayoutProps) {
  const animatedIndex = useSharedValue<number>(CLOSED_ANIMATED_SHARED_VALUE);

  const animatedStyle = useAnimatedStyle(() => ({
    marginTop: interpolate(animatedIndex.value, [-1, 0], [-200, 0], Extrapolation.CLAMP),
    marginBottom: interpolate(animatedIndex.value, [-1, 0], [200, 0], Extrapolation.CLAMP),
  }));

  return (
    <Sheet
      isScrollView
      animatedIndex={animatedIndex}
      ref={addAccountSheetRef}
      themeVariant={themeVariant}
    >
      <AnimatedBox style={animatedStyle}>
        <Box p="5">
          <Text pb="5" variant="heading05">
            {t`Add account`}
          </Text>
          <Box flexDirection="column" gap="1">
            <AddWalletCell
              onPress={addToWallet}
              title={t`Add to existing wallet`}
              subtitle={t`Choose existing leather wallet`}
              icon={<WalletPlusIcon />}
            />
            <AddWalletCell
              onPress={addToNewWallet}
              title={t`Add to new wallet`}
              subtitle={t`Create new wallet`}
              icon={<PlusIcon />}
            />
          </Box>
        </Box>
      </AnimatedBox>
    </Sheet>
  );
}
