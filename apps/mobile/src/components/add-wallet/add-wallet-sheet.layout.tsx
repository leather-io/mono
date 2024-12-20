import { RefObject, useState } from 'react';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { WaitlistIds } from '@/features/waitlist/ids';
import { AppRoutes } from '@/routes';
import { TestId } from '@/shared/test-id';
import { t } from '@lingui/macro';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import {
  ArrowRotateClockwiseIcon,
  Box,
  CLOSED_ANIMATED_SHARED_VALUE,
  EllipsisHIcon,
  EmailIcon,
  Eye2Icon,
  PaletteIcon,
  PlusIcon,
  Sheet,
  SheetRef,
  SignalIcon,
  Text,
  ThemeVariant,
} from '@leather.io/ui/native';

import { NotifyUserSheetData } from '../sheets/notify-user-sheet.layout';
import { AddWalletCell } from './add-wallet-cell';

const AnimatedBox = Animated.createAnimatedComponent(Box);

interface AddWalletSheetBaseProps {
  addWalletSheetRef: RefObject<SheetRef>;
}

interface AddWalletSheetLayoutProps extends AddWalletSheetBaseProps {
  createWallet(): unknown;
  restoreWallet(): unknown;
  onOpenSheet(option: NotifyUserSheetData): unknown;
  themeVariant: ThemeVariant;
  opensFully?: boolean;
}
export function AddWalletSheetLayout({
  addWalletSheetRef,
  createWallet,
  restoreWallet,
  onOpenSheet,
  themeVariant,
  opensFully,
}: AddWalletSheetLayoutProps) {
  const [moreOptionsVisible, setMoreOptionsVisible] = useState(!!opensFully);
  const animatedIndex = useSharedValue<number>(CLOSED_ANIMATED_SHARED_VALUE);
  const router = useRouter();

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
        <Box width="100%" style={{ height: 200, overflow: 'hidden' }} bg="ink.text-primary">
          <Image
            style={{ height: '100%' }}
            contentFit="cover"
            source={require('@/assets/create-wallet-image.png')}
          />
        </Box>
        <Box>
          <Box p="5">
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
                message: 'Create a new Bitcoin and Stacks wallet',
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
                message: 'Import existing accounts',
              })}
              testID={TestId.restoreWalletSheetButton}
              icon={<ArrowRotateClockwiseIcon />}
            />
            <AddWalletCell
              onPress={openOptions}
              title={t({
                id: 'add_wallet.options.cell_title',
                message: 'More options',
              })}
              icon={moreOptionsVisible ? undefined : <EllipsisHIcon />}
            />
            {moreOptionsVisible && (
              <>
                <AddWalletCell
                  title={t({
                    id: 'add_wallet.connect_wallet.cell_title',
                    message: 'Connect hardware wallet',
                  })}
                  caption={t({
                    id: 'add_wallet.connect_wallet.cell_caption',
                    message: 'Ledger, Trezor, Ryder and more',
                  })}
                  icon={<SignalIcon color="ink.text-subdued" />}
                  onPress={() => {
                    router.navigate(AppRoutes.HardwareWallets);
                    addWalletSheetRef.current?.close();
                  }}
                />
                <AddWalletCell
                  title={t({
                    id: 'add_wallet.email_wallet.cell_title',
                    message: 'Create or restore via email',
                  })}
                  caption={t({
                    id: 'add_wallet.email_wallet.cell_caption',
                    message: 'Access custodial wallet',
                  })}
                  icon={<EmailIcon color="ink.text-subdued" />}
                  onPress={() => {
                    onOpenSheet({
                      title: t({
                        id: 'email_wallet.header_title',
                        message: 'Create or restore via email',
                      }),
                      id: WaitlistIds.restoreViaEmail,
                    });
                  }}
                />
                <AddWalletCell
                  title={t({
                    id: 'add_wallet.mpc_wallet.cell_title',
                    message: 'Connect MPC wallet',
                  })}
                  caption={t({
                    id: 'add_wallet.mpc_wallet.cell_caption',
                    message: 'Import existing accounts',
                  })}
                  icon={<PaletteIcon color="ink.text-subdued" />}
                  onPress={() => {
                    router.navigate(AppRoutes.MpcWallets);
                    addWalletSheetRef.current?.close();
                  }}
                />
                <AddWalletCell
                  title={t({
                    id: 'add_wallet.watch_only_wallet.cell_title',
                    message: 'Create watch-only wallet',
                  })}
                  caption={t({
                    id: 'add_wallet.watch_only_wallet.cell_caption',
                    message: 'No key needed',
                  })}
                  icon={<Eye2Icon color="ink.text-subdued" />}
                  onPress={() => {
                    onOpenSheet({
                      title: t({
                        id: 'notify_user.watch_only_wallet.header_title',
                        message: 'Create watch-only wallet',
                      }),
                      id: WaitlistIds.watchOnlyWallet,
                    });
                  }}
                />
              </>
            )}
          </Box>
        </Box>
      </AnimatedBox>
    </Sheet>
  );
}
