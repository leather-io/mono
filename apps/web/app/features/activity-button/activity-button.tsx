import { useState } from 'react';

import { useLeatherConnect } from '~/store/addresses';

import { Button, PulseIcon } from '@leather.io/ui';

import { ActivityModal } from './activity-modal';

export function ActivityButton({ activityList }: { activityList: React.ReactElement }) {
  const [isOpen, setIsOpen] = useState(false);
  const { status } = useLeatherConnect();

  if (status !== 'connected') {
    return null;
  }

  return (
    <>
      <Button
        alignSelf="center"
        size="md"
        variant="ghost"
        mr="space.04"
        onClick={() => setIsOpen(true)}
        iconStart={PulseIcon}
      >
        Activity
      </Button>
      <ActivityModal isOpen={isOpen} activityList={activityList} onClose={() => setIsOpen(false)} />
    </>
  );
}
