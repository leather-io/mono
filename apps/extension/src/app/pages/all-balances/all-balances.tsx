import { useMemo } from 'react';
import { useNavigate } from 'react-router';

import { AllBalancesSelectors } from '@tests/selectors/all-balances.selectors';
import { Box, Flex, styled } from 'leather-styles/jsx';

import { ArrowLeftIcon, BtcAvatarIcon, StxAvatarIcon } from '@leather.io/ui';
import { createMoney, subtractMoney, sumMoney } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { formatCurrency } from '@app/common/currency-formatter';
import { useViewportMinWidth } from '@app/common/hooks/use-media-query';
import { Content } from '@app/components/layout';
import { Divider } from '@app/components/layout/divider';
import { Header } from '@app/components/layout/headers/header';
import { HeaderActionButton } from '@app/components/layout/headers/header-action-button';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import { LoadingSpinner } from '@app/components/loading-spinner';
import { useBtcAccountBalance } from '@app/query/bitcoin/balance/btc-balance.hooks';
import { useRunesAccountBalance } from '@app/query/bitcoin/runes/runes-balance.query';
import { useStxAccountBalance } from '@app/query/stacks/balance/stx-balance.hooks';
import { useSip10AccountBalance } from '@app/query/stacks/sip10/sip10-balance.hooks';
import { useCurrentAccountId } from '@app/store/accounts/account';

import { BalanceRow } from './components/balance-row';
import { ProtocolSection } from './components/protocol-section';
import { TotalBalanceHeader } from './components/total-balance-header';
import { tooltipTextMap } from './utils';

const sbtcContractPrefixes = [
  'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',
  'SNGWPN3XDAQE673MXYXF81016M50NHF5X5PWWM70.sbtc-token',
];

function isSbtcAsset(contractId: string) {
  return sbtcContractPrefixes.some(prefix => contractId.startsWith(prefix));
}

