import { useSelector } from 'react-redux';

import { DeviceBusyLayout } from '@app/features/ledger/generic-steps';
import type { RootState } from '@app/store';

export function DeviceBusy() {
  const description = useSelector((state: RootState) => state.navigation.ledger.description);
  return <DeviceBusyLayout activityDescription={description ?? 'Ledger device busy'} />;
}
