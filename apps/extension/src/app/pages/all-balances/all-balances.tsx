import { Fragment } from 'react';
import { useNavigate } from 'react-router';

import { AllBalancesSelectors } from '@tests/selectors/all-balances.selectors';
import { BondsSelectors } from '@tests/selectors/bonds.selectors';
import { Box, Flex, styled } from 'leather-styles/jsx';

import { stxAsset } from '@leather.io/constants';
import type { Money } from '@leather.io/models';
import { BtcAvatarIcon, StxAvatarIcon, isSbtcAsset } from '@leather.io/ui';
import { baseCurrencyAmountInQuote, createMoney, sumMoney } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { formatCurrency } from '@app/common/currency-formatter';
import { useViewportMinWidth } from '@app/common/hooks/use-media-query';
import { emptyAmountPlaceholder } from '@app/components/balance/constants';
import { Content } from '@app/components/layout';
import { Divider } from '@app/components/layout/divider';
import { Header } from '@app/components/layout/headers/header';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import {
  bondLockedBtc,
  bondLockedStx,
  hasActiveBond,
  subtractMoneyFloor,
} from '@app/features/bonds/bond-position.utils';
import { inBondLabel, inBondTooltip } from '@app/features/bonds/bonds.constants';
import { useBondLockedBtcQuote, useBondPosition } from '@app/features/bonds/use-bond-position';
import { useBtcAccountBalance } from '@app/query/bitcoin/balance/btc-balance.hooks';
import { useMarketData } from '@app/query/common/market-data/market-data.query';
import { useStxAccountBalance } from '@app/query/stacks/balance/stx-balance.hooks';
import { useSip10AccountBalance } from '@app/query/stacks/sip10/sip10-balance.hooks';
import { useCurrentAccountId } from '@app/store/accounts/account';

import {
  btcBalanceCategories,
  btcBalanceCategoryMap,
  formatBalance,
  tooltipTextMap,
} from './all-balances.utils';
import { BalanceRow } from './components/balance-row';
import { ProtocolSection } from './components/protocol-section';
import { TotalBalanceHeader } from './components/total-balance-header';

const zeroQuoteBalance = createMoney(0, 'USD');

function addMoney(base?: Money, extra?: Money): Money | undefined {
  if (!base) return undefined;
  if (!extra) return base;
  return createMoney(base.amount.plus(extra.amount), base.symbol);
}

