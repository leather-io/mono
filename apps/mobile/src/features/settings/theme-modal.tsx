import { RefObject } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CLOSED_ANIMATED_SHARED_VALUE, Modal } from '@/components/bottom-sheet-modal';
import { ModalHeader } from '@/components/headers/modal-header';
import { useSettings } from '@/state/settings/settings.slice';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { Box, Cell, SunIcon, Theme } from '@leather.io/ui/native';

interface ThemeModalProps {
  modalRef: RefObject<BottomSheetModal>;
}
export function ThemeModal({ modalRef }: ThemeModalProps) {
  const animatedIndex = useSharedValue<number>(CLOSED_ANIMATED_SHARED_VALUE);
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const settings = useSettings();

  return (
    <Modal isScrollView animatedIndex={animatedIndex} ref={modalRef}>
      <Box
        style={{
          paddingHorizontal: theme.spacing['5'],
          paddingTop: theme.spacing['4'],
          paddingBottom: theme.spacing['5'] + bottom,
          gap: theme.spacing[5],
        }}
      >
        <ModalHeader
          Icon={SunIcon}
          modalVariant="normal"
          onPressSupport={() => {}}
          title={t`Theme`}
        />
        {/* TODO: Is 'system' available? */}
        {/* <Cell
          isSelected
          onPress={() => settings.changeTheme('system')}
          title={t`System`}
          variant="radio"
        /> */}
        <Cell
          isSelected={settings.theme === 'light'}
          onPress={() => settings.changeTheme('light')}
          title={t`Light`}
          variant="radio"
        />
        <Cell
          isSelected={settings.theme === 'dark'}
          onPress={() => settings.changeTheme('dark')}
          title={t`Dark`}
          variant="radio"
        />
      </Box>
    </Modal>
  );
}
