import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

import { AllBalancesSelectors } from '@tests/selectors/all-balances.selectors';
import { AddressType, getAddressInfo } from 'bitcoin-address-validation';
import { Flex, Stack, styled } from 'leather-styles/jsx';

import type { OwnedUtxo } from '@leather.io/models';
import { ArrowLeftIcon, BtcAvatarIcon, InfoCircleIcon } from '@leather.io/ui';
import { createMoney } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { formatCurrency } from '@app/common/currency-formatter';
import { Content } from '@app/components/layout';
import { Header } from '@app/components/layout/headers/header';
import { HeaderActionButton } from '@app/components/layout/headers/header-action-button';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import { LoadingSpinner } from '@app/components/loading-spinner';
import { useCurrentUtxos } from '@app/query/bitcoin/utxos/utxos.hooks';
import { useCalculateBitcoinFiatValue } from '@app/query/common/market-data/market-data.hooks';
import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

import { AddressBalanceGroup } from './components/address-balance-group';
import { tooltipTextMap } from './utils';

type BitcoinBalanceCategory = 'available' | 'unavailable' | 'pending' | 'runes';

const validCategories = ['available', 'unavailable', 'pending', 'runes'] as const;

const categoryTitles: Record<BitcoinBalanceCategory, string> = {
  available: 'Available to transfer',
  unavailable: 'Unavailable to transfer',
  pending: 'Pending',
  runes: 'BTC in Runes',
};

const categoryTooltips: Record<BitcoinBalanceCategory, string> = {
  available: tooltipTextMap.btcAvailable,
  unavailable: tooltipTextMap.btcUnavailable,
  pending: tooltipTextMap.btcPending,
  runes: tooltipTextMap.runes,
};

function isValidCategory(value: string): value is BitcoinBalanceCategory {
  return (validCategories as readonly string[]).includes(value);
}

function getAddressType(address: string): string {
  const addressInfo = getAddressInfo(address);
  if (addressInfo.type === AddressType.p2wpkh) {
    return 'Native Segwit';
  }
  if (addressInfo.type === AddressType.p2tr) {
    return 'Taproot';
  }
  return 'Unknown';
}

function groupUtxosByAddress(utxos: OwnedUtxo[]): Map<string, OwnedUtxo[]> {
  const groups = new Map<string, OwnedUtxo[]>();
  for (const utxo of utxos) {
    const existing = groups.get(utxo.address) ?? [];
    existing.push(utxo);
    groups.set(utxo.address, existing);
  }
  return groups;
}

export function AllBalancesDetail() {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const { isLoading, utxos } = useCurrentUtxos();
  const calculateFiatValue = useCalculateBitcoinFiatValue();

  const categoryUtxos = useMemo(() => {
    if (!category || !isValidCategory(category)) return [];
    switch (category) {
      case 'available':
        return utxos.available;
      case 'unavailable':
        return utxos.unspendable;
      case 'pending':
        return utxos.inbound;
      case 'runes':
        return utxos.protected;
      default:
        return [];
    }
  }, [category, utxos]);

  const addressGroups = useMemo(() => groupUtxosByAddress(categoryUtxos), [categoryUtxos]);

  const totalSats = useMemo(
    () => categoryUtxos.reduce((sum, u) => sum + u.value, 0),
    [categoryUtxos]
  );

  if (!category || !isValidCategory(category)) {
    void navigate(RouteUrls.AllBalances);
    return null;
  }

  if (isLoading) {
    return <LoadingSpinner height="100vh" />;
  }

  const totalBtc = createMoney(totalSats, 'BTC');
  const totalFiat = calculateFiatValue(totalBtc);
  const title = categoryTitles[category];
  const tooltipText = categoryTooltips[category];

  return (
    <Flex
      height="100vh"
      direction="column"
      data-testid={AllBalancesSelectors.AllBalancesDetailPage}
    >
      <Header px="space.04">
        <HeaderGrid
          leftCol={<HeaderBackButton dataTestId={AllBalancesSelectors.DetailBackButton} />}
          centerCol={<styled.span textStyle="heading.05">All balances</styled.span>}
        />
      </Header>
      <Content>
        <Flex direction="column" width="100%" px="space.05" pb="space.05">
          <Flex justifyContent="space-between" alignItems="flex-start" pt="space.04">
            <Stack gap="space.01">
              <Flex alignItems="center" gap="space.01">
                <styled.span textStyle="label.02">{title}</styled.span>
                <BasicTooltip label={tooltipText} side="top">
                  <InfoCircleIcon variant="small" />
                </BasicTooltip>
              </Flex>
              <styled.span textStyle="heading.03">{formatCurrency(totalFiat)}</styled.span>
              <styled.span textStyle="caption.01" color="ink.text-subdued">
                {formatCurrency(totalBtc)} across {addressGroups.size}{' '}
                {addressGroups.size === 1 ? 'address' : 'addresses'}
              </styled.span>
            </Stack>
            <BtcAvatarIcon />
          </Flex>
          {[...addressGroups.entries()].map(([address, utxoList]) => {
            const addressSats = utxoList.reduce((sum, u) => sum + u.value, 0);
            const addressBtc = createMoney(addressSats, 'BTC');
            const addressFiat = calculateFiatValue(addressBtc);

            return (
              <AddressBalanceGroup
                key={address}
                addressType={getAddressType(address)}
                address={address}
                fiatValue={formatCurrency(addressFiat)}
                cryptoValue={formatCurrency(addressBtc)}
                utxos={utxoList.map(utxo => {
                  const utxoBtc = createMoney(utxo.value, 'BTC');
                  const utxoFiat = calculateFiatValue(utxoBtc);
                  return {
                    label: `UTXO #${utxo.txid.substring(0, 6)}:${utxo.vout}`,
                    sats: `${utxo.value} sats`,
                    fiatValue: formatCurrency(utxoFiat),
                  };
                })}
              />
            );
          })}
        </Flex>
      </Content>
    </Flex>
  );
}
