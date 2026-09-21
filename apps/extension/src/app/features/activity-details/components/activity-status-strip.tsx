import type { ReactNode } from 'react';

import { ActivitySelectors } from '@tests/selectors/activity.selectors';
import { css } from 'leather-styles/css';
import { Stack, styled } from 'leather-styles/jsx';

import { StatusIndicatorLine, type StatusIndicatorLineStatus } from '@leather.io/ui';

import type { ActivityStatus, ActivityStatusTone } from '../activity-details-summary';

const indicatorStatuses: Record<ActivityStatusTone, StatusIndicatorLineStatus> = {
  default: 'completed',
  success: 'completed',
  warning: 'pending',
  error: 'error',
};

const stripBackgrounds: Record<ActivityStatusTone, string> = {
  default: css({ bg: 'ink.background-secondary' }),
  success: css({ bg: 'green.background-primary' }),
  warning: css({ bg: 'yellow.background-primary' }),
  error: css({ bg: 'red.background-primary' }),
};

const stripLabelColors: Record<ActivityStatusTone, string> = {
  default: css({ color: 'ink.text-primary' }),
  success: css({ color: 'green.action-primary-default' }),
  warning: css({ color: 'orange.action-primary-default' }),
  error: css({ color: 'red.action-primary-default' }),
};

interface ActivityStatusStripProps {
  status: ActivityStatus;
  dateLabel?: string;
  note?: ReactNode;
  actions?: ReactNode;
}

export function ActivityStatusStrip({
  status,
  dateLabel,
  note,
  actions,
}: ActivityStatusStripProps) {
  return (
    <Stack gap="space.00" width="100%">
      <StatusIndicatorLine status={indicatorStatuses[status.tone]} />
      <Stack gap="space.02" px="space.05" py="space.03" className={stripBackgrounds[status.tone]}>
        <styled.p textStyle="label.03" data-testid={ActivitySelectors.ActivityDetailsStatus}>
          <styled.span className={stripLabelColors[status.tone]}>{status.label}</styled.span>
          {dateLabel ? (
            <styled.span color="ink.text-primary">{` ${status.preposition} ${dateLabel}`}</styled.span>
          ) : null}
        </styled.p>
        {note ? (
          <styled.p textStyle="caption.01" color="ink.text-subdued">
            {note}
          </styled.p>
        ) : null}
        {actions}
      </Stack>
    </Stack>
  );
}
