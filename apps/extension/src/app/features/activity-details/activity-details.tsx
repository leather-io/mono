import { useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

import { btcAsset, stxAsset } from '@leather.io/constants';
import type { CryptoAssetChain } from '@leather.io/models';
import { baseCurrencyAmountInQuote } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { useBlockchainActivityByTxId } from '@app/query/activity/blockchain-activity.query';
import { useMarketData } from '@app/query/common/market-data/market-data.query';
import { useCurrentAccountAddresses } from '@app/services/accounts/use-account-addresses';

import { useSbtcDepositActivity } from '../activity-list/use-sbtc-deposit-activity';
import { ActivityDetailsLoading } from './activity-details-loading';
import { ActivityDetailsNotFound } from './activity-details-not-found';
import { ActivityDetailsLayout } from './activity-details.layout';

function parseChain(value: string | undefined): CryptoAssetChain | null {
  if (value === 'bitcoin' || value === 'stacks') return value;
  return null;
}

function useGoBack() {
  const navigate = useNavigate();
  const location = useLocation();
  return function goBack() {
    if (location.key === 'default') {
      void navigate(RouteUrls.Activity);
      return;
    }
    void navigate(-1);
  };
}

interface ResolvedActivityDetailsProps {
  chain: CryptoAssetChain;
  txid: string;
  onBack(): void;
}

function ResolvedActivityDetails({ chain, txid, onBack }: ResolvedActivityDetailsProps) {
  const account = useCurrentAccountAddresses();
  const query = useBlockchainActivityByTxId(account, chain, txid);
  const isViewedDeposit = useCallback((bitcoinTxid: string) => bitcoinTxid === txid, [txid]);
  const { overlays, standaloneItems } = useSbtcDepositActivity(isViewedDeposit);
  const marketData = useMarketData(chain === 'bitcoin' ? btcAsset : stxAsset);

  const item =
    query.data ?? standaloneItems.find(candidate => candidate.view.txid === txid) ?? null;

  if (!item) {
    if (query.isLoading) return <ActivityDetailsLoading onBack={onBack} />;
    return <ActivityDetailsNotFound chain={chain} txid={txid} onBack={onBack} />;
  }

  const { fee } = item.activity;
  const feeQuote =
    fee && marketData.state === 'success'
      ? baseCurrencyAmountInQuote(fee, marketData.value)
      : undefined;

  return (
    <ActivityDetailsLayout
      item={item}
      overlay={overlays.get(txid)}
      feeQuote={feeQuote}
      onBack={onBack}
    />
  );
}

export function ActivityDetails() {
  const { chain: chainParam, txid = '' } = useParams();
  const chain = parseChain(chainParam);
  const goBack = useGoBack();

  if (chain === null || txid === '') return <ActivityDetailsNotFound onBack={goBack} />;
  return <ResolvedActivityDetails chain={chain} txid={txid} onBack={goBack} />;
}
