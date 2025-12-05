import { useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';
import {
  CryptoAssetProtocols,
  type AccountAddresses,
  type Money,
} from '@leather.io/models';
import {
  BtcAvatarIcon,
  Callout,
  RunesAvatarIcon,
  Sip10AvatarIcon,
  Spinner,
  StxAvatarIcon,
} from '@leather.io/ui';
import {
  type SerializedCryptoAssetId,
  assertUnreachable,
  deserializeAssetId,
  getAssetId,
  serializeAssetId,
} from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { useAssetDescription } from '@app/query/assets/fungible-asset-info.query';
import { useMarketData } from '@app/query/common/market-data/market-data.query';
import { usePriceChangePercentage } from '@app/query/common/market-history/market-history.query';
import { useNativeSegwitBtcAccountBalance } from '@app/query/bitcoin/balance/btc-balance.hooks';
import { useRunesAccountBalance } from '@app/query/bitcoin/runes/runes-balance.query';
import { useAccountCollectibles } from '@app/query/collectibles/account-collectibles.query';
import { useActivity, useActivityByAsset } from '@app/query/activity/activity.query';
import { useSip10AccountBalance } from '@app/query/stacks/sip10/sip10-balance.hooks';
import { useStxAccountBalance } from '@app/query/stacks/balance/stx-balance.hooks';
import { useAccountAddresses } from '@app/services/use-account-addresses';
import { useCurrentAccountIndex } from '@app/store/accounts/account';
import { btcAsset, stxAsset } from '@leather.io/constants';

import { CollectibleTypeIconOverlay } from '../collectibles/components/collectible-type-icon-overlay.web';
import { InscriptionCard } from '../collectibles/components/inscription-card';
import { Sip9Card } from '../collectibles/components/sip9-card';
import { StampCard } from '../collectibles/components/stamp-card';

interface TokenDetailsRouteParams {
  assetId: SerializedCryptoAssetId;
}

interface TokenHeaderProps {
  icon: React.ReactNode;
  name: string;
  symbol: string;
  availableBalance?: Money;
  fiatBalance?: Money;
}

function TokenHeader({ icon, name, symbol, availableBalance, fiatBalance }: TokenHeaderProps) {
  const formattedAvailable =
    availableBalance &&
    availableBalance.amount
      .shiftedBy(-availableBalance.decimals)
      .toFormat(availableBalance.decimals > 8 ? 8 : availableBalance.decimals);

  const formattedFiat = fiatBalance ? formatCurrency(fiatBalance) : undefined;

  return (
    <Stack gap="space.02">
      <Flex alignItems="center" gap="space.03">
        <Box>{icon}</Box>
        <Box>
          <styled.div textStyle="heading.04">{name}</styled.div>
          <styled.div textStyle="label.02" color="ink.text-subdued">
            {symbol}
          </styled.div>
        </Box>
      </Flex>
      <Flex justifyContent="space-between" alignItems="baseline">
        <styled.div textStyle="heading.04">
          {formattedAvailable ? `${formattedAvailable} ${symbol}` : '—'}
        </styled.div>
        <styled.div textStyle="label.02" color="ink.text-subdued">
          {formattedFiat ?? '—'}
        </styled.div>
      </Flex>
    </Stack>
  );
}

interface TokenMetaProps {
  layer: string;
  price?: Money;
}

function TokenMeta({ layer, price }: TokenMetaProps) {
  return (
    <Stack border="default" borderRadius="md" p="space.04" gap="space.03">
      <styled.h2 textStyle="label.02" margin="0">
        Token details
      </styled.h2>
      <Flex justifyContent="space-between">
        <styled.span textStyle="caption.02" color="ink.text-subdued">
          Layer
        </styled.span>
        <styled.span textStyle="caption.02">{layer}</styled.span>
      </Flex>
      <Flex justifyContent="space-between">
        <styled.span textStyle="caption.02" color="ink.text-subdued">
          Price
        </styled.span>
        <styled.span textStyle="caption.02">
          {price ? formatCurrency(price, { showCurrency: true }) : '—'}
        </styled.span>
      </Flex>
    </Stack>
  );
}

interface BitcoinTokenDetailsProps {
  accountIndex: number;
  account: AccountAddresses;
}

function BitcoinTokenDetails({ accountIndex, account }: BitcoinTokenDetailsProps) {
  const balance = useNativeSegwitBtcAccountBalance(accountIndex);
  const marketData = useMarketData(btcAsset);
  const description = useAssetDescription(btcAsset);
  const priceChange = usePriceChangePercentage(btcAsset);
  const activityQuery = useActivityByAsset(account, btcAsset, {
    queryKeyContext: ['token-details'],
  });

  if (balance.state === 'loading' || marketData.state === 'loading') {
    return (
      <Box px="space.05" py="space.05" display="flex" justifyContent="center">
        <Spinner />
      </Box>
    );
  }

  if (balance.state === 'error' || marketData.state === 'error') {
    return (
      <Box px="space.05" py="space.05">
        <Callout variant="warning" title="Unable to load Bitcoin details">
          Try again in a few moments.
        </Callout>
      </Box>
    );
  }

  const availableBalance = balance.value.btc.availableBalance;
  const fiatBalance = balance.value.quote.availableBalance;
  const price = marketData.value.price;
  const changePercent = priceChange.state === 'success' ? priceChange.value : 0;
  const descriptionText = description.state === 'success' ? description.value.description : '';
  const activity = activityQuery.data ?? [];

  return (
    <Stack px="space.05" py="space.05" gap="space.05">
      <TokenHeader
        icon={<BtcAvatarIcon />}
        name="Bitcoin"
        symbol="BTC"
        availableBalance={availableBalance}
        fiatBalance={fiatBalance}
      />
      <TokenMeta layer="Layer 1 · Bitcoin" price={price} />
      {descriptionText ? (
        <Stack border="default" borderRadius="md" p="space.04">
          <styled.h2 textStyle="label.02" margin="0">
            Description
          </styled.h2>
          <styled.p textStyle="body.02" margin="0">
            {descriptionText}
          </styled.p>
        </Stack>
      ) : null}
      <Flex justifyContent="space-between">
        <styled.span textStyle="caption.02" color="ink.text-subdued">
          24h change
        </styled.span>
        <styled.span
          textStyle="caption.02"
          color={
            changePercent > 0
              ? 'green.action-primary-default'
              : changePercent < 0
                ? 'red.action-primary-default'
                : 'ink.text-subdued'
          }
        >
          {changePercent ? `${changePercent.toFixed(2)}%` : '—'}
        </styled.span>
      </Flex>
      {activity.length > 0 ? (
        <Stack border="default" borderRadius="md" p="space.04" gap="space.02">
          <styled.h2 textStyle="label.02" margin="0">
            Recent activity
          </styled.h2>
          {activity.slice(0, 3).map(item => (
            <Flex key={item.key} justifyContent="space-between">
              <styled.span textStyle="caption.02">{item.title}</styled.span>
              <styled.span textStyle="caption.02" color="ink.text-subdued">
                {item.caption}
              </styled.span>
            </Flex>
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}

interface StacksTokenDetailsProps {
  accountIndex: number;
  account: AccountAddresses;
}

function StacksTokenDetails({ accountIndex, account }: StacksTokenDetailsProps) {
  const balance = useStxAccountBalance(accountIndex);
  const marketData = useMarketData(stxAsset);
  const description = useAssetDescription(stxAsset);
  const priceChange = usePriceChangePercentage(stxAsset);
  const activityQuery = useActivityByAsset(account, stxAsset, {
    queryKeyContext: ['token-details'],
  });

  if (balance.state === 'loading' || marketData.state === 'loading') {
    return (
      <Box px="space.05" py="space.05" display="flex" justifyContent="center">
        <Spinner />
      </Box>
    );
  }

  if (balance.state === 'error' || marketData.state === 'error') {
    return (
      <Box px="space.05" py="space.05">
        <Callout variant="warning" title="Unable to load Stacks details">
          Try again in a few moments.
        </Callout>
      </Box>
    );
  }

  const availableBalance = balance.value.stx.availableUnlockedBalance;
  const fiatBalance = balance.value.quote.availableUnlockedBalance;
  const price = marketData.value.price;
  const changePercent = priceChange.state === 'success' ? priceChange.value : 0;
  const descriptionText = description.state === 'success' ? description.value.description : '';
  const activity = activityQuery.data ?? [];

  return (
    <Stack px="space.05" py="space.05" gap="space.05">
      <TokenHeader
        icon={<StxAvatarIcon />}
        name="Stacks"
        symbol="STX"
        availableBalance={availableBalance}
        fiatBalance={fiatBalance}
      />
      <TokenMeta layer="Layer 2 · Stacks" price={price} />
      {descriptionText ? (
        <Stack border="default" borderRadius="md" p="space.04">
          <styled.h2 textStyle="label.02" margin="0">
            Description
          </styled.h2>
          <styled.p textStyle="body.02" margin="0">
            {descriptionText}
          </styled.p>
        </Stack>
      ) : null}
      <Flex justifyContent="space-between">
        <styled.span textStyle="caption.02" color="ink.text-subdued">
          24h change
        </styled.span>
        <styled.span
          textStyle="caption.02"
          color={
            changePercent > 0
              ? 'green.action-primary-default'
              : changePercent < 0
                ? 'red.action-primary-default'
                : 'ink.text-subdued'
          }
        >
          {changePercent ? `${changePercent.toFixed(2)}%` : '—'}
        </styled.span>
      </Flex>
      {activity.length > 0 ? (
        <Stack border="default" borderRadius="md" p="space.04" gap="space.02">
          <styled.h2 textStyle="label.02" margin="0">
            Recent activity
          </styled.h2>
          {activity.slice(0, 3).map(item => (
            <Flex key={item.key} justifyContent="space-between">
              <styled.span textStyle="caption.02">{item.title}</styled.span>
              <styled.span textStyle="caption.02" color="ink.text-subdued">
                {item.caption}
              </styled.span>
            </Flex>
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}

interface Sip10TokenDetailsProps {
  accountIndex: number;
  account: AccountAddresses;
  assetId: SerializedCryptoAssetId;
}

function Sip10TokenDetails({ accountIndex, account, assetId }: Sip10TokenDetailsProps) {
  const sip10 = useSip10AccountBalance(accountIndex, { includeHiddenAssets: true });

  if (sip10.state === 'loading') {
    return (
      <Box px="space.05" py="space.05" display="flex" justifyContent="center">
        <Spinner />
      </Box>
    );
  }

  if (sip10.state === 'error' || !sip10.value) {
    return (
      <Box px="space.05" py="space.05">
        <Callout variant="warning" title="Unable to load token details">
          Try again in a few moments.
        </Callout>
      </Box>
    );
  }

  const entry = sip10.value.sip10s.find(item => serializeAssetId(getAssetId(item.asset)) === assetId);

  if (!entry) {
    return (
      <Box px="space.05" py="space.05">
        <Callout variant="info" title="Token not found">
          This token is not available for this account.
        </Callout>
      </Box>
    );
  }

  const { asset, crypto, quote } = entry;
  const marketData = useMarketData(asset);
  const description = useAssetDescription(asset);
  const priceChange = usePriceChangePercentage(asset);
  const activityQuery = useActivityByAsset(account, asset, {
    queryKeyContext: ['token-details'],
  });

  const availableBalance = crypto.availableBalance;
  const fiatBalance = quote.availableBalance;
  const price = marketData.state === 'success' ? marketData.value.price : undefined;
  const changePercent = priceChange.state === 'success' ? priceChange.value : 0;
  const descriptionText = description.state === 'success' ? description.value.description : '';
  const activity = activityQuery.data ?? [];

  return (
    <Stack px="space.05" py="space.05" gap="space.05">
      <TokenHeader
        icon={<Sip10AvatarIcon contractId={asset.assetId} imageCanonicalUri={asset.imageCanonicalUri} name={asset.name} />}
        name={asset.name}
        symbol={asset.symbol}
        availableBalance={availableBalance}
        fiatBalance={fiatBalance}
      />
      <TokenMeta layer="Layer 2 · Stacks" price={price} />
      {descriptionText ? (
        <Stack border="default" borderRadius="md" p="space.04">
          <styled.h2 textStyle="label.02" margin="0">
            Description
          </styled.h2>
          <styled.p textStyle="body.02" margin="0">
            {descriptionText}
          </styled.p>
        </Stack>
      ) : null}
      <Flex justifyContent="space-between">
        <styled.span textStyle="caption.02" color="ink.text-subdued">
          24h change
        </styled.span>
        <styled.span
          textStyle="caption.02"
          color={
            changePercent > 0
              ? 'green.action-primary-default'
              : changePercent < 0
                ? 'red.action-primary-default'
                : 'ink.text-subdued'
          }
        >
          {changePercent ? `${changePercent.toFixed(2)}%` : '—'}
        </styled.span>
      </Flex>
      {activity.length > 0 ? (
        <Stack border="default" borderRadius="md" p="space.04" gap="space.02">
          <styled.h2 textStyle="label.02" margin="0">
            Recent activity
          </styled.h2>
          {activity.slice(0, 3).map(item => (
            <Flex key={item.key} justifyContent="space-between">
              <styled.span textStyle="caption.02">{item.title}</styled.span>
              <styled.span textStyle="caption.02" color="ink.text-subdued">
                {item.caption}
              </styled.span>
            </Flex>
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}

interface RuneTokenDetailsProps {
  accountIndex: number;
  account: AccountAddresses;
  assetId: SerializedCryptoAssetId;
}

interface RuneTokenDetailsContentProps {
  asset: any;
  crypto: { availableBalance: Money };
  quote: { availableBalance: Money };
}

function RuneTokenDetailsContent({ asset, crypto, quote }: RuneTokenDetailsContentProps) {
  const description = useAssetDescription(asset);
  const priceChange = usePriceChangePercentage(asset);

  const descriptionText = description.state === 'success' ? description.value.description : '';
  const changePercent = priceChange.state === 'success' ? priceChange.value : 0;

  return (
    <Stack px="space.05" py="space.05" gap="space.05">
      <TokenHeader
        icon={<RunesAvatarIcon />}
        name={asset.spacedRuneName ?? asset.runeName}
        symbol={asset.symbol}
        availableBalance={crypto.availableBalance}
        fiatBalance={quote.availableBalance}
      />
      <TokenMeta layer="Layer 1 · Bitcoin" />
      {descriptionText ? (
        <Stack border="default" borderRadius="md" p="space.04">
          <styled.h2 textStyle="label.02" margin="0">
            Description
          </styled.h2>
          <styled.p textStyle="body.02" margin="0">
            {descriptionText}
          </styled.p>
        </Stack>
      ) : null}
      <Flex justifyContent="space-between">
        <styled.span textStyle="caption.02" color="ink.text-subdued">
          24h change
        </styled.span>
        <styled.span
          textStyle="caption.02"
          color={
            changePercent > 0
              ? 'green.action-primary-default'
              : changePercent < 0
                ? 'red.action-primary-default'
                : 'ink.text-subdued'
          }
        >
          {changePercent ? `${changePercent.toFixed(2)}%` : '—'}
        </styled.span>
      </Flex>
    </Stack>
  );
}

function RuneTokenDetails({ accountIndex, account, assetId }: RuneTokenDetailsProps) {
  const runes = useRunesAccountBalance(accountIndex, { includeHiddenAssets: true });

  if (runes.state === 'loading') {
    return (
      <Box px="space.05" py="space.05" display="flex" justifyContent="center">
        <Spinner />
      </Box>
    );
  }

  if (runes.state === 'error' || !runes.value) {
    return (
      <Box px="space.05" py="space.05">
        <Callout variant="warning" title="Unable to load rune details">
          Try again in a few moments.
        </Callout>
      </Box>
    );
  }

  const entry = runes.value.runes.find(item => serializeAssetId(getAssetId(item.asset)) === assetId);

  if (!entry) {
    return (
      <Box px="space.05" py="space.05">
        <Callout variant="info" title="Token not found">
          This rune is not available for this account.
        </Callout>
      </Box>
    );
  }

  const { asset, crypto, quote } = entry;

  return (
    <RuneTokenDetailsContent asset={asset} crypto={crypto} quote={quote} />
  );
}

interface CollectibleDetailsProps {
  account: AccountAddresses;
  assetId: SerializedCryptoAssetId;
  protocol: CryptoAssetProtocols.sip9 | CryptoAssetProtocols.inscription | CryptoAssetProtocols.stamp;
}

function CollectibleDetails({ account, assetId, protocol }: CollectibleDetailsProps) {
  const {
    data: collectibles = [],
    isLoading,
    isError,
  } = useAccountCollectibles(account);

  if (isLoading) {
    return (
      <Box px="space.05" py="space.05" display="flex" justifyContent="center">
        <Spinner />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box px="space.05" py="space.05">
        <Callout variant="warning" title="Unable to load collectible details">
          Try again in a few moments.
        </Callout>
      </Box>
    );
  }

  const view = collectibles.find(item => item.key === assetId);

  if (!view) {
    return (
      <Box px="space.05" py="space.05">
        <Callout variant="info" title="Collectible not found">
          This collectible is not available for this account.
        </Callout>
      </Box>
    );
  }

  const height = 260;

  let media: React.ReactNode = null;

  switch (protocol) {
    case CryptoAssetProtocols.stamp:
      media = <StampCard item={view.asset as any} height={height} />;
      break;
    case CryptoAssetProtocols.sip9:
      media = <Sip9Card item={view.asset as any} height={height} />;
      break;
    case CryptoAssetProtocols.inscription:
      media = <InscriptionCard item={view.asset as any} height={height} />;
      break;
    default:
      assertUnreachable(protocol);
  }

  const activityQuery = useActivity(account);
  const allActivity = activityQuery.data ?? [];
  const relatedActivity = filterActivityBySerializedAssetId(
    allActivity,
    assetId as SerializedCryptoAssetId
  );

  return (
    <Stack px="space.05" py="space.05" gap="space.05">
      <CollectibleTypeIconOverlay protocol={view.protocol}>{media}</CollectibleTypeIconOverlay>
      <Stack border="default" borderRadius="md" p="space.04" gap="space.02">
        <styled.h2 textStyle="label.02" margin="0">
          Collectible details
        </styled.h2>
        <Flex justifyContent="space-between">
          <styled.span textStyle="caption.02" color="ink.text-subdued">
            Name
          </styled.span>
          <styled.span textStyle="caption.02">{view.title}</styled.span>
        </Flex>
        <Flex justifyContent="space-between">
          <styled.span textStyle="caption.02" color="ink.text-subdued">
            Collection
          </styled.span>
          <styled.span textStyle="caption.02">{view.subtitle}</styled.span>
        </Flex>
        <Flex justifyContent="space-between">
          <styled.span textStyle="caption.02" color="ink.text-subdued">
            Protocol
          </styled.span>
          <styled.span textStyle="caption.02">{view.protocol}</styled.span>
        </Flex>
      </Stack>
      {relatedActivity.length > 0 ? (
        <Stack border="default" borderRadius="md" p="space.04" gap="space.02">
          <styled.h2 textStyle="label.02" margin="0">
            Recent activity
          </styled.h2>
          {relatedActivity.slice(0, 3).map(item => (
            <Flex key={item.key} justifyContent="space-between">
              <styled.span textStyle="caption.02">{item.title}</styled.span>
              <styled.span textStyle="caption.02" color="ink.text-subdued">
                {item.caption}
              </styled.span>
            </Flex>
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}

export function TokenDetails() {
  const { assetId } = useParams<TokenDetailsRouteParams>();

  const parsedAssetId = useMemo(() => {
    if (!assetId) return null;
    return deserializeAssetId(assetId as SerializedCryptoAssetId);
  }, [assetId]);

  const accountIndex = useCurrentAccountIndex();
  const account = useAccountAddresses(accountIndex);

  if (!assetId || !parsedAssetId) {
    return (
      <Box px="space.05" py="space.04">
        <styled.p textStyle="body.02">Token not found.</styled.p>
      </Box>
    );
  }

  const { protocol } = parsedAssetId;

  switch (protocol) {
    case CryptoAssetProtocols.nativeBtc:
      return <BitcoinTokenDetails accountIndex={accountIndex} account={account} />;
    case CryptoAssetProtocols.nativeStx:
      return <StacksTokenDetails accountIndex={accountIndex} account={account} />;
    case CryptoAssetProtocols.sip10:
      return (
        <Sip10TokenDetails
          accountIndex={accountIndex}
          account={account}
          assetId={assetId as SerializedCryptoAssetId}
        />
      );
    case CryptoAssetProtocols.rune:
      return (
        <RuneTokenDetails
          accountIndex={accountIndex}
          account={account}
          assetId={assetId as SerializedCryptoAssetId}
        />
      );
    case CryptoAssetProtocols.sip9:
    case CryptoAssetProtocols.inscription:
    case CryptoAssetProtocols.stamp:
      return (
        <CollectibleDetails
          account={account}
          assetId={assetId as SerializedCryptoAssetId}
          protocol={protocol as CollectibleDetailsProps['protocol']}
        />
      );
    default:
      assertUnreachable(protocol);
      return (
        <Box px="space.05" py="space.04">
          <styled.p textStyle="body.02">
            Unsupported asset protocol for details view.
          </styled.p>
        </Box>
      );
  }
}
