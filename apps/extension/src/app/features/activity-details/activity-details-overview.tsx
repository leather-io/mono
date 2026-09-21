import type { ReactNode } from 'react';

import { Stack } from 'leather-styles/jsx';

import type { ActivityDetailsSummary } from './activity-details-summary';
import { ActivityOutcomeGroups } from './components/activity-outcome-group';
import { ActivityStatusHeadline } from './components/activity-status-headline';
import { ActivityStatusStrip } from './components/activity-status-strip';

interface ActivityDetailsOverviewProps {
  summary: ActivityDetailsSummary;
  requester?: ReactNode;
  note?: ReactNode;
  actions?: ReactNode;
  contract?: ReactNode;
  account?: ReactNode;
}

export function ActivityDetailsOverview({
  summary,
  requester,
  note,
  actions,
  contract,
  account,
}: ActivityDetailsOverviewProps) {
  return (
    <Stack gap="space.00" width="100%" bg="ink.background-primary">
      <ActivityStatusHeadline headline={summary.headline} requester={requester} />
      <ActivityStatusStrip
        status={summary.status}
        dateLabel={summary.dateLabel}
        note={note}
        actions={actions}
      />
      {summary.outcomes.length > 0 ? (
        <ActivityOutcomeGroups
          outcomes={summary.outcomes}
          tone={summary.status.tone}
          counterparty={summary.counterparty}
        />
      ) : null}
      {contract}
      {account}
    </Stack>
  );
}
