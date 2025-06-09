import { useCallback, useMemo } from 'react';

import { FetchState, FetchWrapper } from '@/components/loading';
import { BalanceViewProps } from '@/features/balances/balances';
import {
  useSip10AccountBalance,
  useSip10TotalBalance,
} from '@/queries/balance/sip10-balance.query';
import { ViewMode } from '@/shared/types';
import { FlashList } from '@shopify/flash-list';

import { Money } from '@leather.io/models';
import { Sip10AddressBalance, Sip10AggregateBalance } from '@leather.io/services';
import { Sip10AvatarIcon } from '@leather.io/ui/native';

import { SIP10_BALANCES_WIDGET_LIMIT } from '../constants';
import { TokenBalance } from '../token-balance';
import { sortSip10Balances } from '../utils/sort-sip10-balances';

interface Sip10TokenBalanceProps {
  availableBalance?: Money;
  contractId: string;
  quoteBalance?: Money;
  imageCanonicalUri: string;
  name: string;
  symbol: string;
}
function Sip10TokenBalance({
  availableBalance,
  contractId,
  quoteBalance,
  imageCanonicalUri,
  name,
  symbol,
}: Sip10TokenBalanceProps) {
  return (
    <TokenBalance
      ticker={symbol}
      icon={
        <Sip10AvatarIcon
          contractId={contractId}
          imageCanonicalUri={imageCanonicalUri}
          name={name}
        />
      }
      tokenName={name}
      quoteBalance={quoteBalance}
      availableBalance={availableBalance}
    />
  );
}

function Sip10TokenBalanceError() {
  return (
    <TokenBalance
      ticker=""
      icon={<Sip10AvatarIcon contractId="" imageCanonicalUri="" name="" />}
      tokenName=""
      quoteBalance={undefined}
      availableBalance={undefined}
    />
  );
}

interface Sip10BalanceWrapperProps {
  data: FetchState<Sip10AggregateBalance | Sip10AddressBalance>;
  mode: ViewMode;
}
function Sip10BalanceWrapper({ data, mode = 'full' }: Sip10BalanceWrapperProps) {
  const displayLimit = mode === 'widget' ? SIP10_BALANCES_WIDGET_LIMIT : undefined;
  const sortedData = useMemo(() => {
    if (data.state !== 'success') return [];
    return data.value.sip10s.sort(sortSip10Balances).slice(0, displayLimit);
  }, [data, displayLimit]);

  const renderItem = useCallback(
    ({ item }: { item: Sip10AggregateBalance['sip10s'][number] }) => (
      <Sip10TokenBalance
        availableBalance={item.crypto.availableBalance}
        contractId={item.asset.contractId}
        quoteBalance={item.quote.totalBalance}
        imageCanonicalUri={item.asset.imageCanonicalUri}
        name={item.asset.name}
        symbol={item.asset.symbol}
      />
    ),
    []
  );

  return (
    <FetchWrapper data={data} error={<Sip10TokenBalanceError />}>
      {data.state === 'success' && <FlashList data={sortedData} renderItem={renderItem} />}
    </FetchWrapper>
  );
}

export function Sip10Balance({ mode }: BalanceViewProps) {
  const data = useSip10TotalBalance();
  return <Sip10BalanceWrapper data={data} mode={mode} />;
}

interface Sip10BalanceByAccountProps {
  accountIndex: number;
  fingerprint: string;
}
export function Sip10BalanceByAccount({
  mode,
  accountIndex,
  fingerprint,
}: Sip10BalanceByAccountProps & BalanceViewProps) {
  const data = useSip10AccountBalance(fingerprint, accountIndex);

  return <Sip10BalanceWrapper data={data} mode={mode} />;
}
