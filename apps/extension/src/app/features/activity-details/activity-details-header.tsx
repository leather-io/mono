import { ActivitySelectors } from '@tests/selectors/activity.selectors';

import { DetailsHeader } from '@app/components/details/details-header';

interface ActivityDetailsHeaderProps {
  onBack(): void;
}

export function ActivityDetailsHeader({ onBack }: ActivityDetailsHeaderProps) {
  return (
    <DetailsHeader
      title="Transaction"
      onBack={onBack}
      backTestId={ActivitySelectors.ActivityDetailsBack}
      titleTestId={ActivitySelectors.ActivityDetailsTitle}
    />
  );
}
