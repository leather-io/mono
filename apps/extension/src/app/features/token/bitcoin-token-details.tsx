import { btcAsset } from '@leather.io/constants';
import type { AccountAddresses, AccountId } from '@leather.io/models';
import { BtcAvatarIcon } from '@leather.io/ui';
import { createMoney } from '@leather.io/utils';

import { useReceiveDialog } from '@app/common/receive/use-receive-dialog-context';
import { copyToClipboard } from '@app/common/utils/copy-to-clipboard';
import { useToast } from '@app/features/toasts/use-toast';
import { useBlockchainActivityByAssetId } from '@app/query/activity/blockchain-activity.query';
import {
  useNativeSegwitBtcAccountBalance,
  useTaprootBtcAccountBalance,
} from '@app/query/bitcoin/balance/btc-balance.hooks';

import { BitcoinTokenDetailsLayout } from './bitcoin-token-details.layout';
import { useTokenMarketInfo } from './hooks/use-token-market-info';
import { TokenDetailsError } from './token-details-error';
import { TokenDetailsLoading } from './token-details-loading';

interface BitcoinTokenDetailsProps {
  accountId: AccountId;
  account: AccountAddresses;
}
export function BitcoinTokenDetails({ accountId, account }: BitcoinTokenDetailsProps) {
  const { showReceive } = useReceiveDialog();
  const toast = useToast();

  const nativeSegwitBalance = useNativeSegwitBtcAccountBalance(accountId);
  const taprootBalance = useTaprootBtcAccountBalance(accountId);
  const marketInfo = useTokenMarketInfo(btcAsset);
  const activityQuery = useBlockchainActivityByAssetId(account, btcAsset);

  function handleCopyAddress(address: string) {
    void copyToClipboard(address);
    toast.success('Address copied to clipboard');
  }

  function handleOpenReceive() {
    showReceive('btc');
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

  const hdBitcoin = account.bitcoin?.type === 'hd' ? account.bitcoin : undefined;
  const nativeSegwitAddress = hdBitcoin?.zeroIndexNativeSegwitPayerAddress;
  const taprootAddress = hdBitcoin?.zeroIndexTaprootPayerAddress;

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
