import { FC, RefObject, useCallback, useRef, useState } from 'react';
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
import { APP_ROUTES } from '@/constants';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { Box, Text, Theme, TouchableOpacity } from '@leather.io/ui/native';

import { CLOSED_ANIMATED_POSITION, Modal } from '../bottom-sheet-modal';
import { NotifyUserModal, OptionData } from '../notify-user-modal';

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
      {Icon && (
        <Box flexDirection="row" p="2" bg="ink.background-secondary" borderRadius="round">
          <Icon
            color={
              isFeatureUnavailable
                ? theme.colors['ink.text-subdued']
                : theme.colors['ink.text-primary']
            }
            width={24}
            height={24}
          />
        </Box>
      )}
      <Box flexDirection="column">
        <Text variant="label02">{title}</Text>
        {subtitle && (
          <Text color="ink.text-subdued" variant="label03">
            {subtitle}
          </Text>
        )}
      </Box>
    </TouchableOpacity>
  );
}
const AnimatedBox = Animated.createAnimatedComponent(Box);

function getUnavailableFeatures() {
  const UNAVAILABLE_FEATURES = {
    hardwareWallet: {
      title: t`Connect hardware wallet`,
      subtitle: t`Ledger, Trezor, Ryder and more`,
      Icon: NfcIcon,
    },
    emailRestore: {
      title: t`Create or restore via email`,
      subtitle: t`Access custodial wallet`,
      Icon: EnvelopeIcon,
    },
    mpcWallet: {
      title: t`Connect MPC wallet`,
      subtitle: t`Import existing accounts`,
      Icon: ColorSwatchIcon,
    },
    watchOnlyWallet: {
      title: t`Create watch-only wallet`,
      subtitle: t`No key needed`,
      Icon: EyeIcon,
    },
  };
  return UNAVAILABLE_FEATURES;
}

interface AddWalletModalBaseProps {
  addWalletModalRef: RefObject<BottomSheetModal>;
}

export function AddWalletModal({ addWalletModalRef }: AddWalletModalBaseProps) {
  const notifyUserModalRef = useRef<BottomSheetModal>(null);
  const router = useRouter();
  const [optionData, setOptionData] = useState<OptionData | null>(null);
  const createWallet = useCallback(() => {
    router.navigate(APP_ROUTES.WalletCreateNewWallet);
    addWalletModalRef.current?.close();
  }, [router]);

  const restoreWallet = useCallback(() => {
    router.navigate(APP_ROUTES.WalletRecoverWallet);
    addWalletModalRef.current?.close();
  }, [router]);

  function onOpenNotificationsModal(option: OptionData) {
    setOptionData(option);
    notifyUserModalRef.current?.present();
  }
  function onCloseNotificationsModal() {
    setOptionData(null);
  }

  return (
    <>
      <AddWalletModalUI
        onOpenNotificationsModal={onOpenNotificationsModal}
        createWallet={createWallet}
        restoreWallet={restoreWallet}
        addWalletModalRef={addWalletModalRef}
      />

      <NotifyUserModal
        optionData={optionData}
        onCloseNotificationsModal={onCloseNotificationsModal}
        notifyUserModalRef={notifyUserModalRef}
      />
    </>
  );
}
interface AddWalletModalUIProps extends AddWalletModalBaseProps {
  createWallet(): unknown;
  restoreWallet(): unknown;
  onOpenNotificationsModal(option: OptionData): unknown;
}
export function AddWalletModalUI({
  addWalletModalRef,
  createWallet,
  restoreWallet,
  onOpenNotificationsModal,
}: AddWalletModalUIProps) {
  const [moreOptionsVisible, setMoreOptionsVisible] = useState(false);
  const animatedPosition = useSharedValue<number>(CLOSED_ANIMATED_POSITION);

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
        <Box width="100%" style={{ height: 200, overflow: 'hidden' }} bg="ink.text-primary">
          <Image
            style={{ height: '100%' }}
            contentFit="cover"
            source={require('@/assets/create-wallet-image.png')}
          />
        </Box>
        <Box px="5" pt="5">
          <Text pb="5" variant="heading03">
            {t`Add wallet to "Use case"`}
          </Text>
          <Box flexDirection="column" gap="1">
            <AddWalletListItem
              onPress={createWallet}
              title={t`Create new wallet`}
              subtitle={t`Create a new Bitcoin and Stacks wallet`}
              Icon={PlusIcon}
            />
            <AddWalletListItem
              onPress={restoreWallet}
              title={t`Restore wallet`}
              subtitle={t`Import existing accounts`}
              Icon={ArrowRotateClockwise}
            />
            <AddWalletListItem
              onPress={openOptions}
              title={t`More options`}
              Icon={moreOptionsVisible ? undefined : DotGridHorizontal}
            />
            {!moreOptionsVisible
              ? null
              : Object.entries(getUnavailableFeatures()).map(featureEntry => {
                  const [featureKey, feature] = featureEntry;
                  return (
                    <AddWalletListItem
                      key={featureKey}
                      onPress={() =>
                        onOpenNotificationsModal({ title: feature.title, id: featureKey })
                      }
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
