import { DeviceBusyLayout } from './device-busy.layout';

interface DeviceBusyProps {
  description?: string;
  address?: string;
}
export function DeviceBusy({ description, address }: DeviceBusyProps) {
  return (
    <DeviceBusyLayout activityDescription={description ?? 'Ledger device busy'} address={address} />
  );
}
