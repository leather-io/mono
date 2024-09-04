import { RefObject } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { CLOSED_ANIMATED_SHARED_VALUE, Modal } from '@/components/bottom-sheet-modal';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';

import { Text } from '@leather.io/ui/native';

interface BitcoinUnitModalProps {
  modalRef: RefObject<BottomSheetModal>;
}
export function BitcoinUnitModal({ modalRef }: BitcoinUnitModalProps) {
  const animatedIndex = useSharedValue<number>(CLOSED_ANIMATED_SHARED_VALUE);

  return (
    <Modal isScrollView animatedIndex={animatedIndex} ref={modalRef}>
      <Text>{t`Hello`}</Text>
    </Modal>
  );
}