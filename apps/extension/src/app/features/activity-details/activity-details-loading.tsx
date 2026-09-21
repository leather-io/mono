import { ActivitySelectors } from '@tests/selectors/activity.selectors';
import { Flex } from 'leather-styles/jsx';

import { LoadingSpinner } from '@leather.io/ui';

import { DetailsScreen } from '@app/components/details/details-screen';

import { ActivityDetailsHeader } from './activity-details-header';

interface ActivityDetailsLoadingProps {
  onBack(): void;
}

export function ActivityDetailsLoading({ onBack }: ActivityDetailsLoadingProps) {
  return (
    <DetailsScreen
      header={<ActivityDetailsHeader onBack={onBack} />}
      testId={ActivitySelectors.ActivityDetails}
      overview={
        <Flex bg="ink.background-primary" alignItems="center" justifyContent="center" py="space.09">
          <LoadingSpinner />
        </Flex>
      }
    >
      {null}
    </DetailsScreen>
  );
}
