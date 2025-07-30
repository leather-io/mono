import React from 'react';

import { Balance } from '@/components/balance/balance';
import { t } from '@lingui/macro';

import { FungibleCryptoAsset, Money } from '@leather.io/models';
import { Box, Text } from '@leather.io/ui/native';
import { capitalize } from '@leather.io/utils';

import { getChainLayerFromAssetProtocol } from '../utils/get-chain-layer-from-protocol';
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
  icon: React.ReactNode;
}

export function TokenDetails({
  accountDetails,
  asset,
  assetDescription,
  availableBalance,
  price,
  changePercent,
  quoteBalance,
  icon,
}: TokenDetailsProps) {
  return (
    <TokenDetailsWrapper>
      <TokenOverview
        isLoading={false}
        heading={icon}
        availableBalance={
          <Box flexDirection="row" alignItems="center" gap="1">
            <Balance
              balance={availableBalance}
              formattingOptions={{ showCurrency: false }}
              variant="heading03"
            />
            <Text variant="heading03" color="ink.text-subdued">
              {asset.symbol}
            </Text>
          </Box>
        }
        quoteBalance={<Balance balance={quoteBalance} variant="label01" />}
      />
      {assetDescription && <TokenDescription>{assetDescription}</TokenDescription>}

      <TokenDetailsTable
        name={`${capitalize(asset.chain)} (${asset.symbol})`}
        // for Layer design has 'Layer 1 (Bitcoin)' but no other examples. Only showing 'Layer 1' for now based on previous use of getChainLayerFromAssetProtocol
        layer={getChainLayerFromAssetProtocol(asset.protocol)}
        price={<Balance balance={price} variant="label02" lineHeight={16} />}
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
