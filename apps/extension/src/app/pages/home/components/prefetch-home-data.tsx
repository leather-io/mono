import { useActivity } from '@app/query/activity/activity.query';
import { useAccountCollectibles } from '@app/query/collectibles/account-collectibles.query';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentAccountId } from '@app/store/accounts/account';

export function PrefetchHomeData() {
  const accountId = useCurrentAccountId();
  const account = useAccountAddresses(accountId);
  useAccountCollectibles(account);
  useActivity(account);
  return null;
}
