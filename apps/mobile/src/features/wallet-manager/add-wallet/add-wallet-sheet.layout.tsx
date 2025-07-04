import { RefObject, useState } from 'react';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { NotifyUserSheetData } from '@/components/sheets/notify-user-sheet.layout';
import { useWaitlistFlag } from '@/features/feature-flags';
import { WaitlistIds } from '@/features/waitlist/ids';
import { TestId } from '@/shared/test-id';
import { t } from '@lingui/macro';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import {
  ArrowRotateClockwiseIcon,
  Box,
  CLOSED_ANIMATED_SHARED_VALUE,
  EllipsisVIcon,
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

import { AddWalletCell } from './add-wallet-cell';

const AnimatedBox = Animated.createAnimatedComponent(Box);

interface AddWalletSheetBaseProps {
  addWalletSheetRef: RefObject<SheetRef | null>;
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
            {moreOptionsVisible && releaseWaitlistFeatures && (
              <>
                <AddWalletCell
                  title={t({
                    id: 'add_wallet.connect_wallet.cell_title',
                    message: 'Connect hardware wallet',
                  })}
                  caption={t({
                    id: 'add_wallet.connect_wallet.cell_caption',
                    message: 'Ledger, Ryder, Trezor and more',
                  })}
                  icon={<SignalIcon color="ink.text-subdued" />}
                  onPress={() => {
                    router.navigate('/hardware-wallets');
                    addWalletSheetRef.current?.close();
                  }}
                />
                <AddWalletCell
                  title={t({
                    id: 'add_wallet.email_wallet.cell_title',
                    message: 'Create or restore via email address',
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
                        message: 'Create or restore via email address',
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
                    message: 'BitGo, Fireblocks, Fordefi and more',
                  })}
                  icon={<PaletteIcon color="ink.text-subdued" />}
                  onPress={() => {
                    router.navigate('/mpc-wallets');
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
                    message: 'No key required',
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
