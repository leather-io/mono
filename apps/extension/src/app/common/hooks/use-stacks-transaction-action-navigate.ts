import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { RouteUrls } from '@shared/route-urls';

import { StacksTransactionActionType } from '@app/common/transactions/stacks/transaction.utils';
import { useWalletType } from '@app/common/use-wallet-type';
import { whenPageMode } from '@app/common/utils';
import { openIndexPageInNewTab } from '@app/common/utils/open-in-new-tab';

export function useStacksTransactionActionNavigate() {
  const navigate = useNavigate();
  const { whenWallet } = useWalletType();

  return useCallback(
    (txid: string, action: StacksTransactionActionType) => {
      const routeUrl =
        action === StacksTransactionActionType.IncreaseFee
          ? RouteUrls.IncreaseStacksFee.replace(':txid', txid)
          : RouteUrls.CancelStacksTransaction.replace(':txid', txid);

      return whenWallet({
        ledger: () =>
          whenPageMode({
            full: () => void navigate(routeUrl),
            popup: () => void openIndexPageInNewTab(routeUrl),
          })(),
        software: () => navigate(routeUrl),
      })();
    },
    [navigate, whenWallet]
  );
}
