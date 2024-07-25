import { FC, Ref, useState } from 'react';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SvgProps } from 'react-native-svg';

import ArrowRotateClockwise from '@/assets/arrow-rotate-clockwise.svg';
import ColorSwatchIcon from '@/assets/color-swatch.svg';
import DotGridHorizontal from '@/assets/dot-grid-horizontal.svg';
import EnvelopeIcon from '@/assets/envelope.svg';
import EyeIcon from '@/assets/eye.svg';
import NfcIcon from '@/assets/nfc.svg';
import PlusIcon from '@/assets/plus-icon.svg';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTheme } from '@shopify/restyle';
import { Image } from 'expo-image';

import { Box, Text, Theme, TouchableOpacity } from '@leather.io/ui/native';

import { CLOSED_ANIMATED_POSITION, Modal } from '../bottom-sheet-modal';

interface AddWalletListItemProps {
  Icon?: FC<SvgProps>;
  title: string;
  subtitle?: string;
  onPress(): unknown;
  isFeatureUnavailable?: boolean;
}

export function AddWalletListItem({
  Icon,
  title,
  subtitle,
  onPress,
  isFeatureUnavailable,
}: AddWalletListItemProps) {
  const theme = useTheme<Theme>();
  return (
    <TouchableOpacity onPress={onPress} py="3" flexDirection="row" gap="4" alignItems="center">
      {!Icon ? null : (
        <Box flexDirection="row" p="2" bg="base.ink.background-secondary" borderRadius="round">
          <Icon
            color={
              isFeatureUnavailable
                ? theme.colors['base.ink.text-subdued']
                : theme.colors['base.ink.text-primary']
            }
            width={24}
            height={24}
          />
        </Box>
      )}
      <Box flexDirection="column">
        <Text variant="label02">{title}</Text>
        {subtitle ? (
          <Text color="base.ink.text-subdued" variant="label03">
            {subtitle}
          </Text>
        ) : null}
      </Box>
    </TouchableOpacity>
  );
}
const AnimatedBox = Animated.createAnimatedComponent(Box);

const UNAVAILABLE_FEATURES = {
  hardwareWallet: {
    title: 'Connect hardware wallet',
    subtitle: 'Ledger, Trezor, Ryder and more',
    Icon: NfcIcon,
  },
  emailRestore: {
    title: 'Create or restore via email',
    subtitle: 'Access custodial wallet',
    Icon: EnvelopeIcon,
  },
  mpcWallet: {
    title: 'Connect MPC wallet',
    subtitle: 'Import existing accounts',
    Icon: ColorSwatchIcon,
  },
  watchOnlyWallet: {
    title: 'Create watch-only wallet',
    subtitle: 'No key needed',
    Icon: EyeIcon,
  },
};

interface AddWalletModalProps {
  addWalletModalRef: Ref<BottomSheetModal>;
}
export function AddWalletModal({ addWalletModalRef }: AddWalletModalProps) {
  const [moreOptionsVisible, setMoreOptionsVisible] = useState(false);
  const animatedPosition = useSharedValue(CLOSED_ANIMATED_POSITION);

  function createWallet() {
    // TODO: navigate to create wallet screen
  }
  function restoreWallet() {
    // TODO: navigate to restore wallet screen
  }
  function openOptions() {
    setMoreOptionsVisible(!moreOptionsVisible);
  }

  const animatedStyle = useAnimatedStyle(() => ({
    marginTop: interpolate(animatedPosition.value, [800, 300], [-200, 0], Extrapolation.CLAMP),
    marginBottom: interpolate(animatedPosition.value, [800, 300], [200, 0], Extrapolation.CLAMP),
  }));

  return (
    <Modal animatedPosition={animatedPosition} ref={addWalletModalRef}>
      <AnimatedBox style={animatedStyle}>
        <Box width="100%" style={{ height: 200, overflow: 'hidden' }} bg="base.ink.text-primary">
          <Image
            style={{ height: '100%' }}
            contentFit="cover"
            source={require('@/assets/create-wallet-image.png')}
          />
        </Box>
        <Box px="5" pt="5">
          <Text pb="5" variant="heading03">
            Add wallet to {'{Use case}'}
          </Text>
          <Box flexDirection="column" gap="1">
            <AddWalletListItem
              onPress={createWallet}
              title="Create new wallet"
              subtitle="Create a new Bitcoin and Stacks wallet"
              Icon={PlusIcon}
            />
            <AddWalletListItem
              onPress={restoreWallet}
              title="Restore wallet"
              subtitle="Import existing accounts"
              Icon={ArrowRotateClockwise}
            />
            <AddWalletListItem
              onPress={openOptions}
              title="More options"
              Icon={moreOptionsVisible ? undefined : DotGridHorizontal}
            />
            {!moreOptionsVisible
              ? null
              : Object.entries(UNAVAILABLE_FEATURES).map(featureEntry => {
                  const [featureKey, feature] = featureEntry;
                  return (
                    <AddWalletListItem
                      key={featureKey}
                      onPress={openOptions}
                      title={feature.title}
                      subtitle={feature.subtitle}
                      Icon={feature.Icon}
                      isFeatureUnavailable
                    />
                  );
                })}
          </Box>
        </Box>
      </AnimatedBox>
    </Modal>
  );
}
