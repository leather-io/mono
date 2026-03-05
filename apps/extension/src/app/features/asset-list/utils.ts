import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import type { CryptoAsset } from '@leather.io/models';

import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';

import { whenPageMode } from '@app/common/utils';
import { openIndexPageInNewTab } from '@app/common/utils/open-in-new-tab';
import { useFlags } from '@app/features/feature-flags';
import { useActivityByAsset } from '@app/query/activity/activity.query';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentAccountIndex } from '@app/store/accounts/account';

export function useCryptoAssetBuy(asset: CryptoAsset) {
  const navigate = useNavigate();
  const accountIndex = useCurrentAccountIndex();
  const account = useAccountAddresses(accountIndex);
  const activityQuery = useActivityByAsset(account, asset);
  const { releaseOnramperBuy } = useFlags();
  const showBuyButton =
    activityQuery.isSuccess && !activityQuery.data?.length && releaseOnramperBuy;

  const onBuy = useCallback(() => {
    const route = RouteUrls.Fund.replace(':chain?', asset.chain);
    whenPageMode({
      full() {
        void navigate(route);
      },
      popup() {
        void openIndexPageInNewTab(route);
        closeWindow();
      },
    })();
  }, [asset.chain, navigate]);

  return { onBuy, showBuyButton };
}
