import { RefObject, useCallback, useRef, useState } from 'react';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { APP_ROUTES } from '@/constants';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import {
  Box,
  ColorSwatchIcon,
  EllipsisHIcon,
  EmailIcon,
  EyeIcon,
  NfcIcon,
  PlusIcon,
  ReloadIcon,
  Text,
  Theme,
  TouchableOpacity,
} from '@leather.io/ui/native';

import { CLOSED_ANIMATED_SHARED_VALUE, Modal } from '../bottom-sheet-modal';
import { NotifyUserModal, OptionData } from '../notify-user-modal';

interface AddWalletListItemProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress(): unknown;
}
export function AddWalletListItem({ icon, title, subtitle, onPress }: AddWalletListItemProps) {
  return (
    <TouchableOpacity onPress={onPress} py="3" flexDirection="row" gap="4" alignItems="center">
      {icon && (
        <Box flexDirection="row" p="2" bg="ink.background-secondary" borderRadius="round">
          {icon}
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

function getUnavailableFeatures(theme: Theme) {
  const UNAVAILABLE_FEATURES = {
    hardwareWallet: {
      title: t`Connect hardware wallet`,
      subtitle: t`Ledger, Trezor, Ryder and more`,
      icon: <NfcIcon color={theme.colors['ink.text-subdued']} />,
    },
    emailRestore: {
      title: t`Create or restore via email`,
      subtitle: t`Access custodial wallet`,
      icon: <EmailIcon color={theme.colors['ink.text-subdued']} />,
    },
    mpcWallet: {
      title: t`Connect MPC wallet`,
      subtitle: t`Import existing accounts`,
      icon: <ColorSwatchIcon color={theme.colors['ink.text-subdued']} />,
    },
    watchOnlyWallet: {
      title: t`Create watch-only wallet`,
      subtitle: t`No key needed`,
      icon: <EyeIcon color={theme.colors['ink.text-subdued']} />,
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
  const animatedIndex = useSharedValue<number>(CLOSED_ANIMATED_SHARED_VALUE);
  const theme = useTheme<Theme>();

  function openOptions() {
    setMoreOptionsVisible(!moreOptionsVisible);
  }
  const animatedStyle = useAnimatedStyle(() => ({
    marginTop: interpolate(animatedIndex.value, [-1, 0], [-200, 0], Extrapolation.CLAMP),
    marginBottom: interpolate(animatedIndex.value, [-1, 0], [200, 0], Extrapolation.CLAMP),
  }));

  return (
    <Modal isScrollView animatedIndex={animatedIndex} ref={addWalletModalRef}>
      <AnimatedBox style={animatedStyle}>
        <Box width="100%" style={{ height: 200, overflow: 'hidden' }} bg="ink.text-primary">
          <Image
            style={{ height: '100%' }}
            contentFit="cover"
            source={require('@/assets/create-wallet-image.png')}
          />
        </Box>
        <Box p="5">
          <Text pb="5" variant="heading03">
            {t`Add wallet to "Use case"`}
          </Text>
          <Box flexDirection="column" gap="1">
            <AddWalletListItem
              onPress={createWallet}
              title={t`Create new wallet`}
              subtitle={t`Create a new Bitcoin and Stacks wallet`}
              icon={<PlusIcon />}
            />
            <AddWalletListItem
              onPress={restoreWallet}
              title={t`Restore wallet`}
              subtitle={t`Import existing accounts`}
              icon={<ReloadIcon />}
            />
            <AddWalletListItem
              onPress={openOptions}
              title={t`More options`}
              icon={moreOptionsVisible ? undefined : <EllipsisHIcon />}
            />
            {!moreOptionsVisible
              ? null
              : Object.entries(getUnavailableFeatures(theme)).map(featureEntry => {
                  const [featureKey, feature] = featureEntry;
                  return (
                    <AddWalletListItem
                      key={featureKey}
                      onPress={() =>
                        onOpenNotificationsModal({ title: feature.title, id: featureKey })
                      }
                      title={feature.title}
                      subtitle={feature.subtitle}
                      icon={feature.icon}
                    />
                  );
                })}
          </Box>
        </Box>
      </AnimatedBox>
    </Modal>
  );
}
