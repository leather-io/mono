import { formatCurrency } from '~/utils/currency-formatter';

import { createBlockchainActivityView } from '@leather.io/features';
import type { AccountAddresses } from '@leather.io/models';
import { createBlockchainActivityQueryConfig } from '@leather.io/queries';
import type { ActivityResponse, UserSettings } from '@leather.io/services';

function selectBlockchainActivityViews(response: ActivityResponse) {
  return response.items.map(item =>
    createBlockchainActivityView(item, { formatMoney: formatCurrency })
  );
}

export function createBlockchainActivityViewsQuery(
  account: AccountAddresses,
  settings: UserSettings
) {
  return {
    ...createBlockchainActivityQueryConfig({ account }, settings),
    select: selectBlockchainActivityViews,
  };
}
