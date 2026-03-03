import { useActivity } from '@app/query/activity/activity.query';
import { useAccountCollectibles } from '@app/query/collectibles/account-collectibles.query';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentAccountIndex } from '@app/store/accounts/account';

export function PrefetchHomeData() {
  const accountIndex = useCurrentAccountIndex();
  const account = useAccountAddresses(accountIndex);
  useAccountCollectibles(account);
  useActivity(account);
  return null;
}
