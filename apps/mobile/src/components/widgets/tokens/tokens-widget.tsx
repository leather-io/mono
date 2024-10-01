import React from 'react';

import { t } from '@lingui/macro';

import { Flag, ItemLayout } from '@leather.io/ui/native';
import { formatMoney } from '@leather.io/utils';

import { FiatBalance } from '../components/balance/fiat-balance';
import { TokenBalance } from '../components/balance/token-balance';
import { Widget, WidgetHeader } from '../components/widget';
import { type Token } from './tokens.mocks';

interface TokensWidgetProps {
  tokens: Token[];
  totalBalance: string;
}

function showChain(chain: string) {
  if (chain === 'Stacks blockchain' || chain === 'Bitcoin blockchain') return '';
  return chain;
}

export function TokensWidget({ tokens, totalBalance }: TokensWidgetProps) {
  return (
    <Widget header={<WidgetHeader title={t`My tokens`} totalBalance={totalBalance} />}>
      {tokens.map(
        ({
          availableBalance: { availableBalance },
          icon,
          tokenName,
          ticker,
          chain,
          fiatBalance,
        }) => (
          <Flag key={ticker} img={icon} align="middle" spacing="1" reverse={false}>
            <ItemLayout
              titleLeft={tokenName}
              titleRight={
                availableBalance && <TokenBalance balance={formatMoney(availableBalance)} />
              }
              captionLeft={showChain(chain)}
              captionRight={<FiatBalance balance={fiatBalance} color="ink.text-subdued" />}
            />
          </Flag>
        )
      )}
    </Widget>
  );
}
