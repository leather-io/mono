import { useNavigate } from 'react-router';

import { Flex, styled } from 'leather-styles/jsx';

import { BtcAvatarIcon, StxAvatarIcon } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';

import { Content } from '@app/components/layout';
import { Divider } from '@app/components/layout/divider';
import { Header } from '@app/components/layout/headers/header';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';

import { BalanceRow } from './components/balance-row';
import { ProtocolSection } from './components/protocol-section';
import { TotalBalanceHeader } from './components/total-balance-header';
import { mockAllBalancesData } from './mock-data';

export function AllBalancesPage() {
  const navigate = useNavigate();
  const { bitcoin, stacks } = mockAllBalancesData;

  return (
    <Flex height="100vh" direction="column">
      <Header px="space.04">
        <HeaderGrid
          leftCol={<HeaderBackButton />}
          centerCol={
            <styled.span textStyle="heading.05">All balances</styled.span>
          }
        />
      </Header>
      <Content>
        <Flex direction="column" width="100%" px="space.05">
          <TotalBalanceHeader
            label="Total balance"
            totalFiatBalance={mockAllBalancesData.totalFiatBalance}
          />
          <Divider />
          <ProtocolSection
            label={bitcoin.label}
            totalFiatValue={bitcoin.totalFiatValue}
            summary={bitcoin.summary}
            icon={<BtcAvatarIcon />}
          >
            {bitcoin.sections.map(section => (
              <BalanceRow
                key={section.category}
                label={section.label}
                fiatValue={section.fiatValue}
                cryptoValue={section.cryptoValue}
                showChevron
                onClick={() => navigate(`${RouteUrls.AllBalances}/${section.category}`)}
              />
            ))}
          </ProtocolSection>
          <Divider />
          <ProtocolSection
            label={stacks.label}
            totalFiatValue={stacks.totalFiatValue}
            summary={stacks.summary}
            isLoading={stacks.isLoading}
            warningMessage={stacks.hasNetworkWarning ? stacks.warningMessage : undefined}
            icon={<StxAvatarIcon />}
          >
            {stacks.sections.map(section => (
              <BalanceRow
                key={section.label}
                label={section.label}
                fiatValue={section.fiatValue}
                cryptoValue={section.cryptoValue}
                showInfoIcon
              />
            ))}
          </ProtocolSection>
        </Flex>
      </Content>
    </Flex>
  );
}
