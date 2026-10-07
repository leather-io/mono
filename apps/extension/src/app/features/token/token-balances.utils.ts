import type { QuotedBtcBalance } from '@leather.io/services';

import {
  type BtcBalanceCategory,
  btcBalanceCategories,
  btcBalanceCategoryMap,
} from '@app/pages/all-balances/all-balances.utils';

import type { TokenBalanceEntry } from './components/token-balances-tab';

const alwaysShownCategory: BtcBalanceCategory = 'available';

export function getBtcBalanceEntries(
  { btc, quote }: QuotedBtcBalance,
  onSelectCategory: (category: BtcBalanceCategory) => void
): TokenBalanceEntry[] {
  return btcBalanceCategories
    .filter(
      category =>
        category === alwaysShownCategory ||
        btc[btcBalanceCategoryMap[category].balanceKey].amount.isGreaterThan(0)
    )
    .map(category => {
      const { balanceKey, title, tooltipText } = btcBalanceCategoryMap[category];
      return {
        title,
        tooltipText,
        amount: btc[balanceKey],
        fiatAmount: quote[balanceKey],
        onPressRow: () => onSelectCategory(category),
        testId: `token-details-balance-${category}`,
      };
    });
}
