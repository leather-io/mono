import { type ReactNode } from 'react';

import { Stack, styled } from 'leather-styles/jsx';

import { type ActivityView } from '@leather.io/features';

import { formatCurrency } from '@app/common/currency-formatter';

import { ActivityItem } from '../activity-list/components/activity-item';

interface TokenActivitySectionProps {
  heading: ReactNode;
  activity: ActivityView[];
}

export function TokenActivitySection({ heading, activity }: TokenActivitySectionProps) {
  if (activity.length === 0) return null;

  return (
    <Stack border="default" borderRadius="md" p="space.04" gap="space.02">
      <styled.h2 textStyle="label.02" margin="0">
        {heading}
      </styled.h2>
      <Stack>
        {activity.map(item => (
          <ActivityItem key={item.key} item={item} formatCurrency={formatCurrency} />
        ))}
      </Stack>
    </Stack>
  );
}
