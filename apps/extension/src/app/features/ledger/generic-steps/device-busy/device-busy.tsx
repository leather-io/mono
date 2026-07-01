import { useLocationState } from '@app/common/hooks/use-location-state';
import { DeviceBusyLayout } from '@app/features/ledger/generic-steps';

export function DeviceBusy() {
  const description = useLocationState<string>('description');
  const address = useLocationState<string>('address');
  return (
    <DeviceBusyLayout activityDescription={description ?? 'Ledger device busy'} address={address} />
  );
}
