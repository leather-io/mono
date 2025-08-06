import { useState } from 'react';

import { FetchState, FetchWrapper } from '@/components/loading';
import { BalanceViewProps, OnOpenTokenProps } from '@/features/balances/balances';
import { TokenBalance, TokenBalanceProps } from '@/features/token/components/token-balance';
import {
  useSip10AccountBalance,
  useSip10TotalBalance,
} from '@/queries/balance/sip10-balance.query';
import { ViewMode } from '@/shared/types';
import { FlashList } from '@shopify/flash-list';

import { Sip10AddressBalance, Sip10AggregateBalance } from '@leather.io/services';
import { Box, Sip10AvatarIcon } from '@leather.io/ui/native';

import { SIP10_BALANCES_LIMIT, SIP10_BALANCES_WIDGET_LIMIT } from '../constants';
import { sortSip10Balances } from '../utils/sort-sip10-balances';

interface Sip10TokenBalanceProps extends Omit<TokenBalanceProps, 'icon'> {
  contractId: string;
  imageCanonicalUri: string;
}
function Sip10TokenBalance({ contractId, imageCanonicalUri, ...rest }: Sip10TokenBalanceProps) {
  return (
    <TokenBalance
      icon={
        <Sip10AvatarIcon
          contractId={contractId}
          imageCanonicalUri={imageCanonicalUri}
          name={rest.tokenName}
        />
      }
      {...rest}
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
                tokenName={item.asset.name}
                ticker={item.asset.symbol}
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
  onPress,
}: Sip10BalanceByAccountProps & BalanceViewProps) {
  const data = useSip10AccountBalance(fingerprint, accountIndex);

  return (
    <Sip10BalanceWrapper
      data={data}
      mode={mode}
      onPress={props => onPress?.({ ...props, fingerprint, accountIndex })}
    />
  );
}
