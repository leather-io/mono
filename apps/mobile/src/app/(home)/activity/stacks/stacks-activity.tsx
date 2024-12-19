import { useStacksActivity } from '@/queries/activity/stacks-activity.query';
import {
  useStacksSignerAddressFromAccountIndex,
  useStacksSignerAddresses,
} from '@/store/keychains/stacks/stacks-keychains.read';

import { StacksActivityCell } from './stacks-activity-cell';

export function StacksActivity() {
  const addresses = useStacksSignerAddresses();
  const { query, pendingTxs, confirmedTxs } = useStacksActivity(addresses);
  console.log('=====================================');
  // actually all balance stuff
  console.log(
    'StacksActivity activity',
    // query // {"isPending": false, "totalData": []}
    pendingTxs,
    confirmedTxs
    // activity.map(activity => activity.data)
  );
  console.log('=====================================');
  return confirmedTxs.map(tx => <StacksActivityCell key={tx.tx_id} tx={tx} />);
}

interface StacksActivityByAccountProps {
  accountIndex: number;
  fingerprint: string;
  onPress?(): void;
}
export function StacksActivityByAccount({
  accountIndex,
  fingerprint,
  onPress,
}: StacksActivityByAccountProps) {
  const address = useStacksSignerAddressFromAccountIndex(fingerprint, accountIndex);
  if (!address) {
    throw new Error('Stacks address not found');
  }
  const { confirmedTxs } = useStacksActivity([address]);
  //   console.log('StacksActivityByAccount activity', activity);
  return confirmedTxs.map(tx => <StacksActivityCell tx={tx} />);
}
