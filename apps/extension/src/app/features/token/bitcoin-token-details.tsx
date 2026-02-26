import { useLocation, useNavigate } from 'react-router';

import { btcAsset } from '@leather.io/constants';
import type { AccountAddresses } from '@leather.io/models';
import { BtcAvatarIcon } from '@leather.io/ui';
import { createMoney } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { copyToClipboard } from '@app/common/utils/copy-to-clipboard';
import { useToast } from '@app/features/toasts/use-toast';
import { useActivityByAsset } from '@app/query/activity/activity.query';
import {
  useNativeSegwitBtcAccountBalance,
  useTaprootBtcAccountBalance,
} from '@app/query/bitcoin/balance/btc-balance.hooks';

import { BitcoinTokenDetailsLayout } from './bitcoin-token-details.layout';
import { useTokenMarketInfo } from './hooks/use-token-market-info';
import { TokenDetailsError } from './token-details-error';
import { TokenDetailsLoading } from './token-details-loading';

interface BitcoinTokenDetailsProps {
  accountIndex: number;
  account: AccountAddresses;
}

export function BitcoinTokenDetails({ accountIndex, account }: BitcoinTokenDetailsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const nativeSegwitBalance = useNativeSegwitBtcAccountBalance(accountIndex);
  const taprootBalance = useTaprootBtcAccountBalance(accountIndex);
  const marketInfo = useTokenMarketInfo(btcAsset);
  const activityQuery = useActivityByAsset(account, btcAsset);

  function handleCopyAddress(address: string) {
    void copyToClipboard(address);
    toast.success('Address copied to clipboard');
  }

  function handleOpenReceive() {
    void navigate(`/${RouteUrls.ReceiveBtc}`, { state: { backgroundLocation: location } });
  }

  const isLoading =
    nativeSegwitBalance.state === 'loading' ||
    taprootBalance.state === 'loading' ||
    marketInfo.isLoading;

  const hasError =
    nativeSegwitBalance.state === 'error' ||
    taprootBalance.state === 'error' ||
    marketInfo.hasError;

  if (isLoading) {
    return <TokenDetailsLoading title="Bitcoin" />;
  }

  if (hasError) {
    return <TokenDetailsError title="Bitcoin" />;
  }

  if (nativeSegwitBalance.state !== 'success' || taprootBalance.state !== 'success') {
    return <TokenDetailsLoading title="Bitcoin" />;
  }

  const nativeBtc = nativeSegwitBalance.value.btc.totalBalance;
  const taprootBtc = taprootBalance.value.btc.totalBalance;
  const totalBalance = createMoney(nativeBtc.amount.plus(taprootBtc.amount), nativeBtc.symbol);

  const nativeQuote = nativeSegwitBalance.value.quote.totalBalance;
  const taprootQuote = taprootBalance.value.quote.totalBalance;
  const fiatBalance = createMoney(nativeQuote.amount.plus(taprootQuote.amount), nativeQuote.symbol);

  const nativeSegwitAddress = account.bitcoin?.zeroIndexNativeSegwitPayerAddress;
  const taprootAddress = account.bitcoin?.zeroIndexTaprootPayerAddress;

  const balances = [
    {
      title: 'Native Segwit',
      address: nativeSegwitAddress,
      btcBalance: nativeSegwitBalance.value.btc.availableBalance,
      fiatBalance: nativeSegwitBalance.value.quote.availableBalance,
      onPressAddress: nativeSegwitAddress
        ? () => handleCopyAddress(nativeSegwitAddress)
        : undefined,
      onPressRow: handleOpenReceive,
    },
    {
      title: 'Taproot',
      address: taprootAddress,
      btcBalance: taprootBalance.value.btc.availableBalance,
      fiatBalance: taprootBalance.value.quote.availableBalance,
      onPressAddress: taprootAddress ? () => handleCopyAddress(taprootAddress) : undefined,
      onPressRow: handleOpenReceive,
    },
  ];

  return (
    <BitcoinTokenDetailsLayout
      icon={<BtcAvatarIcon size="xl" />}
      totalBalance={totalBalance}
      fiatBalance={fiatBalance}
      price={marketInfo.price!}
      changePercent={marketInfo.changePercent}
      priceChangeDelta={marketInfo.priceChangeDelta}
      descriptionText={marketInfo.descriptionText}
      balances={balances}
      activity={activityQuery.data ?? []}
    />
  );
}
