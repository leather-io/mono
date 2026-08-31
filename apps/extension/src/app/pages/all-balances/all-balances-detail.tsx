import { useMemo } from 'react';
import { Navigate, useParams } from 'react-router';

import { AllBalancesSelectors } from '@tests/selectors/all-balances.selectors';
import { Flex, Stack, styled } from 'leather-styles/jsx';

import { btcAsset } from '@leather.io/constants';
import type { Money, NumType } from '@leather.io/models';
import { BtcAvatarIcon, Flag, InfoCircleIcon } from '@leather.io/ui';
import { baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { Content } from '@app/components/layout';
import { Header } from '@app/components/layout/headers/header';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import { useCurrentUtxosFetchState } from '@app/query/bitcoin/utxos/utxos.hooks';
import { useMarketData } from '@app/query/common/market-data/market-data.query';
import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

import {
  type BtcBalanceCategory,
  btcBalanceCategoryMap,
  formatBalance,
  groupUtxosByAddress,
  isBtcBalanceCategory,
  sumUtxoSats,
} from './all-balances.utils';
import { AddressBalanceGroup } from './components/address-balance-group';
import { BalanceAmount } from './components/balance-amount';

const shortenedTxidLength = 8;

export function AllBalancesDetail() {
  const { category } = useParams();

  if (!isBtcBalanceCategory(category)) return <Navigate to={RouteUrls.AllBalances} replace />;

  return <AllBalancesDetailContent category={category} />;
}

interface AllBalancesDetailContentProps {
  category: BtcBalanceCategory;
}

function AllBalancesDetailContent({ category }: AllBalancesDetailContentProps) {
  const utxosState = useCurrentUtxosFetchState();
  const marketData = useMarketData(btcAsset);

  const { title, tooltipText, utxoKey } = btcBalanceCategoryMap[category];

  const { addressGroups, totalSats } = useMemo(() => {
    const categoryUtxos = utxosState.state === 'success' ? utxosState.value[utxoKey] : [];
    return {
      addressGroups: groupUtxosByAddress(categoryUtxos),
      totalSats: sumUtxoSats(categoryUtxos),
    };
  }, [utxosState, utxoKey]);

  const isLoading = utxosState.state === 'loading' || marketData.state === 'loading';
  const hasUtxos = utxosState.state === 'success';

  function calculateFiatValue(sats: NumType): Money | undefined {
    if (marketData.state !== 'success') return undefined;
    return baseCurrencyAmountInQuote(createMoney(sats, 'BTC'), marketData.value);
  }

  return (
    <Flex
      height="100vh"
      direction="column"
      data-testid={AllBalancesSelectors.AllBalancesDetailPage}
    >
      <Header px="space.04">
        <HeaderGrid
          leftCol={<HeaderBackButton />}
          centerCol={<styled.span textStyle="heading.05">All balances</styled.span>}
        />
      </Header>
      <Content>
        <Flex
          direction="column"
          width="100%"
          height="100%"
          overflowY="auto"
          px="space.05"
          pb="space.05"
        >
          <Flex
            justifyContent="space-between"
            alignItems="flex-start"
            pt="space.04"
            data-testid={AllBalancesSelectors.DetailTotal}
          >
            <Stack gap="space.02">
              <BasicTooltip label={tooltipText} side="top">
                <Flag
                  reverse
                  spacing="space.01"
                  img={<InfoCircleIcon color="ink.text-subdued" display="inline" variant="small" />}
                >
                  <styled.h2 textStyle="label.02">{title}</styled.h2>
                </Flag>
              </BasicTooltip>
              <BalanceAmount
                textStyle="heading.03"
                value={formatBalance(calculateFiatValue(totalSats))}
                isLoading={isLoading}
                skeletonWidth="140px"
                skeletonHeight="32px"
              />
              <Flex alignItems="center" gap="space.01">
                <BalanceAmount
                  textStyle="caption.01"
                  color="ink.text-subdued"
                  value={formatBalance(createMoney(totalSats, 'BTC'))}
                  isLoading={isLoading}
                  skeletonWidth="60px"
                  skeletonHeight="16px"
                />
                <styled.span textStyle="caption.01" color="ink.text-subdued">
                  across {addressGroups.length}{' '}
                  {addressGroups.length === 1 ? 'address' : 'addresses'}
                </styled.span>
              </Flex>
            </Stack>
            <BtcAvatarIcon />
          </Flex>

          {hasUtxos && addressGroups.length === 0 && (
            <styled.span
              textStyle="caption.01"
              color="ink.text-subdued"
              py="space.05"
              data-testid={AllBalancesSelectors.DetailEmpty}
            >
              No UTXOs in this category
            </styled.span>
          )}

          {addressGroups.map(group => (
            <AddressBalanceGroup
              key={group.address}
              address={group.address}
              addressTypeLabel={group.addressTypeLabel}
              fiatValue={formatBalance(calculateFiatValue(group.totalSats))}
              cryptoValue={formatBalance(createMoney(group.totalSats, 'BTC'))}
              utxos={group.utxos.map((utxo, index) => ({
                key: `${utxo.txid}:${utxo.vout}:${index}`,
                label: `${utxo.txid.slice(0, shortenedTxidLength)}…:${utxo.vout}`,
                caption: utxo.height ? undefined : 'Unconfirmed',
                fiatValue: formatBalance(calculateFiatValue(utxo.value)),
                cryptoValue: formatBalance(createMoney(utxo.value, 'BTC')),
              }))}
            />
          ))}
        </Flex>
      </Content>
    </Flex>
  );
}
