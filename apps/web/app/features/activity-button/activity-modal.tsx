import { Stack, styled } from 'leather-styles/jsx';

import { Sheet } from '@leather.io/ui';

interface ActivityModalProps {
  isOpen: boolean;
  onClose(): void;
  activityList: React.ReactElement;
}

export function ActivityModal({ isOpen, onClose, activityList }: ActivityModalProps) {
  return (
    <Sheet isShowing={isOpen} onClose={onClose} footer={null}>
      <styled.div pt="space.05">
        <styled.h2 pl="space.05" textStyle="heading.05" mb="space.04">
          Activity
        </styled.h2>
        <Stack height="40vh" overflow="none">
          {activityList}
        </Stack>
      </styled.div>
    </Sheet>
  );
}
