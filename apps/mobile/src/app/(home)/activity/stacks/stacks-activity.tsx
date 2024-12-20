import { useStacksActivity } from '@/queries/activity/stacks-activity.query';
import {
  useStacksSignerAddressFromAccountIndex,
  useStacksSignerAddresses,
} from '@/store/keychains/stacks/stacks-keychains.read';

import { Text } from '@leather.io/ui/native';

import { StacksActivityCell } from './stacks-activity-cell';

export function StacksActivity() {
  const addresses = useStacksSignerAddresses();
  const { pendingTxs, confirmedTxs } = useStacksActivity(addresses);

  const pendingTxsList = pendingTxs.map(tx => (
    <StacksActivityCell
      key={tx.tx_id}
      tx={tx}
      isOriginator={addresses.includes(tx?.sender_address)}
    />
  ));
  const confirmedTxsList = confirmedTxs.map(tx => (
    <StacksActivityCell
      key={tx.tx_id}
      tx={tx}
      isOriginator={addresses.includes(tx?.sender_address)}
    />
  ));
  return (
    <>
      <Text>Pending</Text>
      {pendingTxsList}
      <Text>Confirmed</Text>
      {confirmedTxsList}
    </>
  );
}

interface StacksActivityByAccountProps {
  accountIndex: number;
  fingerprint: string;
  onPress?(): void;
}
export function StacksActivityByAccount({
  accountIndex,
  fingerprint,
}: StacksActivityByAccountProps) {
  const address = useStacksSignerAddressFromAccountIndex(fingerprint, accountIndex);
  if (!address) {
    throw new Error('Stacks address not found');
  }
  const { confirmedTxs } = useStacksActivity([address]);
  return confirmedTxs.map(tx => <StacksActivityCell tx={tx} />);
}