export function AllBalancesPage() {
  const navigate = useNavigate();
  const accountId = useCurrentAccountId();
  const isMd = useViewportMinWidth('md');

  const btcBalance = useBtcAccountBalance(accountId);
  const stxBalance = useStxAccountBalance(accountId);
  const sip10Balance = useSip10AccountBalance(accountId);
  const stxMarketData = useMarketData(stxAsset);

  const bond = useBondPosition();
  const bondCtx = bond.state === 'success' ? bond.value : undefined;
  const activeBond = hasActiveBond(bondCtx) ? bondCtx : undefined;
  const bondBtc = activeBond ? bondLockedBtc(activeBond.position) : undefined;
  const bondBtcQuote = useBondLockedBtcQuote(activeBond?.position);
  const bondStx = activeBond ? bondLockedStx(activeBond.position) : undefined;

  function toStxQuote(money?: Money): Money | undefined {
    if (!money || stxMarketData.state !== 'success') return undefined;
    return baseCurrencyAmountInQuote(money, stxMarketData.value);
  }

  const bondStxQuote = toStxQuote(bondStx);

  const btc = btcBalance.state === 'success' ? btcBalance.value : undefined;
  const stx = stxBalance.state === 'success' ? stxBalance.value : undefined;
  const sip10 = sip10Balance.state === 'success' ? sip10Balance.value : undefined;

  const isBtcLoading = btcBalance.state === 'loading';
  const isStxLoading = stxBalance.state === 'loading';
  const isSip10Loading = sip10Balance.state === 'loading';

  const isStacksLoading = isStxLoading || isSip10Loading;
  const isTotalLoading = isBtcLoading || isStacksLoading;

  const sbtcToken = sip10?.sip10s.find(token => isSbtcAsset(token.asset.contractId));
  const otherSip10Tokens = sip10?.sip10s.filter(token => !isSbtcAsset(token.asset.contractId));

  // Bonded BTC sits in a policy address the balance service doesn't scan yet,
  // so it's added on top here to keep the section summing to its rows.
  const btcTotal = addMoney(btc?.btc.totalBalance, bondBtc);
  const btcTotalQuote = addMoney(btc?.quote.totalBalance, bondBtcQuote);

  // STX locked for any reason other than the bond, e.g. solo or pooled stacking
  const otherLockedStx =
    stx && bondStx ? subtractMoneyFloor(stx.stx.lockedBalance, bondStx) : stx?.stx.lockedBalance;
  const otherLockedStxQuote = bondStx ? toStxQuote(otherLockedStx) : stx?.quote.lockedBalance;
  const showOtherLockedStx = !activeBond || (otherLockedStx?.amount.isGreaterThan(0) ?? false);

  const totalFiatBalance =
    btcTotalQuote && stx && sip10
      ? formatCurrency(sumMoney([btcTotalQuote, stx.quote.totalBalance, sip10.quote.totalBalance]))
      : emptyAmountPlaceholder;

  const stacksFiatBalance =
    stx && sip10
      ? formatCurrency(sumMoney([stx.quote.totalBalance, sip10.quote.totalBalance]))
      : emptyAmountPlaceholder;

  const sip10FiatBalance = otherSip10Tokens
    ? formatCurrency(
        otherSip10Tokens.length
          ? sumMoney(otherSip10Tokens.map(token => token.quote.totalBalance))
          : zeroQuoteBalance
      )
    : emptyAmountPlaceholder;

  const sip10TokenCount = otherSip10Tokens
    ? `${otherSip10Tokens.length} ${otherSip10Tokens.length === 1 ? 'token' : 'tokens'}`
    : emptyAmountPlaceholder;

  const endToEndDivider = (
    <Box mx={isMd ? 'space.00' : '-space.05'}>
      <Divider />
    </Box>
  );

  function goToBond() {
    void navigate(RouteUrls.BondDetail);
  }

  return (
    <Flex height="100vh" direction="column" data-testid={AllBalancesSelectors.AllBalancesPage}>
      <Header px="space.04">
        <HeaderGrid
          leftCol={<HeaderBackButton />}
          centerCol={<styled.span textStyle="heading.05">All balances</styled.span>}
        />
      </Header>
      <Content>
        <Flex direction="column" width="100%" height="100%" overflowY="auto" px="space.05">
          <TotalBalanceHeader
            label="Total balance"
            totalFiatBalance={totalFiatBalance}
            isLoading={isTotalLoading}
            tooltipText={tooltipTextMap.totalBalance}
            dataTestId={AllBalancesSelectors.TotalBalance}
          />
          {endToEndDivider}
          <ProtocolSection
            label="Bitcoin protocol"
            totalFiatValue={formatBalance(btcTotalQuote)}
            summary={formatBalance(btcTotal)}
            isLoading={isBtcLoading}
            icon={<BtcAvatarIcon />}
            tooltipText={tooltipTextMap.btcProtocol}
            dataTestId={AllBalancesSelectors.BitcoinProtocolSection}
          >
            {btcBalanceCategories.map(category => {
              const { balanceKey, title, tooltipText, dataTestId } =
                btcBalanceCategoryMap[category];
              return (
                <Fragment key={category}>
                  <BalanceRow
                    label={title}
                    fiatValue={formatBalance(btc?.quote[balanceKey])}
                    cryptoValue={formatBalance(btc?.btc[balanceKey])}
                    isLoading={isBtcLoading}
                    dataTestId={dataTestId}
                    tooltipText={tooltipText}
                    onClick={() =>
                      navigate(RouteUrls.AllBalancesDetail.replace(':category', category))
                    }
                  />
                  {category === 'available' && activeBond && (
                    <BalanceRow
                      label={inBondLabel}
                      fiatValue={formatBalance(bondBtcQuote)}
                      cryptoValue={formatBalance(bondBtc)}
                      isLoading={isBtcLoading}
                      dataTestId={BondsSelectors.BalanceRowBtcInBond}
                      tooltipText={inBondTooltip}
                      onClick={goToBond}
                    />
                  )}
                </Fragment>
              );
            })}
          </ProtocolSection>
          {endToEndDivider}
          <ProtocolSection
            label="Stacks protocol"
            totalFiatValue={stacksFiatBalance}
            summary={formatBalance(stx?.stx.totalBalance)}
            isLoading={isStacksLoading}
            icon={<StxAvatarIcon />}
            tooltipText={tooltipTextMap.stacksProtocol}
            dataTestId={AllBalancesSelectors.StacksProtocolSection}
          >
            <BalanceRow
              label="STX available to transfer"
              fiatValue={formatBalance(stx?.quote.availableUnlockedBalance)}
              cryptoValue={formatBalance(stx?.stx.availableUnlockedBalance)}
              isLoading={isStxLoading}
              dataTestId={AllBalancesSelectors.BalanceRowStxAvailable}
              tooltipText={tooltipTextMap.stxAvailable}
            />
            {activeBond && (
              <BalanceRow
                label={inBondLabel}
                fiatValue={formatBalance(bondStxQuote)}
                cryptoValue={formatBalance(bondStx)}
                isLoading={isStxLoading}
                dataTestId={BondsSelectors.BalanceRowStxInBond}
                tooltipText={inBondTooltip}
                onClick={goToBond}
              />
            )}
            {showOtherLockedStx && (
              <BalanceRow
                label="STX locked"
                fiatValue={formatBalance(otherLockedStxQuote)}
                cryptoValue={formatBalance(otherLockedStx)}
                isLoading={isStxLoading}
                dataTestId={AllBalancesSelectors.BalanceRowStxLocked}
                tooltipText={tooltipTextMap.stxLocked}
              />
            )}
            <BalanceRow
              label="STX pending"
              fiatValue={formatBalance(stx?.quote.inboundBalance)}
              cryptoValue={formatBalance(stx?.stx.inboundBalance)}
              isLoading={isStxLoading}
              dataTestId={AllBalancesSelectors.BalanceRowStxPending}
              tooltipText={tooltipTextMap.stxPending}
            />
            <BalanceRow
              label="SIP-10 tokens"
              fiatValue={sip10FiatBalance}
              cryptoValue={sip10TokenCount}
              isLoading={isSip10Loading}
              dataTestId={AllBalancesSelectors.BalanceRowSip10}
              tooltipText={tooltipTextMap.sip10}
            />
            {sbtcToken && (
              <BalanceRow
                label="sBTC"
                fiatValue={formatCurrency(sbtcToken.quote.totalBalance)}
                cryptoValue={formatCurrency(sbtcToken.crypto.totalBalance)}
                dataTestId={AllBalancesSelectors.BalanceRowSbtc}
                tooltipText={tooltipTextMap.sbtc}
              />
            )}
          </ProtocolSection>
        </Flex>
      </Content>
    </Flex>
  );
}
