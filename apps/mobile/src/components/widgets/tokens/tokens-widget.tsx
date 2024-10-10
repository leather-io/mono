import React, { ReactNode } from 'react';

import { AccountId } from '@/models/domain.model';
import {
  useBitcoinAccountTotalBitcoinBalance,
  useWalletTotalBitcoinBalance,
} from '@/queries/balance/bitcoin-balance.query';
import { HasChildren } from '@/utils/types';
import { t } from '@lingui/macro';

import { Money } from '@leather.io/models';
import { BtcAvatarIcon, Flag, ItemLayout } from '@leather.io/ui/native';

import { getMockTokens } from '../../../mocks/tokens.mocks';
import { Balance } from '../../balance/balance';
import { Widget, WidgetHeader } from '../components/widget';

function showChain(chain: string) {
  if (chain === 'Stacks blockchain' || chain === 'Bitcoin blockchain') return;
  return chain;
}

export function TokensWidget({ children }: HasChildren) {
  return (
    <Widget
      header={<WidgetHeader title={t({ id: 'tokens.header_title', message: 'My tokens' })} />}
    >
      {children}
    </Widget>
  );
}

export function AllAccountBalances() {
  return (
    <>
      <BitcoinBalance />

      {getMockTokens().map(
        ({
          availableBalance: { availableBalance },
          icon,
          tokenName,
          ticker,
          chain,
          fiatBalance,
        }) => (
          <TokenBalance
            key={ticker}
            availableBalance={availableBalance}
            icon={icon}
            ticker={ticker}
            tokenName={tokenName}
            chain={chain}
            fiatBalance={fiatBalance}
            showChain={showChain}
          />
        )
      )}
    </>
  );
}

export function AccountBalances({ fingerprint, accountIndex }: AccountId) {
  return (
    <>
      <BitcoinBalanceByAccount fingerprint={fingerprint} accountIndex={accountIndex} />
    </>
  );
}

interface BitcoinTokenBalanceProps {
  availableBalance: Money;
  fiatBalance: Money;
}
export function BitcoinTokenBalance({ availableBalance, fiatBalance }: BitcoinTokenBalanceProps) {
  return (
    <TokenBalance
      ticker="BTC"
      icon={<BtcAvatarIcon />}
      tokenName={t`Bitcoin`}
      chain={t`Bitcoin blockchain`}
      fiatBalance={fiatBalance}
      showChain={showChain}
      availableBalance={availableBalance}
    />
  );
}

export function BitcoinBalance() {
  const { availableBalance, fiatBalance } = useWalletTotalBitcoinBalance();
  return <BitcoinTokenBalance availableBalance={availableBalance} fiatBalance={fiatBalance} />;
}

export function BitcoinBalanceByAccount(props: AccountId) {
  const { availableBalance, fiatBalance } = useBitcoinAccountTotalBitcoinBalance(props);
  return <BitcoinTokenBalance availableBalance={availableBalance} fiatBalance={fiatBalance} />;
}

interface TokenBalanceProps {
  ticker: string;
  icon: ReactNode;
  tokenName: string;
  availableBalance?: Money;
  chain: string;
  fiatBalance: Money;
  showChain: (chain: string) => React.ReactNode;
}
export function TokenBalance({
  ticker,
  icon,
  tokenName,
  availableBalance,
  chain,
  fiatBalance,
  showChain,
}: TokenBalanceProps) {
  return (
    <Flag key={ticker} img={icon} align="middle" spacing="1" reverse={false}>
      <ItemLayout
        titleLeft={tokenName}
        titleRight={availableBalance && <Balance balance={availableBalance} />}
        captionLeft={showChain(chain)}
        captionRight={<Balance balance={fiatBalance} color="ink.text-subdued" />}
      />
    </Flag>
  );
}
