import { useState } from 'react';

import { FetchState, FetchWrapper } from '@/components/loading';
import { BalanceViewProps, OnOpenTokenProps } from '@/features/balances/balances';
import { TokenBalance } from '@/features/token/components/token-balance';
import {
  useSip10AccountBalance,
  useSip10TotalBalance,
} from '@/queries/balance/sip10-balance.query';
import { ViewMode } from '@/shared/types';
import { FlashList } from '@shopify/flash-list';

import { Money } from '@leather.io/models';
import { Sip10AddressBalance, Sip10AggregateBalance } from '@leather.io/services';
import { Box, Sip10AvatarIcon } from '@leather.io/ui/native';

import { SIP10_BALANCES_LIMIT, SIP10_BALANCES_WIDGET_LIMIT } from '../constants';
import { sortSip10Balances } from '../utils/sort-sip10-balances';

interface Sip10TokenBalanceProps {
  availableBalance?: Money;
  contractId: string;
  quoteBalance?: Money;
  imageCanonicalUri: string;
  name: string;
  symbol: string;
  onPress?(): void;
}
function Sip10TokenBalance({
  availableBalance,
  contractId,
  quoteBalance,
  imageCanonicalUri,
  name,
  onPress,
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
      onPress={onPress}
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
  onPress?: ({ asset, availableBalance, quoteBalance }: OnOpenTokenProps) => void;
}
function Sip10BalanceWrapper({ data, mode = 'full', onPress }: Sip10BalanceWrapperProps) {
  const displayLimit = mode === 'widget' ? SIP10_BALANCES_WIDGET_LIMIT : undefined;

  const [renderLimit, setRenderLimit] = useState(displayLimit ?? SIP10_BALANCES_LIMIT);

  return (
    <FetchWrapper data={data} error={<Sip10TokenBalanceError />}>
      {data.state === 'success' && (
        <Box flex={1} width="100%" height="100%">
          <FlashList
            data={data.value.sip10s.sort(sortSip10Balances).slice(0, displayLimit)}
            renderItem={({ item }: { item: Sip10AggregateBalance['sip10s'][number] }) => (
              <Sip10TokenBalance
                availableBalance={item.crypto.availableBalance}
                contractId={item.asset.contractId}
                quoteBalance={item.quote.totalBalance}
                imageCanonicalUri={item.asset.imageCanonicalUri}
                onPress={() => {
                  // pass balance and quote balance to the sheet from here
                  onPress?.({
                    asset: item.asset,
                    availableBalance: item.crypto.availableBalance,
                    quoteBalance: item.quote.totalBalance,
                  });
                }}
                name={item.asset.name}
                symbol={item.asset.symbol}
              />
            )}
            estimatedItemSize={72}
            keyExtractor={(_, index) => `token.${index}`}
            showsVerticalScrollIndicator={false}
            onEndReached={() => setRenderLimit(renderLimit + 10)}
            onEndReachedThreshold={0.5}
          />
        </Box>
      )}
    </FetchWrapper>
  );
}

export function Sip10Balance({ mode, onPress }: BalanceViewProps) {
  const data = useSip10TotalBalance();
  return <Sip10BalanceWrapper data={data} mode={mode} onPress={onPress} />;
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
