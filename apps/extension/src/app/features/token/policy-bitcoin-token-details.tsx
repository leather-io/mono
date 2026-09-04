import { btcAsset } from '@leather.io/constants';
import type { AccountAddresses } from '@leather.io/models';
import { BtcAvatarIcon } from '@leather.io/ui';

import { useReceiveDialog } from '@app/common/receive/use-receive-dialog-context';
import { copyToClipboard } from '@app/common/utils/copy-to-clipboard';
import { useToast } from '@app/features/toasts/use-toast';
import { useBlockchainActivityByAssetId } from '@app/query/activity/blockchain-activity.query';
import { useBtcAccountBalanceByAddresses } from '@app/query/bitcoin/balance/btc-balance.hooks';

import { BitcoinTokenDetailsLayout } from './bitcoin-token-details.layout';
import { useTokenMarketInfo } from './hooks/use-token-market-info';
import { TokenDetailsError } from './token-details-error';
import { TokenDetailsLoading } from './token-details-loading';

interface PolicyBitcoinTokenDetailsProps {
  account: AccountAddresses;
}

export function PolicyBitcoinTokenDetails({ account }: PolicyBitcoinTokenDetailsProps) {
  const { showReceive } = useReceiveDialog();
  const toast = useToast();

  const balance = useBtcAccountBalanceByAddresses(account);
  const marketInfo = useTokenMarketInfo(btcAsset);
  const activityQuery = useBlockchainActivityByAssetId(account, btcAsset);

  const address = account.bitcoin?.type === 'fixedAddress' ? account.bitcoin.address : undefined;

  function handleCopyAddress() {
    if (!address) return;
    void copyToClipboard(address);
    toast.success('Address copied to clipboard');
  }

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

  const balances = [
    {
      title: 'Multisig',
      address,
      btcBalance: balance.value.btc.availableBalance,
      fiatBalance: balance.value.quote.availableBalance,
      onPressAddress: address ? handleCopyAddress : undefined,
      onPressRow: handleOpenReceive,
    },
  ];

  return (
    <BitcoinTokenDetailsLayout
      icon={<BtcAvatarIcon size="xl" />}
      totalBalance={balance.value.btc.totalBalance}
      fiatBalance={balance.value.quote.totalBalance}
      price={marketInfo.price!}
      changePercent={marketInfo.changePercent}
      priceChangeDelta={marketInfo.priceChangeDelta}
      descriptionText={marketInfo.descriptionText}
      balances={balances}
      activity={activityQuery.data ?? []}
      isSwapEnabled={false}
    />
  );
}