export function AllBalancesPage() {
  const navigate = useNavigate();
  const accountId = useCurrentAccountId();
  const isMd = useViewportMinWidth('md');

  const btcBalance = useBtcAccountBalance(accountId);
  const stxBalance = useStxAccountBalance(accountId);
  const sip10Balance = useSip10AccountBalance(accountId);
  const runesBalance = useRunesAccountBalance(accountId);

  const isLoading =
    btcBalance.state === 'loading' ||
    stxBalance.state === 'loading' ||
    sip10Balance.state === 'loading' ||
    runesBalance.state === 'loading';

  const sbtcToken = useMemo(() => {
    if (sip10Balance.state !== 'success') return null;
    return sip10Balance.value.sip10s.find(t => isSbtcAsset(t.asset.contractId)) ?? null;
  }, [sip10Balance]);

  const sip10QuoteTotal = useMemo(() => {
    if (sip10Balance.state !== 'success') return createMoney(0, 'USD');
    const nonSbtc = sip10Balance.value.sip10s.filter(t => !isSbtcAsset(t.asset.contractId));
    if (nonSbtc.length === 0) return createMoney(0, 'USD');
    return sumMoney(nonSbtc.map(t => t.quote.totalBalance));
  }, [sip10Balance]);

  if (isLoading) {
    return <LoadingSpinner height="100vh" />;
  }

  const btc = btcBalance.value;
  const stx = stxBalance.value;
  const runes = runesBalance.value;

  if (!btc || !stx) return null;

  const totalFiat = sumMoney([
    btc.quote.totalBalance,
    stx.quote.totalBalance,
    sip10Balance.value?.quote.totalBalance ?? createMoney(0, 'USD'),
    runes?.quote.totalBalance ?? createMoney(0, 'USD'),
  ]);

  const endToEndDivider = (
    <Box mx={isMd ? 'space.00' : '-space.05'}>
      <Divider />
    </Box>
  );

  return (
    <Flex height="100vh" direction="column" data-testid={AllBalancesSelectors.AllBalancesPage}>
      <Header px="space.04">
        <HeaderGrid
          leftCol={<HeaderBackButton dataTestId={AllBalancesSelectors.BackButton} />}
          centerCol={<styled.span textStyle="heading.05">All balances</styled.span>}
        />
      </Header>
      <Content>
        <Flex direction="column" width="100%" px="space.05">
          <TotalBalanceHeader
            label="Total balance"
            totalFiatBalance={formatCurrency(totalFiat)}
            tooltipText={tooltipTextMap.totalBalance}
          />
          {endToEndDivider}
          <ProtocolSection
            label="Bitcoin protocol"
            totalFiatValue={formatCurrency(
              sumMoney([btc.quote.totalBalance, runes?.quote.totalBalance ?? createMoney(0, 'USD')])
            )}
            summary={formatCurrency(btc.btc.totalBalance)}
            icon={<BtcAvatarIcon />}
            tooltipText={tooltipTextMap.btcProtocol}
          >
            <BalanceRow
              label="Available to transfer"
              fiatValue={formatCurrency(btc.quote.availableBalance)}
              cryptoValue={formatCurrency(btc.btc.availableBalance)}
              dataTestId={AllBalancesSelectors.BalanceRowAvailable}
              showChevron
              onClick={() => navigate(`${RouteUrls.AllBalances}/available`)}
              tooltipText={tooltipTextMap.btcAvailable}
            />
            <BalanceRow
              label="Unavailable to transfer"
              fiatValue={formatCurrency(btc.quote.unspendableBalance)}
              cryptoValue={formatCurrency(btc.btc.unspendableBalance)}
              dataTestId={AllBalancesSelectors.BalanceRowUnavailable}
              showChevron
              onClick={() => navigate(`${RouteUrls.AllBalances}/unavailable`)}
              tooltipText={tooltipTextMap.btcUnavailable}
            />
            <BalanceRow
              label="Pending"
              fiatValue={formatCurrency(btc.quote.inboundBalance)}
              cryptoValue={formatCurrency(btc.btc.inboundBalance)}
              dataTestId={AllBalancesSelectors.BalanceRowPending}
              showChevron
              onClick={() => navigate(`${RouteUrls.AllBalances}/pending`)}
              tooltipText={tooltipTextMap.btcPending}
            />
            <BalanceRow
              label="Runes"
              fiatValue={formatCurrency(runes?.quote.totalBalance ?? createMoney(0, 'USD'))}
              cryptoValue={
                runes?.runes.length
                  ? `${runes.runes.length} rune${runes.runes.length === 1 ? '' : 's'}`
                  : '0 runes'
              }
              dataTestId={AllBalancesSelectors.BalanceRowRunes}
              showChevron
              onClick={() => navigate(`${RouteUrls.AllBalances}/runes`)}
              tooltipText={tooltipTextMap.runes}
            />
          </ProtocolSection>
          {endToEndDivider}
          <ProtocolSection
            label="Stacks protocol"
            totalFiatValue={formatCurrency(
              sumMoney([
                stx.quote.totalBalance,
                sip10Balance.value?.quote.totalBalance ?? createMoney(0, 'USD'),
              ])
            )}
            summary={formatCurrency(stx.stx.totalBalance)}
            icon={<StxAvatarIcon />}
            tooltipText={tooltipTextMap.stacksProtocol}
          >
            <BalanceRow
              label="STX available to transfer"
              fiatValue={formatCurrency(stx.quote.availableUnlockedBalance)}
              cryptoValue={formatCurrency(stx.stx.availableUnlockedBalance)}
              tooltipText={tooltipTextMap.stxAvailable}
            />
            <BalanceRow
              label="STX locked"
              fiatValue={formatCurrency(stx.quote.lockedBalance)}
              cryptoValue={formatCurrency(stx.stx.lockedBalance)}
              tooltipText={tooltipTextMap.stxLocked}
            />
            <BalanceRow
              label="STX Pending"
              fiatValue={formatCurrency(stx.quote.inboundBalance)}
              cryptoValue={formatCurrency(stx.stx.inboundBalance)}
              tooltipText={tooltipTextMap.stxPending}
            />
            <BalanceRow
              label="SIP 10"
              fiatValue={formatCurrency(sip10QuoteTotal)}
              cryptoValue={
                sip10Balance.value
                  ? `${sip10Balance.value.sip10s.filter(t => !isSbtcAsset(t.asset.contractId)).length} tokens`
                  : '0 tokens'
              }
              tooltipText={tooltipTextMap.sip10}
            />
            {sbtcToken && (
              <>
                <BalanceRow
                  label="sBTC available to transfer"
                  fiatValue={formatCurrency(sbtcToken.quote.availableBalance)}
                  cryptoValue={formatCurrency(sbtcToken.crypto.availableBalance)}
                  tooltipText={tooltipTextMap.sbtcAvailable}
                />
                <BalanceRow
                  label="sBTC locked"
                  fiatValue={formatCurrency(
                    subtractMoney(sbtcToken.quote.totalBalance, sbtcToken.quote.availableBalance)
                  )}
                  cryptoValue={formatCurrency(
                    subtractMoney(sbtcToken.crypto.totalBalance, sbtcToken.crypto.availableBalance)
                  )}
                  tooltipText={tooltipTextMap.sbtcLocked}
                />
                <BalanceRow
                  label="sBTC Pending"
                  fiatValue={formatCurrency(sbtcToken.quote.inboundBalance)}
                  cryptoValue={formatCurrency(
                    createMoney(
                      sbtcToken.crypto.inboundBalance.amount,
                      sbtcToken.crypto.totalBalance.symbol,
                      sbtcToken.crypto.totalBalance.decimals
                    )
                  )}
                  tooltipText={tooltipTextMap.sbtcPending}
                />
              </>
            )}
          </ProtocolSection>
        </Flex>
      </Content>
    </Flex>
  );
}
