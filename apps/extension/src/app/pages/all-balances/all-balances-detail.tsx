import { useNavigate, useParams } from 'react-router';

import { Flex, Stack, styled } from 'leather-styles/jsx';

import { ArrowLeftIcon, BtcAvatarIcon, InfoCircleIcon } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';

import { Content } from '@app/components/layout';
import { Header } from '@app/components/layout/headers/header';
import { HeaderActionButton } from '@app/components/layout/headers/header-action-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';

import { AddressBalanceGroup } from './components/address-balance-group';
import { type BitcoinBalanceCategory, mockAllBalancesData } from './mock-data';

const validCategories = ['available', 'unavailable', 'pending', 'runes'] as const;

function isValidCategory(value: string): value is BitcoinBalanceCategory {
  return (validCategories as readonly string[]).includes(value);
}

export function AllBalancesDetail() {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();

  if (!category || !isValidCategory(category)) {
    void navigate(RouteUrls.AllBalances);
    return null;
  }

  const detailData = mockAllBalancesData.bitcoinDetails[category];

  return (
    <Flex height="100vh" direction="column">
      <Header px="space.04">
        <HeaderGrid
          leftCol={
            <HeaderActionButton
              icon={<ArrowLeftIcon />}
              onAction={() => navigate(RouteUrls.AllBalances)}
              dataTestId="all-balances-detail-back"
            />
          }
          centerCol={<styled.span textStyle="heading.05">All balances</styled.span>}
        />
      </Header>
      <Content>
        <Flex direction="column" width="100%" px="space.05" pb="space.05">
          <Flex justifyContent="space-between" alignItems="flex-start" pt="space.04">
            <Stack gap="space.01">
              <Flex alignItems="center" gap="space.01">
                <styled.span textStyle="label.02">{detailData.title}</styled.span>
                <InfoCircleIcon variant="small" />
              </Flex>
              <styled.span textStyle="heading.03">{detailData.totalFiatValue}</styled.span>
              <styled.span textStyle="caption.01" color="ink.text-subdued">
                {detailData.totalCryptoValue} across {detailData.addressCount}{' '}
                {detailData.addressCount === 1 ? 'address' : 'addresses'}
              </styled.span>
            </Stack>
            <BtcAvatarIcon />
          </Flex>
          {detailData.addressGroups.map((group, index) => (
            <AddressBalanceGroup key={index} group={group} />
          ))}
        </Flex>
      </Content>
    </Flex>
  );
}
