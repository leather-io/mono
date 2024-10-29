import {
  BitcoinBalance,
  BitcoinBalanceByAccount,
} from '@/features/balances/bitcoin/bitcoin-balance';
import { TokenBalance } from '@/features/balances/token-balance';
import { AccountId } from '@/models/domain.model';
import { HasChildren } from '@/utils/types';
import { t } from '@lingui/macro';

import { getMockTokens } from '../../../mocks/tokens.mocks';
import { Widget, WidgetHeader } from '../components/widget';

export function showChain(chain: string) {
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
  return <BitcoinBalanceByAccount fingerprint={fingerprint} accountIndex={accountIndex} />;
}
