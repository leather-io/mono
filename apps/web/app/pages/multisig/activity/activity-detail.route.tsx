import { type MetaDescriptor } from 'react-router';

import { WhenClient } from '~/components/when-client';

import { ActivityDetailPage } from './activity-detail.page';

export function meta() {
  return [{ title: 'Activity – Leather Multisig' }] satisfies MetaDescriptor[];
}

export default function ActivityDetailRoute() {
  return (
    <WhenClient>
      <ActivityDetailPage />
    </WhenClient>
  );
}
