import { useNavigate } from 'react-router';

import { btcAsset } from '@leather.io/constants';
import type { AccountAddresses } from '@leather.io/models';
import { BtcAvatarIcon } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';

import { useReceiveDialog } from '@app/common/receive/use-receive-dialog-context';
import { useBlockchainActivityByAssetId } from '@app/query/activity/blockchain-activity.query';
import { useBtcAccountBalanceByAddresses } from '@app/query/bitcoin/balance/btc-balance.hooks';

import { BitcoinTokenDetailsLayout } from './bitcoin-token-details.layout';
import type { TokenAddressEntry } from './components/token-balances-tab';
import { useCopyAddress } from './hooks/use-copy-address';
import { useTokenMarketInfo } from './hooks/use-token-market-info';
import { getBtcBalanceEntries } from './token-balances.utils';
import { TokenDetailsError } from './token-details-error';
import { TokenDetailsLoading } from './token-details-loading';

interface PolicyBitcoinTokenDetailsProps {
  account: AccountAddresses;
}

export function PolicyBitcoinTokenDetails({ account }: PolicyBitcoinTokenDetailsProps) {
  const navigate = useNavigate();
  const { showReceive } = useReceiveDialog();
  const copyAddress = useCopyAddress();

  const balance = useBtcAccountBalanceByAddresses(account);
  const marketInfo = useTokenMarketInfo(btcAsset);
  const activityQuery = useBlockchainActivityByAssetId(account, btcAsset);

  const address = account.bitcoin?.type === 'fixedAddress' ? account.bitcoin.address : undefined;

  function handleOpenReceive() {
    showReceive('btc');
  }

  const isLoading = balance.state === 'loading' || marketInfo.isLoading;
  const hasError = balance.state === 'error' || marketInfo.hasError;

  if (isLoading) {
    return <TokenDetailsLoading title="Bitcoin" />;
  }

  if (hasError || balance.state !== 'success') {
    return <TokenDetailsError title="Bitcoin" />;
  }

  const balances = getBtcBalanceEntries(
    balance.value,
    category => void navigate(RouteUrls.AllBalancesDetail.replace(':category', category))
  );

  const addresses: TokenAddressEntry[] = address
    ? [
        {
          title: 'Multisig',
          address,
          amount: balance.value.btc.availableBalance,
          fiatAmount: balance.value.quote.availableBalance,
          onPressAddress: () => copyAddress(address),
          onPressRow: handleOpenReceive,
        },
      ]
    : [];

  return (
    <BitcoinTokenDetailsLayout
      icon={<BtcAvatarIcon size="xl" />}
      balance={balance.value.btc.totalBalance}
      fiatBalance={balance.value.quote.totalBalance}
      price={marketInfo.price!}
      descriptionText={marketInfo.descriptionText}
      balances={balances}
      addresses={addresses}
      activity={activityQuery.data ?? []}
      isActivityLoading={activityQuery.isLoading}
      isSwapEnabled={false}
    />
  );
}
