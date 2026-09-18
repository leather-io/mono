import type { CryptoAssetChain } from '@leather.io/models';

import { analytics } from '@shared/utils/analytics';

import { useBitcoinExplorerLink } from '@app/common/hooks/use-bitcoin-explorer-link';
import { useStacksExplorerLink } from '@app/common/hooks/use-stacks-explorer-link';

export function useOpenActivityInExplorer() {
  const { handleOpenBitcoinTxLink } = useBitcoinExplorerLink();
  const { handleOpenStacksTxLink } = useStacksExplorerLink();

  return function openActivityInExplorer(chain: CryptoAssetChain, txid: string) {
    if (chain === 'bitcoin') {
      analytics.track('view_bitcoin_transaction');
      handleOpenBitcoinTxLink({ txid });
      return;
    }
    analytics.track('view_transaction');
    handleOpenStacksTxLink({ txid });
  };
}
