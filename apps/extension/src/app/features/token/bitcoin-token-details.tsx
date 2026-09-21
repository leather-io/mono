import { useNavigate } from 'react-router';

import { btcAsset } from '@leather.io/constants';
import type { AccountAddresses, AccountId } from '@leather.io/models';
import { isBaseEntirelyDisabled } from '@leather.io/state/swap';
import { BtcAvatarIcon } from '@leather.io/ui';
import { aggregateBtcBalances, getAssetId } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { useReceiveDialog } from '@app/common/receive/use-receive-dialog-context';
import { useSwapDisabledPairs } from '@app/pages/swap/hooks/use-swap-disabled-pairs';
import { useBlockchainActivityByAssetId } from '@app/query/activity/blockchain-activity.query';
import {
  useNativeSegwitBtcAccountBalance,
  useTaprootBtcAccountBalance,
} from '@app/query/bitcoin/balance/btc-balance.hooks';

import { BitcoinTokenDetailsLayout } from './bitcoin-token-details.layout';
import type { TokenAddressEntry } from './components/token-balances-tab';
import { useCopyAddress } from './hooks/use-copy-address';
import { useTokenMarketInfo } from './hooks/use-token-market-info';
import { getBtcBalanceEntries } from './token-balances.utils';
import { TokenDetailsError } from './token-details-error';
import { TokenDetailsLoading } from './token-details-loading';

interface BitcoinTokenDetailsProps {
  accountId: AccountId;
  account: AccountAddresses;
}
export function BitcoinTokenDetails({ accountId, account }: BitcoinTokenDetailsProps) {
  const navigate = useNavigate();
  const { showReceive } = useReceiveDialog();
  const copyAddress = useCopyAddress();

  const nativeSegwitBalance = useNativeSegwitBtcAccountBalance(accountId);
  const taprootBalance = useTaprootBtcAccountBalance(accountId);
  const marketInfo = useTokenMarketInfo(btcAsset);
  const disabledPairs = useSwapDisabledPairs();
  const isSwapEnabled = !isBaseEntirelyDisabled(getAssetId(btcAsset), disabledPairs);
  const activityQuery = useBlockchainActivityByAssetId(account, btcAsset);

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

  const btc = aggregateBtcBalances([nativeSegwitBalance.value.btc, taprootBalance.value.btc]);
  const quote = aggregateBtcBalances([nativeSegwitBalance.value.quote, taprootBalance.value.quote]);

  const balances = getBtcBalanceEntries(
    { btc, quote },
    category => void navigate(RouteUrls.AllBalancesDetail.replace(':category', category))
  );

  const hdBitcoin = account.bitcoin?.type === 'hd' ? account.bitcoin : undefined;
  const nativeSegwitAddress = hdBitcoin?.zeroIndexNativeSegwitPayerAddress;
  const taprootAddress = hdBitcoin?.zeroIndexTaprootPayerAddress;

  const addresses: TokenAddressEntry[] = [];

  if (nativeSegwitAddress) {
    addresses.push({
      title: 'Native Segwit',
      address: nativeSegwitAddress,
      amount: nativeSegwitBalance.value.btc.availableBalance,
      fiatAmount: nativeSegwitBalance.value.quote.availableBalance,
      onPressAddress: () => copyAddress(nativeSegwitAddress),
      onPressRow: handleOpenReceive,
    });
  }

  if (taprootAddress) {
    addresses.push({
      title: 'Taproot',
      address: taprootAddress,
      amount: taprootBalance.value.btc.availableBalance,
      fiatAmount: taprootBalance.value.quote.availableBalance,
      onPressAddress: () => copyAddress(taprootAddress),
      onPressRow: handleOpenReceive,
    });
  }

  return (
    <BitcoinTokenDetailsLayout
      icon={<BtcAvatarIcon size="xl" />}
      balance={btc.totalBalance}
      fiatBalance={quote.totalBalance}
      price={marketInfo.price!}
      descriptionText={marketInfo.descriptionText}
      balances={balances}
      addresses={addresses}
      activity={activityQuery.data ?? []}
      isSwapEnabled={isSwapEnabled}
    />
  );
}
