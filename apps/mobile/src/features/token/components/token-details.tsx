import React from 'react';

import { Balance } from '@/components/balance/balance';
import { TokenIcon } from '@/features/balances/token-icon';
import { t } from '@lingui/macro';

import { FungibleCryptoAsset, Money } from '@leather.io/models';
import { Box, Text } from '@leather.io/ui/native';

import { TokenDescription } from './token-description';
import { TokenDetailsCard, TokenDetailsWrapper } from './token-details-card';
import { TokenDetailsTable } from './token-details-table';
import { TokenOverview } from './token-overview';
import { TokenPriceChange } from './token-price-change';

interface TokenDetailsProps {
  accountDetails: React.ReactNode;
  asset: FungibleCryptoAsset;
  assetDescription: string;
  availableBalance: Money;
  price: Money;
  changePercent: number;
  quoteBalance: Money;
  ticker: string;
}

export function TokenDetails({
  accountDetails,
  asset,
  assetDescription,
  availableBalance,
  price,
  changePercent,
  quoteBalance,
  ticker,
}: TokenDetailsProps) {
  return (
    <TokenDetailsWrapper>
      <TokenOverview
        isLoading={false}
        heading={<TokenIcon ticker={ticker} />}
        availableBalance={
          <Box flexDirection="row" alignItems="center" gap="1">
            <Balance balance={availableBalance} variant="heading03" />
            <Text variant="heading03" color="ink.text-subdued">
              {asset.symbol}
            </Text>
          </Box>
        }
        quoteBalance={<Balance balance={quoteBalance} variant="label01" isQuoteCurrency />}
      />

      <TokenDescription>{assetDescription}</TokenDescription>

      <TokenDetailsTable
        name={`${asset.chain} (${asset.symbol})`} //TODO this should use name
        ticker={asset.symbol}
        network={asset.chain}
        price={<Balance balance={price} variant="label02" lineHeight={16} isQuoteCurrency />}
        priceChange={
          <TokenPriceChange
            // PETE this needs the same empty handling state as balances. Maybe pass <Balance in to assetPrice and have it wrapped with isLoading
            price={price}
            changePercent={changePercent}
          />
        }
      />

      {accountDetails}

      <TokenDetailsCard title={t({ id: 'token.activity.header_title', message: 'Activity' })} />
    </TokenDetailsWrapper>
  );
}
