import { ActivitySelectors } from '@tests/selectors/activity.selectors';
import type { BoxProps } from 'leather-styles/jsx';

import { ArrowLeftIcon } from '@leather.io/ui';

import { Header } from '@app/components/layout/headers/header';
import { HeaderActionButton } from '@app/components/layout/headers/header-action-button';

interface ActivityDetailsHeaderProps {
  onBack(): void;
  px?: BoxProps['px'];
}

export function ActivityDetailsHeader({
  onBack,
  px = ['space.03', null, 'space.00'],
}: ActivityDetailsHeaderProps) {
  return (
    <Header px={px}>
      <HeaderActionButton
        icon={<ArrowLeftIcon />}
        onAction={onBack}
        dataTestId={ActivitySelectors.ActivityDetailsBack}
      />
    </Header>
  );
}
